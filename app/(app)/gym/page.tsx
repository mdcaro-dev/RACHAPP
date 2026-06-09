import { createServerSupabaseClient } from '@/lib/supabase-server'
import GymClient from './GymClient'

export default async function GymPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const { data: weights } = await supabase
    .from('gym_weights')
    .select('*')
    .eq('user_id', userId)

  return (
    <GymClient
      userId={userId}
      savedWeights={weights || []}
    />
  )
}
