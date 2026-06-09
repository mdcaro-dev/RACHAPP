'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/log', label: 'HOY', icon: '✎' },
  { href: '/history', label: 'HIST', icon: '◷' },
  { href: '/gym', label: 'GYM', icon: '💪' },
  { href: '/reports', label: 'STATS', icon: '▤' },
  { href: '/goals', label: 'METAS', icon: '◎' },
  { href: '/settings', label: 'CONFIG', icon: '⚙' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Top bar */}
      <header className="border-b-2 border-black bg-black px-4 py-3 flex items-center justify-between">
        <span className="font-pixel text-rach-yellow text-sm tracking-widest">
          RACH<span className="text-rach-blue">APP</span>
        </span>
        <button
          onClick={handleLogout}
          className="font-pixel text-xs text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          SALIR
        </button>
      </header>

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-black bg-rach-yellow">
        <div className="flex max-w-2xl mx-auto">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 border-r-2 border-black last:border-r-0
                  font-pixel text-xs transition-colors
                  ${active ? 'bg-black text-rach-yellow' : 'text-black hover:bg-black/10'}`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[8px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
