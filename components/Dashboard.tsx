'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import HomeScreen from './HomeScreen'
import WeeklyScreen from './WeeklyScreen'
import ProfileScreen from './ProfileScreen'
import PillarModal from './PillarModal'
import DeepDiveModal from './DeepDiveModal'
import Toast from './Toast'
import type { CheckIn, Profile, ActiveScreen, PillarKey } from '@/lib/types'
import { todayString, getWeekStart } from '@/lib/utils'
import { pillarOrder } from '@/lib/pillars'

interface Props {
  userId: string
  userEmail: string
  profile: Profile | null
  todayCheckIn: CheckIn | null
  weekCheckIns: CheckIn[]
}

function emptyToday(): CheckIn {
  return { date: todayString(), soul: false, roots: false, body: false, bank: false, brain: false }
}

export default function Dashboard({ userId, userEmail, profile, todayCheckIn, weekCheckIns: initialWeek }: Props) {
  const supabase = createClient()

  const [screen, setScreen] = useState<ActiveScreen>('home')
  const [today, setToday] = useState<CheckIn>(todayCheckIn ?? emptyToday())
  const [weekCheckIns, setWeekCheckIns] = useState<CheckIn[]>(initialWeek)
  const [openPillar, setOpenPillar] = useState<PillarKey | null>(null)
  const [deepDiveOpen, setDeepDiveOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const notificationScheduled = useRef(false)

  // Compute whether the 4pm nudge should show
  const incompleteCount = pillarOrder.filter(k => !today[k]).length
  const hour = new Date().getHours()
  const showNudge = !nudgeDismissed && hour >= 16 && incompleteCount > 0

  // Schedule 4pm browser notification for today
  useEffect(() => {
    if (notificationScheduled.current) return
    notificationScheduled.current = true

    async function setupNotification() {
      if (!('Notification' in window)) return

      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') return

      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch {
          // SW registration failed — fall back to inline notification
        }
      }

      const now = new Date()
      const fourPM = new Date(now)
      fourPM.setHours(16, 0, 0, 0)
      const msUntil4pm = fourPM.getTime() - now.getTime()

      if (msUntil4pm > 0 && msUntil4pm < 86_400_000) {
        setTimeout(() => {
          // Only fire if there are still incomplete pillars
          const incomplete = pillarOrder.filter(k => !today[k]).length
          if (incomplete > 0) {
            new Notification("It's 4pm — still time to flourish 🌸", {
              body: `${incomplete} pillar${incomplete > 1 ? 's' : ''} still unchecked today.`,
              icon: '/icon-192.png',
              tag: 'flourish-4pm',
            })
          }
        }, msUntil4pm)
      }
    }

    setupNotification()
  }, []) // intentionally no deps — run once on mount

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
  }, [])

  const handlePillarComplete = useCallback(async (key: PillarKey) => {
    if (today[key]) return // already done

    const updated = { ...today, [key]: true }
    setToday(updated)
    setOpenPillar(null)

    const done = pillarOrder.filter(k => updated[k]).length
    if (done === 5) {
      showToast("🌸 All 5 done today! You're flourishing.")
    } else {
      const pillarNames: Record<PillarKey, string> = {
        soul: 'Feed Your Soul', roots: 'Tend Your Roots', body: 'Nourish Your Body',
        bank: 'Feed Your Bank', brain: 'Feed Your Brain',
      }
      showToast(`✓ ${pillarNames[key]} — done.`)
    }

    // Save to Supabase (upsert by user_id + date)
    await supabase.from('check_ins').upsert(
      { user_id: userId, ...updated },
      { onConflict: 'user_id,date' }
    )

    // Update week list in memory
    setWeekCheckIns(prev => {
      const existing = prev.findIndex(ci => ci.date === updated.date)
      if (existing >= 0) {
        const copy = [...prev]
        copy[existing] = { ...copy[existing], [key]: true }
        return copy
      }
      return [...prev, updated]
    })

    // Fire GHL webhook via API route
    fetch('/api/ghl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pillar: key,
        date: updated.date,
        pillarsCompletedToday: done,
        userEmail,
        userName: profile?.full_name ?? '',
      }),
    }).catch(() => {}) // fire-and-forget
  }, [today, userId, userEmail, profile, supabase, showToast])

  const handleDeepDiveSubmit = useCallback(async (blocker: string) => {
    setDeepDiveOpen(false)
    showToast('💛 Sent. Helen will follow up with you.')
    // Fire GHL webhook for deep dive blocker
    fetch('/api/ghl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'deep_dive_blocker',
        blocker,
        userEmail,
        userName: profile?.full_name ?? '',
      }),
    }).catch(() => {})
  }, [userEmail, profile, showToast])

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          today={today}
          weekCheckIns={weekCheckIns}
          profile={profile}
          userEmail={userEmail}
          showNudge={showNudge}
          onDismissNudge={() => setNudgeDismissed(true)}
          onPillarClick={setOpenPillar}
          onNavChange={setScreen}
        />
      )}
      {screen === 'weekly' && (
        <WeeklyScreen
          today={today}
          weekCheckIns={weekCheckIns}
          onNavChange={setScreen}
          onOpenDeepDive={() => setDeepDiveOpen(true)}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          profile={profile}
          userEmail={userEmail}
          onNavChange={setScreen}
          onShowToast={showToast}
        />
      )}

      {openPillar && (
        <PillarModal
          pillarKey={openPillar}
          isDone={today[openPillar]}
          onComplete={handlePillarComplete}
          onClose={() => setOpenPillar(null)}
        />
      )}

      {deepDiveOpen && (
        <DeepDiveModal
          onSubmit={handleDeepDiveSubmit}
          onClose={() => setDeepDiveOpen(false)}
        />
      )}

      <Toast message={toastMsg} onDone={() => setToastMsg('')} />
    </div>
  )
}
