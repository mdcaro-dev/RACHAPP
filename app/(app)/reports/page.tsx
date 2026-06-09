import { createServerSupabaseClient } from '@/lib/supabase-server'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const [logsResult, customResult, settingsResult, goalsResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('confirmed', true)
      .order('log_date', { ascending: false }),
    supabase
      .from('custom_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId),
  ])

  return (
    <ReportsClient
      logs={logsResult.data || []}
      customHabits={customResult.data || []}
      healthyDayThreshold={settingsResult.data?.healthy_day_threshold ?? 70}
      goals={goalsResult.data || []}
    />
  )
}
