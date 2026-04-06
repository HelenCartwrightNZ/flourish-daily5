import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/Dashboard'
import { getWeekStart, todayString } from '@/lib/utils'
import type { CheckIn, Profile } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const today = todayString()
  const weekStart = getWeekStart()

  const [{ data: todayCheckIn }, { data: weekCheckIns }, { data: profile }] = await Promise.all([
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .order('date', { ascending: true }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  return (
    <Dashboard
      userId={user.id}
      userEmail={user.email ?? ''}
      profile={profile as Profile | null}
      todayCheckIn={todayCheckIn as CheckIn | null}
      weekCheckIns={(weekCheckIns ?? []) as CheckIn[]}
    />
  )
}
