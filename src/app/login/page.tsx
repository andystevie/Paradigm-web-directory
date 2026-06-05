'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/'

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.status === 429) {
        setError('Too many attempts. Try again in a few minutes.')
        return
      }
      if (!res.ok) {
        setError('Incorrect password.')
        return
      }
      // Use replace so the login page isn't in the back button history.
      router.replace(from)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <img
          src="/paradigm-logo.webp"
          alt="Paradigm Home Health"
          className="login-logo"
        />
        <h1 className="login-title">Employee Directory</h1>
        <p className="login-sub">Enter the directory password to continue.</p>

        <label className="login-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          disabled={submitting}
          required
        />

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="login-button" disabled={submitting || !password}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
