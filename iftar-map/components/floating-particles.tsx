'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  type: 'date' | 'star'
  size: number
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 15,
      type: Math.random() > 0.4 ? 'star' : 'date',
      size: 8 + Math.random() * 14,
    }))
    setParticles(items)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle-float absolute"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            opacity: 0.35,
          }}
        >
          {p.type === 'date' ? (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="#F59E0B" opacity="0.8" />
              <circle cx="12" cy="12" r="8" fill="#F59E0B" opacity="0.3" />
            </svg>
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="#10B981" opacity="0.6">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
      {/* Crescent moon */}
      <div className="moon-glow fixed top-6 right-6 z-50 opacity-60 md:top-8 md:right-8">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M36 24c0-8.284-5.716-16-14-16 2 2.5 3 6 3 10s-1 7.5-3 10c8.284 0 14-7.716 14-4z"
            fill="#F59E0B"
            opacity="0.9"
          />
          <circle cx="24" cy="24" r="12" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
