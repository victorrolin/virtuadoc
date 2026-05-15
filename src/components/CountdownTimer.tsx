'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function CountdownTimer({ targetDate, targetTime }: { targetDate: string, targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const target = new Date(`${targetDate}T${targetTime}`)
      const diff = target.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(null)
        clearInterval(timer)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, targetTime])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
      <Clock className="h-3 w-3" />
      Em {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}{timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  )
}
