import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import DailyLogClient from '../../log/DailyLogClient'
import Link from 'next/link'

interface Props {
  params: { date: string }
}

export default async function HistoryDayPage({ params }: Props) {
  const { date } = params

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const [logResult, breakfastResult, customResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
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
    <div className="space-y-4">
      <Link href="/history" className="font-pixel text-xs text-black/50 hover:text-black flex items-center gap-2">
        ← HISTORIAL
      </Link>
      <DailyLogClient
        today={date}
        userId={userId}
        initialLog={logResult.data}
        breakfastOptions={breakfastResult.data || []}
        customHabits={customResult.data || []}
        backHref="/history"
      />
    </div>
  )
}
