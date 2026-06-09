'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/log')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setError('Revisá tu email para confirmar la cuenta.')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-pixel text-xs text-black block mb-2">EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-pixel"
          placeholder="tu@email.com"
          required
        />
      </div>
      <div>
        <label className="font-pixel text-xs text-black block mb-2">CONTRASEÑA</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-pixel"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div className="border-2 border-rach-red bg-rach-red/10 p-3">
          <p className="font-pixel text-xs text-rach-red">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-pixel-blue w-full disabled:opacity-50"
      >
        {loading ? 'CARGANDO...' : mode === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
      </button>

      <button
        type="button"
        onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}
        className="font-pixel text-xs text-black/60 underline w-full text-center pt-2 bg-transparent border-none cursor-pointer"
      >
        {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
      </button>
    </form>
  )
}
