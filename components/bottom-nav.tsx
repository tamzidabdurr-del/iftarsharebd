'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation, Heart, HandHelping } from 'lucide-react'

const tabs = [
  { label: 'ইফতার ম্যাপ', icon: MapPin, color: '#10B981' },
  { label: 'ঈদ রুট', icon: Navigation, color: '#EF4444' },
  { label: 'সেবক হোন', icon: Heart, color: '#10B981' },
  { label: 'অসহায় খুঁজুন', icon: HandHelping, color: '#F97316' },
]

interface BottomNavProps {
  activeTab: number
  onTabChange: (tab: number) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="relative z-30 flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-stretch">
        {tabs.map((tab, i) => {
          const Icon = tab.icon
          const isActive = activeTab === i
          return (
            <button
              key={tab.label}
              onClick={() => onTabChange(i)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-1 -top-0.5 h-0.5 rounded-full"
                  style={{ background: tab.color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive ? 'scale-110' : 'opacity-50'
                }`}
                style={isActive ? { background: `${tab.color}20` } : undefined}
              >
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: isActive ? tab.color : undefined }}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
