/**
 * Viewer session — gates the public directory behind a single shared
 * DIRECTORY_PASSWORD. Issues a JWT-cookie ("kind: viewer") that the
 * middleware checks before serving /.
 *
 * Distinct from the admin session in src/lib/auth-helpers.ts:
 *   - Different cookie name so admin + viewer sessions don't collide
 *   - Different kind claim so a viewer JWT can never be replayed as admin
 *   - Long-lived (30 days) since viewers don't expect to re-auth often
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'

const VIEWER_KIND = 'viewer'
const VIEWER_DURATION_SEC = 30 * 24 * 60 * 60 // 30 days

const IS_PROD = process.env.NODE_ENV === 'production'
export const VIEWER_COOKIE_NAME = IS_PROD
  ? '__Host-directory-viewer'
  : 'directory-viewer'

// Same lazy-loaded secret strategy as auth-helpers so `next build` doesn't
// require env vars to be present at build time.
let cachedSecret: Uint8Array | null = null
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret
  const raw = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET
  if (!raw || raw.length < 16) {
    throw new Error('SESSION_SECRET (or NEXTAUTH_SECRET) must be set to a secure value')
  }
  cachedSecret = new TextEncoder().encode(raw)
  return cachedSecret
}

/**
 * Constant-time compare against DIRECTORY_PASSWORD. Returns true on match,
 * false on mismatch or missing env var.
 */
export function checkDirectoryPassword(provided: string): boolean {
  const expected = process.env.DIRECTORY_PASSWORD
  if (!expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function createViewerToken(): Promise<string> {
  return new SignJWT({ kind: VIEWER_KIND })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${VIEWER_DURATION_SEC}s`)
    .sign(getSecret())
}

export async function setViewerCookie(): Promise<void> {
  const token = await createViewerToken()
  const cookieStore = await cookies()
  cookieStore.set(VIEWER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: VIEWER_DURATION_SEC,
    path: '/',
  })
}

export async function clearViewerCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(VIEWER_COOKIE_NAME)
}

/**
 * Verify a viewer token. Returns true only if the JWT is valid AND the
 * payload `kind` is "viewer" (so an admin JWT can't be swapped in).
 */
export async function verifyViewerToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.kind === VIEWER_KIND
  } catch {
    return false
  }
}

/**
 * Middleware-safe check: reads cookie from the NextRequest and verifies it.
 */
export async function hasViewerSession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(VIEWER_COOKIE_NAME)
  if (!cookie) return false
  return verifyViewerToken(cookie.value)
}
