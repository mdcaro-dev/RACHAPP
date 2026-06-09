export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  slept_7h: boolean | null
  healthy_breakfast: boolean | null
  breakfast_option_id: string | null
  healthy_lunch: boolean | null
  lunch_description: string | null
  healthy_dinner: boolean | null
  dinner_description: string | null
  ate_candy: boolean | null
  drank_soda: boolean | null
  physical_activity: string | null
  drank_alcohol: boolean | null
  custom_habits: Record<string, boolean>
  confirmed: boolean
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface CustomHabit {
  id: string
  user_id: string
  name: string
  question: string
  active: boolean
  sort_order: number
  created_at: string
}

export interface BreakfastOption {
  id: string
  user_id: string
  label: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  habit_key: string
  target_pct: number
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  healthy_day_threshold: number
  created_at: string
  updated_at: string
}

export type PhysicalActivity =
  | 'gym'
  | 'caminé'
  | 'corrí'
  | 'bici'
  | 'deporte'
  | 'nada'

export const PHYSICAL_ACTIVITY_OPTIONS: { value: PhysicalActivity; label: string }[] = [
  { value: 'gym', label: 'Fui al gym' },
  { value: 'caminé', label: 'Caminé mucho' },
  { value: 'corrí', label: 'Corrí' },
  { value: 'bici', label: 'Bici' },
  { value: 'deporte', label: 'Deporte' },
  { value: 'nada', label: 'Nada' },
]

export const CORE_HABIT_KEYS = [
  'slept_7h',
  'healthy_breakfast',
  'healthy_lunch',
  'healthy_dinner',
  'ate_candy',
  'drank_soda',
  'physical_activity',
  'drank_alcohol',
] as const

export const HABIT_LABELS: Record<string, string> = {
  slept_7h: '¿Dormiste 7 horas o más?',
  healthy_breakfast: '¿Desayunaste saludable?',
  healthy_lunch: '¿Almorzaste saludable?',
  healthy_dinner: '¿Cenaste saludable?',
  ate_candy: '¿Comiste alguna golosina?',
  drank_soda: '¿Tomaste gaseosa?',
  physical_activity: 'Actividad física',
  drank_alcohol: '¿Tomaste alcohol?',
}

// For goals: which habits count positively (true = good) vs negatively (true = bad)
export const HABIT_POSITIVE: Record<string, boolean> = {
  slept_7h: true,
  healthy_breakfast: true,
  healthy_lunch: true,
  healthy_dinner: true,
  ate_candy: false,
  drank_soda: false,
  physical_activity: true,
  drank_alcohol: false,
}
