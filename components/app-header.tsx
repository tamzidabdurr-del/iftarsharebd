'use client'

import { LiveCounter } from './live-counter'

export function AppHeader() {
  return (
    <header className="relative z-20 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #10B981 40%, #F59E0B 100%)' }}>
      <div className="flex flex-col items-center px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
            <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#064e3b" />
            <path d="M22 16c0-4.5-3-8-7-8 1 1.5 1.5 3.5 1.5 5.5S14 18 13 19.5c4.5 1 9-1 9-3.5z" fill="#F59E0B" />
            <path d="M10 22l1-3h4l1 3H10z" fill="#10B981" />
            <circle cx="14" cy="12" r="1.5" fill="#F59E0B" />
          </svg>
          <div className="text-center">
            <h1 className="text-lg font-extrabold tracking-tight text-foreground md:text-2xl text-balance">
              ইফতার শেয়ার ম্যাপ ২০২৬
            </h1>
            <p className="text-xs font-medium text-foreground/80 md:text-sm">
              রমজান মুবারাক - বাংলাদেশ
            </p>
          </div>
        </div>
        <LiveCounter />
      </div>
    </header>
  )
}
