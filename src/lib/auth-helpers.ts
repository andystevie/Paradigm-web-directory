import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { UserRole } from '@/types/admin'

// Fail closed: any code path that needs the secret will throw at request
// time if SESSION_SECRET (or its NEXTAUTH_SECRET alias) is unset, instead
// of silently using a guessable fallback key. Lazy so `next build` doesn't
// fail when env vars aren't injected during the build step.
let cachedSessionSecret: Uint8Array | null = null
function getSessionSecret(): Uint8Array {
  if (cachedSessionSecret) return cachedSessionSecret
  const raw = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET
  if (!raw || raw.length < 16) {
    throw new Error('SESSION_SECRET (or NEXTAUTH_SECRET) must be set to a secure value')
  }
  cachedSessionSecret = new TextEncoder().encode(raw)
  return cachedSessionSecret
}
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const BCRYPT_COST = 12

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT Session Management
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSessionSecret())

  return token
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, getSessionSecret())
    return verified.payload.user as SessionUser
  } catch (error) {
    return null
  }
}

// Cookie Management
// The `__Host-` prefix requires Secure, no Domain, and Path=/, and prevents
// sibling subdomains from overwriting the cookie — but browsers refuse to
// store Secure cookies over plain HTTP, which breaks `next dev`. Use the
// hardened name + secure: true in production, fall back to the legacy name
// in development. Reads accept either so existing sessions stay valid.
const IS_PROD = process.env.NODE_ENV === 'production'
export const SESSION_COOKIE_NAME = IS_PROD ? '__Host-admin-session' : 'admin-session'
const LEGACY_SESSION_COOKIE_NAME = 'admin-session'

export async function setSessionCookie(user: SessionUser) {
  const token = await createSession(user)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })
  // Clear any old-name cookie left over from the previous deploy.
  if (SESSION_COOKIE_NAME !== LEGACY_SESSION_COOKIE_NAME) {
    cookieStore.delete(LEGACY_SESSION_COOKIE_NAME)
  }
}

export async function getSessionFromCookie(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token =
    cookieStore.get(SESSION_COOKIE_NAME) ??
    cookieStore.get(LEGACY_SESSION_COOKIE_NAME)

  if (!token) {
    return null
  }

  return verifySession(token.value)
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME)
}

// Middleware helper
export function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token =
    request.cookies.get(SESSION_COOKIE_NAME) ??
    request.cookies.get(LEGACY_SESSION_COOKIE_NAME)

  if (!token) {
    return Promise.resolve(null)
  }

  return verifySession(token.value)
}

// Role checking
export function hasRole(user: SessionUser | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false

  if (Array.isArray(role)) {
    return role.includes(user.role)
  }

  return user.role === role
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'superadmin')
}

export function canApprove(user: SessionUser | null): boolean {
  return hasRole(user, ['superadmin', 'approver'])
}

export function canPublish(user: SessionUser | null): boolean {
  return hasRole(user, 'superadmin')
}

// ============================================================================
// Route guards
// ============================================================================

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * CSRF defense: for state-changing requests, require the Origin (or, if
 * absent, Referer) header to match the request's own Host. This blocks the
 * classic cross-site form/fetch CSRF since attackers cannot forge those
 * headers from a browser.
 */
function checkSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get('host')
  if (!host) return false
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const u = new URL(origin)
      return u.host === host
    } catch {
      return false
    }
  }
  // Origin omitted on some legitimate same-origin POSTs; fall back to Referer.
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const u = new URL(referer)
      return u.host === host
    } catch {
      return false
    }
  }
  // No Origin and no Referer — refuse, since legitimate browser-initiated
  // mutating requests always carry at least one.
  return false
}

export type AuthGuardResult = { user: SessionUser } | NextResponse

/**
 * Single entry point for session-protected API routes.
 * - Checks CSRF (Origin/Referer) for mutating methods
 * - Requires a valid session cookie
 * - Optionally enforces a role check (e.g., canApprove, isSuperAdmin)
 * Returns either { user } on success or a NextResponse to return directly.
 */
export async function requireAuth(
  request: NextRequest,
  options: {
    role?: (user: SessionUser | null) => boolean
    /** Override automatic CSRF check (true = always check, false = never) */
    csrf?: boolean
  } = {}
): Promise<AuthGuardResult> {
  const isMutating = MUTATING_METHODS.has(request.method)
  const wantsCsrf = options.csrf ?? isMutating
  if (wantsCsrf && !checkSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-site request rejected' }, { status: 403 })
  }
  const user = await getSessionFromCookie()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (options.role && !options.role(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { user }
}

/**
 * Constant-time bearer-token check. Accepts any of the provided secrets.
 * Returns true on a match, false otherwise. Undefined secrets are skipped
 * (allows passing process.env.X | process.env.Y without conditional logic).
 */
export function checkBearer(request: NextRequest, secrets: Array<string | undefined>): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const provided = Buffer.from(authHeader)
  let matched = false
  for (const s of secrets) {
    if (!s) continue
    const expected = Buffer.from(`Bearer ${s}`)
    if (provided.length === expected.length && timingSafeEqual(provided, expected)) {
      matched = true
      // Don't early-return: keep timing roughly equal across cases.
    }
  }
  return matched
}
