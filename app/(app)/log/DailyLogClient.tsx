'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { BreakfastOption, CustomHabit, DailyLog, PHYSICAL_ACTIVITY_OPTIONS } from '@/types'

interface Props {
  today: string
  userId: string
  initialLog: DailyLog | null
  breakfastOptions: BreakfastOption[]
  customHabits: CustomHabit[]
}

type FormData = {
  slept_7h: boolean | null
  healthy_breakfast: boolean | null
  breakfast_option_id: string | null
  healthy_lunch: boolean | null
  lunch_description: string
  healthy_dinner: boolean | null
  dinner_description: string
  ate_candy: boolean | null
  drank_soda: boolean | null
  physical_activity: string | null
  drank_alcohol: boolean | null
  custom_habits: Record<string, boolean>
}

function formDataFromLog(log: DailyLog | null, customHabits: CustomHabit[]): FormData {
  const customMap: Record<string, boolean> = {}
  for (const h of customHabits) {
    customMap[h.id] = log?.custom_habits?.[h.id] ?? false
  }
  return {
    slept_7h: log?.slept_7h ?? null,
    healthy_breakfast: log?.healthy_breakfast ?? null,
    breakfast_option_id: log?.breakfast_option_id ?? null,
    healthy_lunch: log?.healthy_lunch ?? null,
    lunch_description: log?.lunch_description ?? '',
    healthy_dinner: log?.healthy_dinner ?? null,
    dinner_description: log?.dinner_description ?? '',
    ate_candy: log?.ate_candy ?? null,
    drank_soda: log?.drank_soda ?? null,
    physical_activity: log?.physical_activity ?? null,
    drank_alcohol: log?.drank_alcohol ?? null,
    custom_habits: customMap,
  }
}

function YesNoButton({ value, selected, onClick }: { value: boolean; selected: boolean | null; onClick: () => void }) {
  const isSelected = selected === value
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 font-pixel text-xs border-2 border-black transition-all duration-75
        ${isSelected
          ? value ? 'bg-rach-blue text-white shadow-pixel' : 'bg-rach-red text-white shadow-pixel'
          : 'bg-white text-black shadow-pixel-sm hover:bg-rach-yellow'
        }
        active:shadow-none active:translate-x-0.5 active:translate-y-0.5`}
    >
      {value ? 'SÍ' : 'NO'}
    </button>
  )
}

function countHabitsCompleted(form: FormData, customHabits: CustomHabit[]): { done: number; total: number } {
  let done = 0
  let total = 0

  // Positive habits (true = good)
  const positives: (boolean | null)[] = [
    form.slept_7h,
    form.healthy_breakfast,
    form.healthy_lunch,
    form.healthy_dinner,
  ]
  for (const v of positives) {
    total++
    if (v === true) done++
  }

  // Physical activity
  total++
  if (form.physical_activity && form.physical_activity !== 'nada') done++

  // Negative habits (false = good)
  const negatives: (boolean | null)[] = [form.ate_candy, form.drank_soda, form.drank_alcohol]
  for (const v of negatives) {
    total++
    if (v === false) done++
  }

  // Custom habits
  for (const h of customHabits) {
    total++
    if (form.custom_habits[h.id]) done++
  }

  return { done, total }
}

export default function DailyLogClient({ today, userId, initialLog, breakfastOptions, customHabits }: Props) {
  const [form, setForm] = useState<FormData>(() => formDataFromLog(initialLog, customHabits))
  const [locked, setLocked] = useState(initialLog?.confirmed ?? false)

  async function unlockDay() {
    setSaving(true)
    await supabase
      .from('daily_logs')
      .update({ confirmed: false, confirmed_at: null })
      .eq('user_id', userId)
      .eq('log_date', today)
    setLocked(false)
    setSaving(false)
  }
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newBreakfast, setNewBreakfast] = useState('')
  const [bfOptions, setBfOptions] = useState(breakfastOptions)
  const router = useRouter()
  const supabase = createClient()

  const { done, total } = countHabitsCompleted(form, customHabits)

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function saveProgress() {
    setSaving(true)
    const payload = {
      user_id: userId,
      log_date: today,
      slept_7h: form.slept_7h,
      healthy_breakfast: form.healthy_breakfast,
      breakfast_option_id: form.breakfast_option_id,
      healthy_lunch: form.healthy_lunch,
      lunch_description: form.lunch_description || null,
      healthy_dinner: form.healthy_dinner,
      dinner_description: form.dinner_description || null,
      ate_candy: form.ate_candy,
      drank_soda: form.drank_soda,
      physical_activity: form.physical_activity,
      drank_alcohol: form.drank_alcohol,
      custom_habits: form.custom_habits,
    }
    await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id,log_date' })
    setSaving(false)
  }

  async function confirmDay() {
    setSaving(true)
    const payload = {
      user_id: userId,
      log_date: today,
      slept_7h: form.slept_7h,
      healthy_breakfast: form.healthy_breakfast,
      breakfast_option_id: form.breakfast_option_id,
      healthy_lunch: form.healthy_lunch,
      lunch_description: form.lunch_description || null,
      healthy_dinner: form.healthy_dinner,
      dinner_description: form.dinner_description || null,
      ate_candy: form.ate_candy,
      drank_soda: form.drank_soda,
      physical_activity: form.physical_activity,
      drank_alcohol: form.drank_alcohol,
      custom_habits: form.custom_habits,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    }
    await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id,log_date' })
    setLocked(true)
    setShowConfirm(false)
    setSaving(false)
    router.refresh()
  }

  async function addBreakfastOption() {
    if (!newBreakfast.trim()) return
    const { data } = await supabase
      .from('breakfast_options')
      .insert({ user_id: userId, label: newBreakfast.trim() })
      .select()
      .single()
    if (data) {
      setBfOptions(prev => [...prev, data])
      setField('breakfast_option_id', data.id)
      setNewBreakfast('')
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-6">
        <div className="card-pixel text-center space-y-4">
          <p className="font-pixel text-xs text-black/60">RESUMEN DEL DÍA</p>
          <p className="font-pixel text-xl text-black leading-relaxed">
            {done} / {total}
          </p>
          <p className="font-pixel text-xs text-black">hábitos cumplidos hoy</p>
          <div className="w-full bg-black/10 border-2 border-black h-4">
            <div
              className="h-full bg-rach-blue transition-all"
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>
          <p className="font-pixel text-xs text-black">{Math.round((done / total) * 100)}%</p>
        </div>

        <p className="font-pixel text-xs text-center text-black">
          ¿Confirmás el día? Podés editarlo después si cometés un error.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="btn-pixel flex-1"
          >
            VOLVER
          </button>
          <button
            onClick={confirmDay}
            disabled={saving}
            className="btn-pixel-blue flex-1 disabled:opacity-50"
          >
            {saving ? '...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="font-pixel text-xs text-black/60 capitalize">{dateLabel}</p>
          <h2 className="font-pixel text-lg text-black mt-2">DÍA CONFIRMADO</h2>
        </div>

        <div className="card-pixel text-center space-y-3">
          <p className="font-pixel text-4xl">{done}/{total}</p>
          <p className="font-pixel text-xs text-black">hábitos cumplidos</p>
          <div className="w-full bg-black/10 border-2 border-black h-4">
            <div
              className="h-full bg-rach-blue"
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>
          <p className="font-pixel text-xs">{Math.round((done / total) * 100)}%</p>
        </div>

        <div className="card-pixel space-y-2">
          {renderSummaryItem('Dormir 7h+', form.slept_7h === true)}
          {renderSummaryItem('Desayuno saludable', form.healthy_breakfast === true)}
          {renderSummaryItem('Almuerzo saludable', form.healthy_lunch === true)}
          {renderSummaryItem('Cena saludable', form.healthy_dinner === true)}
          {renderSummaryItem('Actividad física', form.physical_activity !== 'nada' && form.physical_activity !== null)}
          {renderSummaryItem('Sin golosinas', form.ate_candy === false)}
          {renderSummaryItem('Sin gaseosa', form.drank_soda === false)}
          {renderSummaryItem('Sin alcohol', form.drank_alcohol === false)}
          {customHabits.map(h => renderSummaryItem(h.name, !!form.custom_habits[h.id]))}
        </div>

        <button
          onClick={unlockDay}
          disabled={saving}
          className="btn-pixel w-full disabled:opacity-50"
        >
          {saving ? '...' : '✎ EDITAR DÍA'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center">
        <p className="font-pixel text-xs text-black/60 capitalize">{dateLabel}</p>
        <h2 className="font-pixel text-base text-black mt-2">LOG DIARIO</h2>
      </div>

      {/* Progress bar */}
      <div className="card-pixel space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-pixel text-xs">PROGRESO</span>
          <span className="font-pixel text-xs">{done}/{total}</span>
        </div>
        <div className="w-full bg-black/10 border-2 border-black h-3">
          <div
            className="h-full bg-rach-blue transition-all duration-300"
            style={{ width: total > 0 ? `${Math.round((done / total) * 100)}%` : '0%' }}
          />
        </div>
      </div>

      {/* Q1 Sleep */}
      <QuestionBlock label="¿Dormiste 7 horas o más?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.slept_7h} onClick={() => setField('slept_7h', form.slept_7h === true ? null : true)} />
          <YesNoButton value={false} selected={form.slept_7h} onClick={() => setField('slept_7h', form.slept_7h === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q2 Breakfast healthy */}
      <QuestionBlock label="¿Desayunaste saludable?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.healthy_breakfast} onClick={() => setField('healthy_breakfast', form.healthy_breakfast === true ? null : true)} />
          <YesNoButton value={false} selected={form.healthy_breakfast} onClick={() => setField('healthy_breakfast', form.healthy_breakfast === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q3 What breakfast */}
      <QuestionBlock label="¿Qué desayunaste?">
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {bfOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setField('breakfast_option_id', form.breakfast_option_id === opt.id ? null : opt.id)}
                className={`py-2 px-3 text-left border-2 border-black font-pixel text-xs transition-all
                  ${form.breakfast_option_id === opt.id
                    ? 'bg-rach-blue text-white shadow-pixel'
                    : 'bg-white text-black shadow-pixel-sm hover:bg-rach-yellow'
                  }
                  active:shadow-none active:translate-x-0.5 active:translate-y-0.5`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBreakfast}
              onChange={e => setNewBreakfast(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBreakfastOption()}
              placeholder="Agregar opción..."
              className="input-pixel flex-1"
            />
            <button
              type="button"
              onClick={addBreakfastOption}
              className="btn-pixel px-3 text-xs"
            >
              +
            </button>
          </div>
        </div>
      </QuestionBlock>

      {/* Q4 Lunch healthy */}
      <QuestionBlock label="¿Almorzaste saludable?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.healthy_lunch} onClick={() => setField('healthy_lunch', form.healthy_lunch === true ? null : true)} />
          <YesNoButton value={false} selected={form.healthy_lunch} onClick={() => setField('healthy_lunch', form.healthy_lunch === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q5 What lunch */}
      <QuestionBlock label="¿Qué almorzaste?">
        <input
          type="text"
          value={form.lunch_description}
          onChange={e => setField('lunch_description', e.target.value)}
          placeholder="Ej: milanesa con ensalada"
          className="input-pixel"
        />
      </QuestionBlock>

      {/* Q6 Dinner healthy */}
      <QuestionBlock label="¿Cenaste saludable?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.healthy_dinner} onClick={() => setField('healthy_dinner', form.healthy_dinner === true ? null : true)} />
          <YesNoButton value={false} selected={form.healthy_dinner} onClick={() => setField('healthy_dinner', form.healthy_dinner === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q7 What dinner */}
      <QuestionBlock label="¿Qué cenaste?">
        <input
          type="text"
          value={form.dinner_description}
          onChange={e => setField('dinner_description', e.target.value)}
          placeholder="Ej: pasta con tuco"
          className="input-pixel"
        />
      </QuestionBlock>

      {/* Q8 Candy */}
      <QuestionBlock label="¿Comiste alguna golosina?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.ate_candy} onClick={() => setField('ate_candy', form.ate_candy === true ? null : true)} />
          <YesNoButton value={false} selected={form.ate_candy} onClick={() => setField('ate_candy', form.ate_candy === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q9 Soda */}
      <QuestionBlock label="¿Tomaste gaseosa?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.drank_soda} onClick={() => setField('drank_soda', form.drank_soda === true ? null : true)} />
          <YesNoButton value={false} selected={form.drank_soda} onClick={() => setField('drank_soda', form.drank_soda === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Q10 Physical activity */}
      <QuestionBlock label="Actividad física">
        <div className="grid grid-cols-2 gap-2">
          {PHYSICAL_ACTIVITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('physical_activity', form.physical_activity === opt.value ? null : opt.value)}
              className={`py-2 px-2 border-2 border-black font-pixel text-xs transition-all
                ${form.physical_activity === opt.value
                  ? 'bg-rach-blue text-white shadow-pixel'
                  : 'bg-white text-black shadow-pixel-sm hover:bg-rach-yellow'
                }
                active:shadow-none active:translate-x-0.5 active:translate-y-0.5`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </QuestionBlock>

      {/* Q11 Alcohol */}
      <QuestionBlock label="¿Tomaste alcohol?">
        <div className="flex gap-2">
          <YesNoButton value={true} selected={form.drank_alcohol} onClick={() => setField('drank_alcohol', form.drank_alcohol === true ? null : true)} />
          <YesNoButton value={false} selected={form.drank_alcohol} onClick={() => setField('drank_alcohol', form.drank_alcohol === false ? null : false)} />
        </div>
      </QuestionBlock>

      {/* Custom habits */}
      {customHabits.length > 0 && (
        <>
          <div className="font-pixel text-xs text-black/50 pt-2">— HÁBITOS PERSONALIZADOS —</div>
          {customHabits.map(habit => (
            <QuestionBlock key={habit.id} label={habit.question}>
              <div className="flex gap-2">
                <YesNoButton
                  value={true}
                  selected={form.custom_habits[habit.id] === undefined ? null : form.custom_habits[habit.id] ? true : false}
                  onClick={() => setForm(f => ({ ...f, custom_habits: { ...f.custom_habits, [habit.id]: !f.custom_habits[habit.id] } }))}
                />
                <YesNoButton
                  value={false}
                  selected={form.custom_habits[habit.id] === undefined ? null : form.custom_habits[habit.id] ? true : false}
                  onClick={() => setForm(f => ({ ...f, custom_habits: { ...f.custom_habits, [habit.id]: !f.custom_habits[habit.id] } }))}
                />
              </div>
            </QuestionBlock>
          ))}
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={saveProgress}
          disabled={saving}
          className="btn-pixel flex-1 disabled:opacity-50"
        >
          {saving ? '...' : 'GUARDAR'}
        </button>
        <button
          onClick={async () => { await saveProgress(); setShowConfirm(true) }}
          disabled={saving}
          className="btn-pixel-blue flex-1 disabled:opacity-50"
        >
          CARGAR DÍA
        </button>
      </div>
    </div>
  )
}

function QuestionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card-pixel space-y-3">
      <p className="font-pixel text-xs text-black leading-relaxed">{label}</p>
      {children}
    </div>
  )
}

function renderSummaryItem(label: string, met: boolean) {
  return (
    <div key={label} className="flex items-center gap-3">
      <span className={`font-pixel text-sm ${met ? 'text-rach-blue' : 'text-rach-red'}`}>
        {met ? '✓' : '✗'}
      </span>
      <span className="font-pixel text-xs text-black">{label}</span>
    </div>
  )
}
