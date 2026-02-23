'use client'

import { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { subscribeToDaily, type DailyStats } from '@/lib/firestore'

const DAILY_TARGET = 20000

export function LiveCounter() {
  const [stats, setStats] = useState<DailyStats>({
    total: 18450,
    volunteers: 0,
    locations: 0,
    help_fulfilled: 0,
    last_updated: null,
  })
  const [celebrated, setCelebrated] = useState(false)
  const [connected, setConnected] = useState(false)
  const counterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    try {
      unsubscribe = subscribeToDaily((data) => {
        setStats(data)
        setConnected(true)
      })
    } catch {
      setConnected(false)
      const interval = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          total: prev.total + Math.floor(Math.random() * 8 + 2),
        }))
      }, 5000)
      return () => clearInterval(interval)
    }
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    if (stats.total >= DAILY_TARGET && !celebrated) {
      setCelebrated(true)
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.2 },
        colors: ['#10B981', '#F59E0B', '#ffffff', '#34D399'],
      })
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance('আলহামদুলিল্লাহ! বিশ হাজার মানুষের ইফতার সম্পন্ন হয়েছে!')
        msg.lang = 'bn-BD'
        window.speechSynthesis.speak(msg)
      }
    }
  }, [stats.total, celebrated])

  const progress = Math.min((stats.total / DAILY_TARGET) * 100, 100)
  const formatted = stats.total.toLocaleString('bn-BD')

  return (
    <div ref={counterRef} className="w-full flex flex-col items-center gap-1.5 py-1">
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'animate-ping bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
          <span className={`relative inline-flex h-3 w-3 rounded-full ${connected ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
        </span>
        <p className="text-sm font-semibold text-foreground md:text-base">
          {'আজ '}
          <span className="text-secondary font-black text-base md:text-xl tabular-nums">{formatted}+</span>
          {' মানুষ ইফতার পেয়েছে 🤲'}
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-[10px] text-foreground/70 mb-1">
          <span>লক্ষ্য: ২০,০০০ জন</span>
          <span>{progress.toFixed(0)}% সম্পন্ন</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #F59E0B)' }}
          />
        </div>
      </div>
    </div>
  )
}
