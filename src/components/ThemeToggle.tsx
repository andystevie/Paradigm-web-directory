'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  // Render a stable placeholder until mount so SSR + first client paint match.
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(resolveInitialTheme())
    setMounted(true)
  }, [])

  const apply = (next: Theme) => {
    setTheme(next)
    window.localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const toggle = () => apply(theme === 'light' ? 'dark' : 'light')

  return (
    <button
      type="button"
      onClick={toggle}
      className="phh-theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {mounted && theme === 'dark' ? (
        // Sun icon — currently in dark, click to go light
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon — currently in light (or pre-mount default), click to go dark
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
