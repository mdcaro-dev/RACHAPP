import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-rach-yellow flex flex-col">
      <NavBar />
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
