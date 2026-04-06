'use client'

import { useMemo } from 'react'
import type { CheckIn, Profile, ActiveScreen, PillarKey } from '@/lib/types'
import { pillarOrder, pillars } from '@/lib/pillars'
import { formatDate, getInitials, todayString, getWeekStart } from '@/lib/utils'
import BottomNav from './BottomNav'

interface Props {
  today: CheckIn
  weekCheckIns: CheckIn[]
  profile: Profile | null
  userEmail: string
  showNudge: boolean
  onDismissNudge: () => void
  onPillarClick: (key: PillarKey) => void
  onNavChange: (screen: ActiveScreen) => void
}

const CIRCUMFERENCE = 163.4

export default function HomeScreen({
  today, weekCheckIns, profile, userEmail,
  showNudge, onDismissNudge, onPillarClick, onNavChange,
}: Props) {
  const initials = getInitials(profile?.full_name, userEmail)
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : userEmail.split('@')[0]
  const dateStr = formatDate(todayString())

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const doneToday = pillarOrder.filter(k => today[k]).length

  // Build 7 day dots (Mon–Sun of current ISO week)
  const weekDots = useMemo(() => {
    const today_d = new Date()
    const dayOfWeek = today_d.getDay() // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = getWeekStart()
    const todayStr = todayString()

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart + 'T00:00:00')
      d.setDate(d.getDate() + i)
      const dateKey = d.toISOString().split('T')[0]
      const ci = weekCheckIns.find(c => c.date === dateKey)
      const total = ci ? pillarOrder.filter(k => ci[k]).length : 0
      const isToday = dateKey === todayStr

      let cls = 'week-dot'
      if (isToday) cls += ' today'
      else if (total >= 5) cls += ' complete'
      else if (total > 0) cls += ' partial'
      return { key: dateKey, cls }
    })
  }, [weekCheckIns])

  // Weekly compliance for the ring (days with all 5 complete this week)
  const completeDaysThisWeek = useMemo(() => {
    return weekCheckIns.filter(ci => pillarOrder.filter(k => ci[k]).length >= 5).length
  }, [weekCheckIns])

  // Streak — count consecutive complete days going back from yesterday
  const streak = useMemo(() => {
    let count = 0
    const d = new Date()
    d.setDate(d.getDate() - 1) // start from yesterday
    for (let i = 0; i < 30; i++) {
      const dateKey = d.toISOString().split('T')[0]
      const ci = weekCheckIns.find(c => c.date === dateKey)
      if (ci && pillarOrder.filter(k => ci[k]).length >= 5) {
        count++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [weekCheckIns])

  const ringPct = doneToday / 5
  const dashOffset = CIRCUMFERENCE - CIRCUMFERENCE * ringPct

  const incompleteCount = pillarOrder.filter(k => !today[k]).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-row">
          <div>
            <div className="topbar-greeting">
              Good <em>{greeting}</em>,<br />{firstName}
            </div>
            <div className="topbar-date">{dateStr}</div>
          </div>
          <div className="topbar-avatar" onClick={() => onNavChange('profile')}>
            {initials}
          </div>
        </div>
        <div className="compliance-ring-wrap">
          <div className="ring-container">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="26" fill="none" stroke="#C9952A" strokeWidth="5"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="ring-text">
              <div className="ring-num">{doneToday}</div>
              <div className="ring-denom">of 5</div>
            </div>
          </div>
          <div className="compliance-info">
            <div className="compliance-label">Today&apos;s progress</div>
            <div className="compliance-streak">
              {streak > 0 ? `${streak} day streak 🎈` : completeDaysThisWeek > 0 ? `${completeDaysThisWeek}/7 this week` : 'Start your streak!'}
            </div>
            <div className="week-dots">
              {weekDots.map(dot => (
                <div key={dot.key} className={dot.cls} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4pm nudge */}
      {showNudge && (
        <div className="nudge-banner">
          <div className="nudge-icon">⏰</div>
          <div className="nudge-text">
            <div className="nudge-title">It&apos;s 4pm — still time to flourish</div>
            <div className="nudge-sub">
              {incompleteCount} pillar{incompleteCount > 1 ? 's' : ''} still unchecked today
            </div>
          </div>
          <button className="nudge-close" onClick={onDismissNudge}>✕</button>
        </div>
      )}

      {/* Pillars */}
      <div className="pillars-wrap">
        <div className="section-title">Today&apos;s Check-in</div>
        {pillarOrder.map(key => {
          const p = pillars[key]
          const done = today[key]
          return (
            <div
              key={key}
              className={`pillar-card p-${key}${done ? ' done' : ''}`}
              onClick={() => onPillarClick(key)}
            >
              <div className="pillar-icon-wrap">{p.icon}</div>
              <div className="pillar-info">
                <div className="pillar-name">{p.name}</div>
                <div className="pillar-hint">{getPillarHint(key)}</div>
              </div>
              <div className="pillar-check">
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="home" onNavChange={onNavChange} />
    </div>
  )
}

function getPillarHint(key: PillarKey): string {
  const hints: Record<PillarKey, string> = {
    soul: 'One thing that makes your heart sing',
    roots: 'One human connection today',
    body: 'Move, nourish, rest',
    bank: 'Earn it, save it, or spend with purpose',
    brain: 'Add something to your knowledge today',
  }
  return hints[key]
}
