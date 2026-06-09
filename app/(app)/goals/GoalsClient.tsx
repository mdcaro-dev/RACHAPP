'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { CustomHabit, Goal, HABIT_LABELS, HABIT_POSITIVE } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  goals: Goal[]
  customHabits: CustomHabit[]
}

const CORE_KEYS = Object.keys(HABIT_POSITIVE)

export default function GoalsClient({ userId, goals: initialGoals, customHabits }: Props) {
  const [goals, setGoals] = useState(initialGoals)
  const [saving, setSaving] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const allKeys = [...CORE_KEYS, ...customHabits.map(h => h.id)]

  function getGoalPct(key: string): number {
    return goals.find(g => g.habit_key === key)?.target_pct ?? 70
  }

  async function updateGoal(key: string, pct: number) {
    setSaving(key)
    const existing = goals.find(g => g.habit_key === key)
    if (existing) {
      const { data } = await supabase
        .from('goals')
        .update({ target_pct: pct })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setGoals(gs => gs.map(g => g.id === data.id ? data : g))
    } else {
      const { data } = await supabase
        .from('goals')
        .insert({ user_id: userId, habit_key: key, target_pct: pct })
        .select()
        .single()
      if (data) setGoals(gs => [...gs, data])
    }
    setSaving(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-pixel text-base text-black">OBJETIVOS</h2>
      <p className="font-pixel text-xs text-black/50 leading-relaxed">
        Definí el % de días que querés cumplir cada hábito.
      </p>

      {allKeys.map(key => {
        const label = HABIT_LABELS[key] || customHabits.find(h => h.id === key)?.name || key
        const pct = getGoalPct(key)
        const isSaving = saving === key

        return (
          <div key={key} className="card-pixel space-y-3">
            <p className="font-pixel text-xs text-black leading-relaxed">{label}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={pct}
                onChange={e => {
                  const v = parseInt(e.target.value)
                  setGoals(gs => {
                    const existing = gs.find(g => g.habit_key === key)
                    if (existing) return gs.map(g => g.habit_key === key ? { ...g, target_pct: v } : g)
                    return [...gs, { id: '', user_id: userId, habit_key: key, target_pct: v, created_at: '', updated_at: '' }]
                  })
                }}
                onMouseUp={e => updateGoal(key, parseInt((e.target as HTMLInputElement).value))}
                onTouchEnd={e => updateGoal(key, parseInt((e.target as HTMLInputElement).value))}
                className="flex-1 accent-rach-blue cursor-pointer"
              />
              <span className="font-pixel text-sm text-black w-12 text-right">
                {isSaving ? '...' : `${pct}%`}
              </span>
            </div>
            <div className="w-full bg-black/10 border-2 border-black h-2">
              <div className="h-full bg-rach-blue transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
