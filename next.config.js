/** @type {import('next').NextConfig} */

// Security headers applied to every response. Tuned for an internal Next.js
// directory: no inline scripts (other than the theme-init shim, which we
// allow via a nonce-less unsafe-inline only for `script-src`), no third-party
// fonts, images limited to self + data URIs + the WordPress logo asset.
const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline for its hydration script + the theme-init
      // shim in layout.tsx. unsafe-eval is required by React 19 dev mode but
      // can be omitted in production builds via a nonce-based CSP if we ever
      // want to tighten further.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://paradigmhh.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
]

// PII-bearing routes (the homepage renders the full employee directory)
// must not be cached by any shared/upstream cache.
const NO_STORE_HEADERS = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
]

const nextConfig = {
  // Enable static export for Electron
  output: process.env.BUILD_ELECTRON ? 'export' : undefined,

  // Disable image optimization for Electron builds
  images: {
    unoptimized: process.env.BUILD_ELECTRON ? true : false,
  },

  // Base path for Electron
  basePath: process.env.BUILD_ELECTRON ? '' : undefined,
  assetPrefix: process.env.BUILD_ELECTRON ? '' : undefined,

  async headers() {
    // headers() doesn't run for static-export Electron builds.
    if (process.env.BUILD_ELECTRON) return []
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/', headers: NO_STORE_HEADERS },
      { source: '/admin/:path*', headers: NO_STORE_HEADERS },
      { source: '/api/:path*', headers: NO_STORE_HEADERS },
    ]
  },
}

module.exports = nextConfig
