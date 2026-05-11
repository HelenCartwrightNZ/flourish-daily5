import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, send to auth first then back here
  if (!user) redirect('/auth')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      fontFamily: 'Montserrat, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--navy)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <a href="/dashboard" style={{
          color: 'rgba(250,246,239,0.6)',
          fontSize: 13,
          textDecoration: 'none',
          fontFamily: 'Montserrat, sans-serif',
        }}>← Back</a>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20,
          color: 'var(--cream)',
          fontWeight: 300,
          marginLeft: 8,
        }}>
          Brighter Tomorrows <em style={{ color: 'var(--gold-light)' }}>Membership</em>
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 24px 48px', maxWidth: 560, margin: '0 auto', width: '100%' }}>

        {/* Intro */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 28,
            fontWeight: 300,
            color: 'var(--navy)',
            lineHeight: 1.3,
            marginBottom: 12,
          }}>
            You don&apos;t have to do this alone.
          </div>
          <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.8 }}>
            The Daily 5 gets you started. The membership is where real change happens —
            with people who understand, and a therapist who has been through it herself.
          </p>
        </div>

        {/* Three pillars */}
        {[
          {
            emoji: '🧠',
            label: 'Body',
            color: '#7B5EA7',
            desc: 'Nervous system regulation, hypnotic audio library, and daily D.O.S.E. practices to restore your chemistry.',
          },
          {
            emoji: '🛡️',
            label: 'Boundaries',
            color: '#4A7FA5',
            desc: 'SHED programme, monthly deep-dive sessions, and weekly journal prompts to reclaim your story and your worth.',
          },
          {
            emoji: '💚',
            label: 'Belonging',
            color: '#6B8F71',
            desc: 'Private community, weekly live calls with Helen, and the irreplaceable experience of not being alone in this.',
          },
        ].map(({ emoji, label, color, desc }) => (
          <div key={label} style={{
            background: 'var(--white)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 8,
            padding: '16px 20px',
            marginBottom: 12,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{emoji}</div>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color,
                marginBottom: 4,
              }}>{label}</div>
              <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}

        {/* Price card */}
        <div style={{
          background: 'var(--navy)',
          borderRadius: 10,
          padding: '28px 24px',
          marginTop: 28,
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 48,
            fontWeight: 300,
            color: 'var(--gold-light)',
            lineHeight: 1,
          }}>
            $47
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey)', marginTop: 4, marginBottom: 24 }}>
            NZD per month · cancel any time
          </div>

          <a
            href="https://brightertomorrows.co.nz/membership"
            style={{
              display: 'block',
              background: 'var(--gold)',
              color: 'var(--navy)',
              textAlign: 'center',
              padding: '16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Join Brighter Tomorrows →
          </a>
        </div>

        {/* Scholarship */}
        <div style={{
          background: 'rgba(107,143,113,0.08)',
          border: '1px solid rgba(107,143,113,0.25)',
          borderRadius: 8,
          padding: '16px 20px',
          marginTop: 16,
        }}>
          <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--navy)' }}>Scholarship fund</strong> — no one should stay in the dark because of money.
            If financial circumstances mean membership isn&apos;t possible right now,{' '}
            <a
              href="#"
              style={{ color: 'var(--roots)', textDecoration: 'underline' }}
            >
              apply here
            </a>
            . Applications are read personally by Helen.
          </div>
        </div>

      </div>
    </div>
  )
}
