'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup' | 'reset'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (err) {
        setError(err.message)
      } else {
        // Fire GHL welcome sequence — don't await, never blocks signup
        fetch('/api/ghl-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName }),
        }).catch(() => {/* silent fail — signup always completes */})
        setMessage('Check your email to confirm your account, then sign in.')
      }

    } else if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message)
      else { router.push('/dashboard'); router.refresh() }

    } else if (mode === 'reset') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (err) setError(err.message)
      else setMessage('Password reset email sent — check your inbox.')
    }

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
                <line x1="65.5" y1="14.5" x2="57.5" y2="22.5" strokeWidth="1.8" />
                <line x1="22.5" y1="57.5" x2="14.5" y2="65.5" strokeWidth="1.8" />
                <line x1="40" y1="8" x2="40" y2="14" strokeWidth="1.2" opacity="0.5" />
                <line x1="40" y1="66" x2="40" y2="72" strokeWidth="1.2" opacity="0.5" />
                <line x1="8" y1="40" x2="14" y2="40" strokeWidth="1.2" opacity="0.5" />
                <line x1="66" y1="40" x2="72" y2="40" strokeWidth="1.2" opacity="0.5" />
              </g>
              <circle cx="40" cy="40" r="8" fill="#C9952A" opacity="0.9" />
              <circle cx="40" cy="40" r="5" fill="#E8B84B" />
            </svg>
          </div>
          <h1 className="auth-logo-title">
            Flourish
            <em>Your Daily 5</em>
          </h1>
        </div>

        {/* Tabs — hidden on reset screen */}
        {mode !== 'reset' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === 'signin' ? ' active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
          </div>
        )}

        {mode === 'reset' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--navy)', marginBottom: 6 }}>
              Reset your password
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey)', lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send you a reset link.
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
        {message && (
          <div className="auth-error" style={{ background: 'rgba(107,143,113,0.1)', borderColor: 'var(--sage)', color: 'var(--sage)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Helen Cartwright"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          {mode !== 'reset' && (
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signup'
              ? 'Create My Account'
              : mode === 'reset'
              ? 'Send Reset Link'
              : 'Sign In'}
          </button>
        </form>

        {/* Forgot password link — only on sign in */}
        {mode === 'signin' && (
          <button
            onClick={() => switchMode('reset')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--grey)', fontSize: 12, marginTop: 16,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Forgot your password?
          </button>
        )}

        {mode === 'reset' && (
          <button
            onClick={() => switchMode('signin')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--grey)', fontSize: 12, marginTop: 16,
              display: 'block', width: '100%', textAlign: 'center',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            ← Back to sign in
          </button>
        )}
      </div>

      <p className="auth-brand">A Brighter Tomorrows programme</p>
    </div>
  )
}
