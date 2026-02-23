'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { FloatingParticles } from '@/components/floating-particles'
import { InfoPanel } from '@/components/info-panel'
import { ShareButton } from '@/components/share-card'
import { AddIftarModal } from '@/components/add-iftar-modal'
import { AddTrafficModal } from '@/components/add-traffic-modal'
import { iftarSpots, trafficPins, helpRequests } from '@/lib/map-data'
import { ChevronUp, Plus, Navigation } from 'lucide-react'
import { getMsUntilMidnight } from '@/lib/firestore'

const IftarMap = dynamic(() => import('@/components/iftar-map').then((m) => ({ default: m.IftarMap })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">ম্যাপ লোড হচ্ছে...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [addIftarOpen, setAddIftarOpen] = useState(false)
  const [addTrafficOpen, setAddTrafficOpen] = useState(false)

  // PWA permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Auto-reload at midnight for fresh data
  useEffect(() => {
    const ms = getMsUntilMidnight()
    const timer = setTimeout(() => window.location.reload(), ms + 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleTabChange = useCallback((tab: number) => {
    setActiveTab(tab)
    setPanelExpanded(true)
  }, [])

  // Floating action button label/action based on tab
  const getFabConfig = () => {
    switch (activeTab) {
      case 0: return { label: 'ইফতার স্পট', icon: Plus, color: '#10B981', action: () => setAddIftarOpen(true) }
      case 1: return { label: 'রাস্তার আপডেট', icon: Navigation, color: '#EF4444', action: () => setAddTrafficOpen(true) }
      default: return null
    }
  }
  const fab = getFabConfig()

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-background">
      <FloatingParticles />
      <AppHeader />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <IftarMap
            activeTab={activeTab}
            iftarSpots={iftarSpots}
            trafficPins={trafficPins}
            helpRequests={helpRequests}
          />

          {/* Floating controls */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between pointer-events-none md:bottom-6 md:left-6 md:right-6">
            <div className="pointer-events-auto flex items-end gap-2">
              <ShareButton />
              {/* Dynamic FAB based on active tab */}
              {fab && (
                <button
                  onClick={fab.action}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${fab.color}, ${fab.color}cc)` }}
                >
                  <fab.icon className="h-4 w-4" />
                  {fab.label}
                </button>
              )}
            </div>

            <button
              onClick={() => setPanelExpanded(!panelExpanded)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md md:hidden"
            >
              <ChevronUp className={`h-4 w-4 transition-transform ${panelExpanded ? 'rotate-180' : ''}`} />
              {panelExpanded ? 'ম্যাপ দেখুন' : 'তালিকা দেখুন'}
            </button>
          </div>
        </div>

        <InfoPanel
          activeTab={activeTab}
          expanded={panelExpanded}
          onToggle={() => setPanelExpanded(!panelExpanded)}
          onAddIftar={() => setAddIftarOpen(true)}
          onAddTraffic={() => setAddTrafficOpen(true)}
        />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <AddIftarModal open={addIftarOpen} onClose={() => setAddIftarOpen(false)} />
      <AddTrafficModal open={addTrafficOpen} onClose={() => setAddTrafficOpen(false)} />
    </main>
  )
}
