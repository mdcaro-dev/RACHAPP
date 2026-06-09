'use client'

import { useState } from 'react'
import { CustomHabit, DailyLog, Goal, HABIT_LABELS, HABIT_POSITIVE } from '@/types'

interface Props {
  logs: DailyLog[]
  customHabits: CustomHabit[]
  healthyDayThreshold: number
  goals: Goal[]
}

type Range = '7' | '14' | '30' | '60' | '90' | 'custom'

const RANGES: { value: Range; label: string }[] = [
  { value: '7', label: '7D' },
  { value: '14', label: '14D' },
  { value: '30', label: '30D' },
  { value: '60', label: '60D' },
  { value: '90', label: '90D' },
  { value: 'custom', label: 'CUSTOM' },
]

function getHabitValue(log: DailyLog, key: string): boolean | null {
  if (key === 'slept_7h') return log.slept_7h
  if (key === 'healthy_breakfast') return log.healthy_breakfast
  if (key === 'healthy_lunch') return log.healthy_lunch
  if (key === 'healthy_dinner') return log.healthy_dinner
  if (key === 'ate_candy') return log.ate_candy
  if (key === 'drank_soda') return log.drank_soda
  if (key === 'drank_alcohol') return log.drank_alcohol
  if (key === 'physical_activity') return log.physical_activity !== null && log.physical_activity !== 'nada'
  return log.custom_habits?.[key] ?? null
}

function isHabitMet(log: DailyLog, key: string, positive: boolean): boolean {
  const v = getHabitValue(log, key)
  if (v === null) return false
  return positive ? v === true : v === false
}

function calcPct(logs: DailyLog[], key: string, positive: boolean): number {
  if (logs.length === 0) return 0
  const met = logs.filter(l => isHabitMet(l, key, positive)).length
  return Math.round((met / logs.length) * 100)
}

function calcStreak(logs: DailyLog[], key: string, positive: boolean): { current: number; longest: number } {
  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  let current = 0
  let longest = 0
  let streak = 0

  for (let i = sorted.length - 1; i >= 0; i--) {
    if (isHabitMet(sorted[i], key, positive)) {
      streak++
      if (i === sorted.length - 1 || isConsecutive(sorted[i].log_date, sorted[i + 1].log_date)) {
        current = streak
      }
    } else {
      streak = 0
    }
    longest = Math.max(longest, streak)
  }

  return { current, longest }
}

function isConsecutive(d1: string, d2: string): boolean {
  const a = new Date(d1)
  const b = new Date(d2)
  const diff = Math.abs(b.getTime() - a.getTime())
  return diff <= 86400000 + 1000
}

function isHealthyDay(log: DailyLog, customHabits: CustomHabit[], threshold: number): boolean {
  const allKeys = [
    ...Object.keys(HABIT_POSITIVE),
    ...customHabits.map(h => h.id),
  ]
  const total = allKeys.length
  if (total === 0) return false
  const met = allKeys.filter(k => {
    const positive = HABIT_POSITIVE[k] ?? true
    return isHabitMet(log, k, positive)
  }).length
  return Math.round((met / total) * 100) >= threshold
}

// Pixel-art pie chart using SVG
function PieChart({ pct, size = 80, color }: { pct: number; size?: number; color: string }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  if (pct === 0) {
    return (
      <svg width={size} height={size} style={{ imageRendering: 'pixelated' }}>
        <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth={2} />
      </svg>
    )
  }

  if (pct === 100) {
    return (
      <svg width={size} height={size} style={{ imageRendering: 'pixelated' }}>
        <circle cx={cx} cy={cy} r={r} fill={color} stroke="black" strokeWidth={2} />
      </svg>
    )
  }

  const angle = (pct / 100) * 360
  const rad = (angle - 90) * (Math.PI / 180)
  const x = cx + r * Math.cos(rad)
  const y = cy + r * Math.sin(rad)
  const largeArc = angle > 180 ? 1 : 0

  const d = [
    `M ${cx} ${cy}`,
    `L ${cx} ${cy - r}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`,
    'Z',
  ].join(' ')

  return (
    <svg width={size} height={size} style={{ imageRendering: 'pixelated' }}>
      {/* Background (miss) */}
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth={2} />
      {/* Filled slice (hit) */}
      <path d={d} fill={color} />
      {/* Border on top */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="black" strokeWidth={2} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill="black" />
      {/* Dividing line from center to top */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke="black" strokeWidth={1.5} />
    </svg>
  )
}

export default function ReportsClient({ logs, customHabits, healthyDayThreshold, goals }: Props) {
  const [range, setRange] = useState<Range>('30')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  function getDateRange(): [Date, Date] {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    if (range === 'custom' && customStart && customEnd) {
      return [new Date(customStart), new Date(customEnd)]
    }
    const days = parseInt(range)
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    start.setHours(0, 0, 0, 0)
    return [start, end]
  }

  function getPrevDateRange(start: Date, end: Date): [Date, Date] {
    const diff = end.getTime() - start.getTime()
    const prevEnd = new Date(start.getTime() - 1)
    const prevStart = new Date(start.getTime() - diff - 1)
    return [prevStart, prevEnd]
  }

  const [start, end] = getDateRange()
  const [prevStart, prevEnd] = getPrevDateRange(start, end)

  const currentLogs = logs.filter(l => {
    const d = new Date(l.log_date + 'T12:00:00')
    return d >= start && d <= end
  })
  const prevLogs = logs.filter(l => {
    const d = new Date(l.log_date + 'T12:00:00')
    return d >= prevStart && d <= prevEnd
  })

  const allHabitKeys = [
    ...Object.keys(HABIT_POSITIVE),
    ...customHabits.map(h => h.id),
  ]

  const healthyDaysCount = currentLogs.filter(l => isHealthyDay(l, customHabits, healthyDayThreshold)).length
  const healthyDaysPct = currentLogs.length > 0 ? Math.round((healthyDaysCount / currentLogs.length) * 100) : 0
  const prevHealthyDaysPct = prevLogs.length > 0
    ? Math.round((prevLogs.filter(l => isHealthyDay(l, customHabits, healthyDayThreshold)).length / prevLogs.length) * 100)
    : 0

  if (logs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-pixel text-base text-black">ESTADÍSTICAS</h2>
        <div className="card-pixel text-center py-8">
          <p className="font-pixel text-xs text-black/50">Todavía no tenés días confirmados.</p>
          <p className="font-pixel text-xs text-black/50 mt-2">Completá tu primer log para ver stats.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-pixel text-base text-black">ESTADÍSTICAS</h2>

      {/* Range selector */}
      <div className="flex gap-1 flex-wrap">
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`font-pixel text-xs px-3 py-2 border-2 border-black transition-all
              ${range === r.value ? 'bg-black text-rach-yellow' : 'bg-white text-black shadow-pixel-sm hover:bg-rach-yellow'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <div className="card-pixel flex gap-2 items-center">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-pixel flex-1" />
          <span className="font-pixel text-xs">→</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-pixel flex-1" />
        </div>
      )}

      {currentLogs.length === 0 ? (
        <div className="card-pixel text-center py-6">
          <p className="font-pixel text-xs text-black/50">Sin datos para este período.</p>
        </div>
      ) : (
        <>
          {/* Overall healthy days */}
          <div className="card-pixel flex items-center gap-4">
            <PieChart pct={healthyDaysPct} size={80} color="#0A80FE" />
            <div className="space-y-1">
              <p className="font-pixel text-xs text-black/60">DÍAS SALUDABLES</p>
              <div className="flex items-baseline gap-2">
                <span className="font-pixel text-2xl text-black">{healthyDaysPct}%</span>
                <DeltaBadge current={healthyDaysPct} prev={prevHealthyDaysPct} positive={true} />
              </div>
              <p className="font-pixel text-xs text-black/50">{healthyDaysCount} de {currentLogs.length} días</p>
            </div>
          </div>

          {/* Per-habit grid */}
          <p className="font-pixel text-xs text-black/60">POR HÁBITO</p>
          <div className="grid grid-cols-2 gap-3">
            {allHabitKeys.map(key => {
              const positive = HABIT_POSITIVE[key] ?? true
              const label = HABIT_LABELS[key] || customHabits.find(h => h.id === key)?.name || key
              const pct = calcPct(currentLogs, key, positive)
              const prevPct = calcPct(prevLogs, key, positive)
              const { current: streakCurrent, longest: streakLongest } = calcStreak(currentLogs, key, positive)
              const goal = goals.find(g => g.habit_key === key)
              const hitGoal = pct >= (goal?.target_pct ?? 0)
              const pieColor = pct >= (goal?.target_pct ?? 50) ? '#0A80FE' : '#E12715'

              return (
                <div key={key} className="card-pixel flex flex-col items-center gap-2 text-center">
                  <p className="font-pixel text-black leading-relaxed w-full" style={{ fontSize: '7px', lineHeight: '1.6' }}>
                    {label}
                  </p>

                  <PieChart pct={pct} size={64} color={pieColor} />

                  <div className="flex items-center gap-1 justify-center">
                    <span className="font-pixel text-sm text-black">{pct}%</span>
                    <DeltaBadge current={pct} prev={prevPct} positive={positive} />
                  </div>

                  {goal && (
                    <p className="font-pixel text-black/50" style={{ fontSize: '7px' }}>
                      meta {goal.target_pct}% {hitGoal ? '✓' : '✗'}
                    </p>
                  )}

                  <div className="border-t border-black/10 pt-1 w-full flex justify-between">
                    <span className="font-pixel text-black/50" style={{ fontSize: '7px' }}>racha {streakCurrent}</span>
                    <span className="font-pixel text-black/50" style={{ fontSize: '7px' }}>mejor {streakLongest}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function DeltaBadge({ current, prev, positive }: { current: number; prev: number; positive: boolean }) {
  if (prev === 0) return null
  const delta = current - prev
  if (delta === 0) return <span className="font-pixel text-xs text-black/40">→</span>
  const better = positive ? delta > 0 : delta < 0
  return (
    <span className={`font-pixel text-xs ${better ? 'text-rach-blue' : 'text-rach-red'}`}>
      {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}%
    </span>
  )
}
