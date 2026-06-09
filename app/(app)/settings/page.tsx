import { createServerSupabaseClient } from '@/lib/supabase-server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session!.user.id

  const [customResult, settingsResult] = await Promise.all([
    supabase.from('custom_habits').select('*').eq('user_id', userId).order('sort_order'),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
  ])

  return (
    <SettingsClient
      userId={userId}
      customHabits={customResult.data || []}
      healthyDayThreshold={settingsResult.data?.healthy_day_threshold ?? 70}
      settingsId={settingsResult.data?.id}
    />
  )
}
