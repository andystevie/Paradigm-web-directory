/**
 * Postgres-backed sliding-window rate limiter. Each rate-limited request
 * inserts a row keyed by (name, identifier) and counts rows within the
 * window. Old rows are pruned for the same key on every call so the
 * table stays bounded.
 *
 * Why Postgres rather than an in-memory Map: Vercel serverless instances
 * each have their own process memory, so a Map limiter would only catch
 * single-instance bursts. The DB hop adds ~5-10ms per limited request,
 * which is fine on routes that aren't hot (login, sync, notify, etc.).
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from './db'

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`

const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
}

function parseWindow(w: Window): number {
  const [n, unit] = w.split(' ')
  return Number(n) * UNIT_MS[unit]
}

export interface Limiter {
  name: string
  max: number
  windowMs: number
}

export function getLimiter(name: string, max: number, window: Window): Limiter {
  return { name, max, windowMs: parseWindow(window) }
}

/**
 * Best-effort client identifier. Vercel sets X-Forwarded-For with the
 * client IP first; we strip whitespace and take the first entry. Falls
 * back to "unknown" so anonymous traffic still aggregates on one key.
 */
export function clientId(request: NextRequest, extra?: string): string {
  const fwd = request.headers.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || 'unknown'
  return extra ? `${ip}|${extra}` : ip
}

/**
 * Check + record a hit. Returns null when allowed, a 429 NextResponse when
 * the limit has been exceeded. Fails open on DB errors — we don't want a
 * Neon blip to take the whole site down.
 */
export async function enforce(
  limiter: Limiter,
  identifier: string
): Promise<NextResponse | null> {
  const key = `${limiter.name}:${identifier}`
  const cutoff = new Date(Date.now() - limiter.windowMs)

  try {
    const [, , count] = await prisma.$transaction([
      prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: cutoff } } }),
      prisma.rateLimitHit.create({ data: { key } }),
      prisma.rateLimitHit.count({ where: { key } }),
    ])

    if (count > limiter.max) {
      const oldest = await prisma.rateLimitHit.findFirst({
        where: { key },
        orderBy: { createdAt: 'asc' },
      })
      const retryAfter = oldest
        ? Math.max(1, Math.ceil((oldest.createdAt.getTime() + limiter.windowMs - Date.now()) / 1000))
        : Math.ceil(limiter.windowMs / 1000)
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
    return null
  } catch (e) {
    console.error('Rate limit DB error (fail-open):', e)
    return null
  }
}
