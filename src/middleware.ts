import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from './lib/auth-helpers'
import { hasViewerSession } from './lib/viewer-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes: require an admin session, redirect to /admin/login on fail.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const user = await getSessionFromRequest(request)
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Viewer-gated routes: the directory homepage. Anyone with the directory
  // password gets in. Admins are also let through (their admin cookie is
  // separate but indicates they've already authenticated).
  const isPublicPath =
    pathname === '/login' ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout')

  if (!isPublicPath) {
    if (await hasViewerSession(request)) return NextResponse.next()
    // Allow admins through without re-asking for the viewer password.
    const adminUser = await getSessionFromRequest(request)
    if (adminUser) return NextResponse.next()

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Match the directory homepage and everything under it that isn't admin or
// the public auth endpoints. The static asset paths (_next, public files)
// are excluded so they don't go through the gate.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|paradigm-logo.webp|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?|map)$).*)',
  ],
}
