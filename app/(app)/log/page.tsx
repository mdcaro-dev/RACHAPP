import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import DailyLogClient from './DailyLogClient'

export default async function LogPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })

  // Yesterday in Argentina timezone
  const yesterdayDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toLocaleDateString('en-CA')

  const [logResult, breakfastResult, customResult, yesterdayResult] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', userId).eq('log_date', today).maybeSingle(),
    supabase.from('breakfast_options').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('custom_habits').select('*').eq('user_id', userId).eq('active', true).order('sort_order'),
    supabase.from('daily_logs').select('id,confirmed').eq('user_id', userId).eq('log_date', yesterday).maybeSingle(),
  ])

  const yesterdayMissing = !yesterdayResult.data || !yesterdayResult.data.confirmed

  const yesterdayLabel = yesterdayDate.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="space-y-4">
      {/* Banner: yesterday incomplete */}
      {yesterdayMissing && (
        <Link href={`/history/${yesterday}`} className="block">
          <div className="border-2 border-black bg-black text-rach-yellow px-4 py-3 shadow-pixel flex items-center justify-between gap-3 hover:bg-rach-yellow hover:text-black transition-colors">
            <div>
              <p className="font-pixel text-xs leading-relaxed">⚠ {yesterdayLabel} sin completar</p>
            </div>
            <span className="font-pixel text-xs shrink-0">COMPLETAR →</span>
          </div>
        </Link>
      )}

      <DailyLogClient
        today={today}
        userId={userId}
        initialLog={logResult.data}
        breakfastOptions={breakfastResult.data || []}
        customHabits={customResult.data || []}
      />
    </div>
  )
}
