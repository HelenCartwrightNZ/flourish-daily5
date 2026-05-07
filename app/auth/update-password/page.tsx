'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) setError(err.message)
    else { router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-sunburst">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#C9952A" strokeLinecap="round">
                <line x1="40" y1="4" x2="40" y2="16" strokeWidth="2.5" />
                <line x1="40" y1="64" x2="40" y2="76" strokeWidth="2.5" />
                <line x1="4" y1="40" x2="16" y2="40" strokeWidth="2.5" />
                <line x1="64" y1="40" x2="76" y2="40" strokeWidth="2.5" />
                <line x1="14.5" y1="14.5" x2="22.5" y2="22.5" strokeWidth="1.8" />
                <line x1="57.5" y1="57.5" x2="65.5" y2="65.5" strokeWidth="1.8" />
              </g>
              <circle cx="40" cy="40" r="8" fill="#C9952A" opacity="0.9" />
              <circle cx="40" cy="40" r="5" fill="#E8B84B" />
            </svg>
          </div>
          <h1 className="auth-logo-title">Flourish<em>Your Daily 5</em></h1>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--navy)', marginBottom: 6 }}>
            Choose a new password
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">New Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Same again"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Updating…' : 'Set New Password'}
          </button>
        </form>
      </div>
      <p className="auth-brand">A Brighter Tomorrows programme</p>
    </div>
  )
}
