'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ActiveScreen } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import BottomNav from './BottomNav'

interface Props {
  profile: Profile | null
  userEmail: string
  onNavChange: (screen: ActiveScreen) => void
  onShowToast: (msg: string) => void
}

export default function ProfileScreen({ profile, userEmail, onNavChange, onShowToast }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const displayName = profile?.full_name ?? userEmail
  const initials = getInitials(profile?.full_name, userEmail)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div
            className="topbar-avatar"
            style={{ width: 52, height: 52, fontSize: 18, flexShrink: 0 }}
          >
            {initials}
          </div>
          <div>
            <div className="page-header-title" style={{ fontSize: 24, marginBottom: 2 }}>
              {displayName}
            </div>
            <div className="page-header-sub">{userEmail}</div>
          </div>
        </div>
        <div className="page-header-sub">Brighter Tomorrows membership</div>
      </div>

      <div className="profile-content">
        <div className="free-tier-card">
          <div className="tier-title">Free Member</div>
          {[
            { tick: true, label: 'Daily 5 check-in' },
            { tick: true, label: '7-day compliance view' },
            { tick: true, label: '4pm daily reminder' },
            { tick: true, label: 'Weekly summary' },
            { tick: false, label: 'Monthly deep-dive insights' },
            { tick: false, label: 'Hypnotic audio library (12 tracks)' },
            { tick: false, label: 'SHED self-guided programme' },
            { tick: false, label: 'Community — Brighter Tomorrows members' },
          ].map(({ tick, label }) => (
            <div key={label} className="tier-feature">
              <div className={tick ? 'feature-tick' : 'feature-lock'}>
                {tick ? '✓' : '🔒'}
              </div>
              <span style={tick ? undefined : { color: 'var(--grey)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="upgrade-card">
          <div className="upgrade-title">Brighter Tomorrows <em>Members</em></div>
          <div className="upgrade-price">$47 <span>NZD/month</span></div>
          <div className="upgrade-desc">Full access — cancel any time</div>
          <button className="btn-upgrade" onClick={() => onShowToast('Redirecting to checkout… 🎈')}>
            Upgrade Now
          </button>
        </div>

        <div className="ghl-badge">
          <div className="ghl-dot" />
          <div className="ghl-text">
            <strong>Community connected.</strong> Your check-ins sync with the Brighter Tomorrows platform.
          </div>
        </div>

        <button className="btn-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <BottomNav active="profile" onNavChange={onNavChange} />
    </div>
  )
}
