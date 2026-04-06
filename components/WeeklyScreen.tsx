'use client'

import { useMemo } from 'react'
import type { CheckIn, ActiveScreen } from '@/lib/types'
import { pillarOrder, pillars } from '@/lib/pillars'
import { getWeekStart, todayString } from '@/lib/utils'
import BottomNav from './BottomNav'

interface Props {
  today: CheckIn
  weekCheckIns: CheckIn[]
  onNavChange: (screen: ActiveScreen) => void
  onOpenDeepDive: () => void
}

export default function WeeklyScreen({ today, weekCheckIns, onNavChange, onOpenDeepDive }: Props) {
  const weekStart = getWeekStart()
  const todayStr = todayString()

  // Build 7-day grid (Mon–Sun)
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart + 'T00:00:00')
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }, [weekStart])

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  // Build lookup: date -> CheckIn
  const checkInMap = useMemo(() => {
    const map: Record<string, CheckIn> = {}
    for (const ci of weekCheckIns) {
      map[ci.date] = ci
    }
    // Today's live state overrides
    map[todayStr] = today
    return map
  }, [weekCheckIns, today, todayStr])

  // Weekly compliance %
  const completeDays = useMemo(() => {
    return days.filter(d => {
      const ci = checkInMap[d]
      return ci && pillarOrder.filter(k => ci[k]).length >= 5
    }).length
  }, [days, checkInMap])

  const pct = Math.round((completeDays / 7) * 100)

  const scoreNote =
    pct >= 71 ? '"You\'re on track. Keep going, darling."'
    : pct >= 42 ? '"You\'re close — one more day gets you there."'
    : '"Progress, not perfection. What can you do today?"'

  // Show 3-week alert (here we just check if body+bank both 0 this week — in prod query last 3 weeks)
  const bodyTotal = days.filter(d => checkInMap[d]?.body).length
  const bankTotal = days.filter(d => checkInMap[d]?.bank).length
  const showThreeWeekAlert = bodyTotal === 0 && bankTotal === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="page-header">
        <div className="page-header-title">Weekly <em>Summary</em></div>
        <div className="page-header-sub">Target: 5 of 7 days</div>
      </div>

      <div className="weekly-content" style={{ flex: 1 }}>
        {/* Score card */}
        <div className="score-card">
          <div className="score-big">{pct}%</div>
          <div>
            <div className="score-label">Weekly Compliance</div>
            <div className="score-bar-wrap">
              <div className="score-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="score-note">{scoreNote}</div>
          </div>
        </div>

        {/* Pillar grid */}
        <div className="section-title" style={{ marginBottom: 8 }}>Pillar Breakdown</div>
        <div className="week-grid">
          {/* Header row */}
          <div className="week-row week-row-header">
            <div className="week-cell" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>Pillar</div>
            {dayLabels.map((l, i) => (
              <div key={i} className="week-cell day-header">{l}</div>
            ))}
          </div>

          {/* Pillar rows */}
          {pillarOrder.map(key => {
            const p = pillars[key]
            const pillarLabels: Record<string, string> = {
              soul: 'Soul', roots: 'Roots', body: 'Body', bank: 'Bank', brain: 'Brain',
            }
            return (
              <div key={key} className="week-row">
                <div
                  className="week-cell pillar-label"
                  style={{ borderLeft: `3px solid ${p.cssVar}` }}
                >
                  {p.icon} {pillarLabels[key]}
                </div>
                {days.map(d => {
                  const ci = checkInMap[d]
                  const done = ci ? ci[key] : false
                  return (
                    <div key={d} className="week-cell dot-cell">
                      <div
                        className={`grid-dot${done ? ' done' : ''}`}
                        style={{ '--pillar-color': p.cssVar } as React.CSSProperties}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* 3-week alert */}
        {showThreeWeekAlert && (
          <div className="three-week-alert">
            <div className="three-week-alert-title">🔍 Something keeping you stuck?</div>
            <div className="three-week-alert-body">
              Body and Bank haven&apos;t been ticked this week. Let&apos;s find the roadblock.
            </div>
            <button className="btn-primary-full" onClick={onOpenDeepDive}>
              Find the Roadblock
            </button>
          </div>
        )}
      </div>

      <BottomNav active="weekly" onNavChange={onNavChange} />
    </div>
  )
}
