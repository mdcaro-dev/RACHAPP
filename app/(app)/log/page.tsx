import { createServerSupabaseClient } from '@/lib/supabase-server'
import DailyLogClient from './DailyLogClient'

export default async function LogPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const today = new Date().toISOString().split('T')[0]

  const [logResult, breakfastResult, customResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle(),
    supabase
      .from('breakfast_options')
      .select('*')
      .eq('user_id', userId)
      .order('created_at'),
    supabase
      .from('custom_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('sort_order'),
  ])

  return (
    <DailyLogClient
      today={today}
      userId={userId}
      initialLog={logResult.data}
      breakfastOptions={breakfastResult.data || []}
      customHabits={customResult.data || []}
    />
  )
}
