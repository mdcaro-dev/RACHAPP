import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import LoginForm from '@/components/LoginForm'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/log')
  }

  return (
    <main className="min-h-screen bg-rach-yellow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-2xl sm:text-3xl text-black mb-2 leading-relaxed">
            RACH
            <span className="text-rach-blue">APP</span>
          </h1>
          <p className="font-pixel text-xs text-black/60 mt-4">tu tracker de hábitos</p>
        </div>

        <div className="card-pixel">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
