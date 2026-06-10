'use client'

import { useRouter } from 'next/navigation'

interface Props {
  today: string
  loggedDates: string[]
}

export default function GoToDayPicker({ today, loggedDates }: Props) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value
    if (date) router.push(`/history/${date}`)
  }

  return (
    <label className="btn-pixel text-xs cursor-pointer flex items-center gap-2 relative">
      + CARGAR DÍA
      <input
        type="date"
        max={today}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full"
      />
    </label>
  )
}
