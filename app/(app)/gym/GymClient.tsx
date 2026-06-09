'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { GYM_DAYS, Exercise } from '@/lib/gym-data'

interface SavedWeight {
  exercise_id: string
  weight: string | null
}

interface Props {
  userId: string
  savedWeights: SavedWeight[]
}

const BLOCK_COLORS: Record<string, string> = {
  calor:       'bg-rach-yellow border-black text-black',
  'zona-media': 'bg-rach-red border-black text-white',
  musculacion: 'bg-rach-blue border-black text-white',
  cardio:      'bg-black border-black text-rach-yellow',
}

export default function GymClient({ userId, savedWeights }: Props) {
  const [activeDay, setActiveDay] = useState<1 | 2 | 3>(1)
  const [weights, setWeights] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const w of savedWeights) {
      if (w.weight) map[w.exercise_id] = w.weight
    }
    return map
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const supabase = createClient()

  const day = GYM_DAYS.find(d => d.day === activeDay)!

  const saveWeight = useCallback(async (exerciseId: string, weight: string) => {
    setSaving(exerciseId)
    await supabase
      .from('gym_weights')
      .upsert(
        { user_id: userId, exercise_id: exerciseId, weight: weight || null, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,exercise_id' }
      )
    setSaving(null)
    setSaved(exerciseId)
    setTimeout(() => setSaved(null), 1500)
  }, [supabase, userId])

  // Group exercises by block for visual separation
  const blocks: { key: string; icon: string; label: string; exercises: Exercise[] }[] = []
  for (const ex of day.exercises) {
    const last = blocks[blocks.length - 1]
    if (last && last.key === ex.block + ex.blockLabel) {
      last.exercises.push(ex)
    } else {
      blocks.push({ key: ex.block + ex.blockLabel, icon: ex.blockIcon, label: ex.blockLabel, exercises: [ex] })
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <h2 className="font-pixel text-base text-black">GYM</h2>

      {/* Day selector */}
      <div className="flex gap-0 border-2 border-black overflow-hidden shadow-pixel">
        {GYM_DAYS.map(d => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className={`flex-1 py-3 font-pixel text-xs transition-colors
              ${activeDay === d.day
                ? 'bg-black text-rach-yellow'
                : 'bg-white text-black hover:bg-rach-yellow'
              }
              border-r-2 border-black last:border-r-0`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Exercise blocks */}
      {blocks.map(block => (
        <div key={block.key} className="space-y-2">
          {/* Block header */}
          <div className={`flex items-center gap-2 px-3 py-2 border-2 border-black ${BLOCK_COLORS[block.exercises[0].block]}`}>
            <span className="text-sm">{block.icon}</span>
            <span className="font-pixel text-xs">{block.label.toUpperCase()}</span>
          </div>

          {/* Exercises */}
          {block.exercises.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              weight={weights[ex.id] || ''}
              isSaving={saving === ex.id}
              isSaved={saved === ex.id}
              onWeightChange={(val) => setWeights(w => ({ ...w, [ex.id]: val }))}
              onSave={() => saveWeight(ex.id, weights[ex.id] || '')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ExerciseRow({
  exercise,
  weight,
  isSaving,
  isSaved,
  onWeightChange,
  onSave,
}: {
  exercise: Exercise
  weight: string
  isSaving: boolean
  isSaved: boolean
  onWeightChange: (val: string) => void
  onSave: () => void
}) {
  return (
    <div className="card-pixel space-y-2 ml-2">
      {/* Name + meta */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-pixel text-black leading-relaxed flex-1" style={{ fontSize: '9px' }}>
          {exercise.name}
        </p>
        <div className="shrink-0 text-right space-y-0.5">
          {exercise.series !== '—' && (
            <p className="font-pixel text-black/50" style={{ fontSize: '7px' }}>
              {exercise.series} series
            </p>
          )}
          <p className="font-pixel text-black/50" style={{ fontSize: '7px' }}>
            {exercise.reps} reps
          </p>
        </div>
      </div>

      {/* Weight input — only for exercises with weight */}
      {exercise.hasWeight && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={weight}
            onChange={e => onWeightChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={e => e.key === 'Enter' && onSave()}
            placeholder="ej: 20kg, 15 c/lado"
            className="input-pixel flex-1"
            style={{ fontSize: '9px', padding: '6px 8px' }}
          />
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`font-pixel border-2 border-black px-2 py-1.5 text-xs transition-all shrink-0
              ${isSaved
                ? 'bg-rach-blue text-white'
                : 'bg-white text-black shadow-pixel-sm hover:bg-rach-yellow active:shadow-none active:translate-x-0.5 active:translate-y-0.5'
              }`}
            style={{ fontSize: '9px' }}
          >
            {isSaving ? '...' : isSaved ? '✓' : 'OK'}
          </button>
        </div>
      )}
    </div>
  )
}
