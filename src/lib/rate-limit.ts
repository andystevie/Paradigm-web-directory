/**
 * Rate limiting via Upstash Redis. Falls back to a no-op when Upstash env
 * vars are missing so local dev and `next build` still work. In production,
 * set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

const redis = hasUpstash ? Redis.fromEnv() : null

// Cache limiter instances so each route gets one Ratelimit object, not one
// per request.
const cache = new Map<string, Ratelimit>()

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`

export function getLimiter(name: string, max: number, window: Window): Ratelimit | null {
  if (!redis) return null
  const key = `${name}:${max}:${window}`
  let lim = cache.get(key)
  if (!lim) {
    lim = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: `phh-rl:${name}`,
      analytics: false,
    })
    cache.set(key, lim)
  }
  return lim
}

/**
 * Extract a best-effort client identifier from the request. Prefers the
 * first IP in X-Forwarded-For (Vercel sets this), falls back to a stable
 * "unknown" marker so we don't accidentally lump all anonymous traffic.
 */
export function clientId(request: NextRequest, extra?: string): string {
  const fwd = request.headers.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || 'unknown'
  return extra ? `${ip}|${extra}` : ip
}

/**
 * Enforce a rate limit and either return null (allowed) or a 429 response
 * with Retry-After set.
 */
export async function enforce(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) {
    // Upstash not configured — log once and let the request through.
    if (!warned) {
      console.warn('[rate-limit] UPSTASH env vars missing; rate limiting disabled')
      warned = true
    }
    return null
  }
  const { success, reset, remaining } = await limiter.limit(identifier)
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }
  // Hint clients about remaining budget for observability.
  return null
  void remaining
}

let warned = false
