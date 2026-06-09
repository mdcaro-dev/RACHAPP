import { createServerSupabaseClient } from '@/lib/supabase-server'
import GoalsClient from './GoalsClient'

export default async function GoalsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const [goalsResult, customResult] = await Promise.all([
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('custom_habits').select('*').eq('user_id', userId).eq('active', true).order('sort_order'),
  ])

  return (
    <GoalsClient
      userId={userId}
      goals={goalsResult.data || []}
      customHabits={customResult.data || []}
    />
  )
}
