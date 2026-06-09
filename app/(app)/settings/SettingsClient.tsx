'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { CustomHabit } from '@/types'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  customHabits: CustomHabit[]
  healthyDayThreshold: number
  settingsId?: string
}

export default function SettingsClient({ userId, customHabits: initial, healthyDayThreshold: initialThreshold, settingsId }: Props) {
  const [habits, setHabits] = useState(initial)
  const [threshold, setThreshold] = useState(initialThreshold)
  const [newName, setNewName] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function addHabit() {
    if (!newName.trim() || !newQuestion.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('custom_habits')
      .insert({
        user_id: userId,
        name: newName.trim(),
        question: newQuestion.trim(),
        active: true,
        sort_order: habits.length,
      })
      .select()
      .single()
    if (data) {
      setHabits(h => [...h, data])
      setNewName('')
      setNewQuestion('')
    }
    setSaving(false)
    router.refresh()
  }

  async function toggleHabit(habit: CustomHabit) {
    const { data } = await supabase
      .from('custom_habits')
      .update({ active: !habit.active })
      .eq('id', habit.id)
      .select()
      .single()
    if (data) setHabits(hs => hs.map(h => h.id === data.id ? data : h))
    router.refresh()
  }

  async function deleteHabit(id: string) {
    await supabase.from('custom_habits').delete().eq('id', id)
    setHabits(hs => hs.filter(h => h.id !== id))
    router.refresh()
  }

  async function saveThreshold() {
    setSaving(true)
    if (settingsId) {
      await supabase.from('user_settings').update({ healthy_day_threshold: threshold }).eq('id', settingsId)
    } else {
      await supabase.from('user_settings').insert({ user_id: userId, healthy_day_threshold: threshold })
    }
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-base text-black">CONFIGURACIÓN</h2>

      {/* Healthy day threshold */}
      <div className="card-pixel space-y-3">
        <p className="font-pixel text-xs text-black">UMBRAL DÍA SALUDABLE</p>
        <p className="font-pixel text-xs text-black/50 leading-relaxed">
          % mínimo de hábitos cumplidos para que un día cuente como saludable.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={threshold}
            onChange={e => setThreshold(parseInt(e.target.value))}
            className="flex-1 accent-rach-blue cursor-pointer"
          />
          <span className="font-pixel text-sm text-black w-12 text-right">{threshold}%</span>
        </div>
        <button
          onClick={saveThreshold}
          disabled={saving}
          className="btn-pixel-blue w-full disabled:opacity-50"
        >
          {saving ? '...' : 'GUARDAR'}
        </button>
      </div>

      {/* Custom habits */}
      <div className="space-y-3">
        <p className="font-pixel text-xs text-black">HÁBITOS PERSONALIZADOS</p>

        {habits.map(habit => (
          <div key={habit.id} className={`card-pixel flex items-start gap-3 ${!habit.active ? 'opacity-50' : ''}`}>
            <div className="flex-1 space-y-1">
              <p className="font-pixel text-xs text-black">{habit.name}</p>
              <p className="font-pixel text-xs text-black/50">{habit.question}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleHabit(habit)}
                className={`font-pixel text-xs px-2 py-1 border-2 border-black transition-all
                  ${habit.active ? 'bg-rach-blue text-white' : 'bg-white text-black'}`}
              >
                {habit.active ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="font-pixel text-xs px-2 py-1 border-2 border-black bg-rach-red text-white"
              >
                ✗
              </button>
            </div>
          </div>
        ))}

        {/* Add new habit */}
        <div className="card-pixel space-y-3 border-dashed">
          <p className="font-pixel text-xs text-black/60">AGREGAR HÁBITO</p>
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre (ej: Meditación)"
              className="input-pixel"
            />
            <input
              type="text"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Pregunta (ej: ¿Meditaste hoy?)"
              className="input-pixel"
              onKeyDown={e => e.key === 'Enter' && addHabit()}
            />
          </div>
          <button
            onClick={addHabit}
            disabled={saving || !newName.trim() || !newQuestion.trim()}
            className="btn-pixel-blue w-full disabled:opacity-50"
          >
            + AGREGAR
          </button>
        </div>
      </div>
    </div>
  )
}
