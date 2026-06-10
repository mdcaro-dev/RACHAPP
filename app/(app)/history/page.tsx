import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { HABIT_POSITIVE } from '@/types'
import GoToDayPicker from './GoToDayPicker'

function calcPctForLog(log: any, customHabits: any[]): number {
  const keys = [...Object.keys(HABIT_POSITIVE), ...customHabits.map((h: any) => h.id)]
  if (keys.length === 0) return 0
  let met = 0
  for (const key of keys) {
    const positive = HABIT_POSITIVE[key] ?? true
    let val: any = null
    if (key === 'slept_7h') val = log.slept_7h
    else if (key === 'healthy_breakfast') val = log.healthy_breakfast
    else if (key === 'healthy_lunch') val = log.healthy_lunch
    else if (key === 'healthy_dinner') val = log.healthy_dinner
    else if (key === 'ate_candy') val = log.ate_candy
    else if (key === 'drank_soda') val = log.drank_soda
    else if (key === 'drank_alcohol') val = log.drank_alcohol
    else if (key === 'physical_activity') val = log.physical_activity !== null && log.physical_activity !== 'nada'
    else val = log.custom_habits?.[key] ?? null
    if (val === null) continue
    if (positive ? val === true : val === false) met++
  }
  return Math.round((met / keys.length) * 100)
}

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })

  const [logsResult, customResult] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }),
    supabase.from('custom_habits').select('*').eq('user_id', userId).eq('active', true).order('sort_order'),
  ])

  const logs = logsResult.data || []
  const customHabits = customResult.data || []
  const loggedDates = logs.map(l => l.log_date)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-base text-black">HISTORIAL</h2>
        <GoToDayPicker today={today} loggedDates={loggedDates} />
      </div>

      {logs.length === 0 ? (
        <div className="card-pixel text-center py-8">
          <p className="font-pixel text-xs text-black/50">Todavía no tenés días registrados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const pct = calcPctForLog(log, customHabits)
            const dateLabel = new Date(log.log_date + 'T12:00:00').toLocaleDateString('es-AR', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            })
            return (
              <Link
                key={log.id}
                href={`/history/${log.log_date}`}
                className="card-pixel flex items-center gap-3 hover:bg-rach-yellow/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-pixel text-xs text-black capitalize">{dateLabel}</p>
                  <div className="w-full bg-black/10 border border-black h-2">
                    <div
                      className={`h-full ${pct >= 70 ? 'bg-rach-blue' : 'bg-rach-red'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <p className="font-pixel text-sm text-black">{pct}%</p>
                  <p className={`font-pixel text-xs ${log.confirmed ? 'text-rach-blue' : 'text-black/40'}`}>
                    {log.confirmed ? '✓ ok' : 'borrador'}
                  </p>
                </div>
                <span className="font-pixel text-xs text-black/40 shrink-0">→</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
