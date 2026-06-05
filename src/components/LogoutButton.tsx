'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      // Swallow — even if the request fails the cookie may still be cleared
      // server-side, and we redirect either way.
    }
    router.replace('/login')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="phh-theme-toggle"
      aria-label="Sign out of the directory"
      title="Sign out"
      disabled={busy}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
        <path d="M12 9l3 3-3 3" />
        <path d="M15 12H2.25" />
      </svg>
    </button>
  )
}
