'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { iftarSpots as staticIftarSpots, trafficPins as staticTraffic } from '@/lib/map-data'
import { VolunteerPanel } from './volunteer-panel'
import { HelpPanel } from './help-panel'
import {
  MapPin, Navigation, CheckCircle, AlertTriangle, ArrowRight,
  Clock, Plus, RefreshCw, Users, ThumbsUp, ThumbsDown, Star
} from 'lucide-react'
import {
  subscribeToIftarLocations, subscribeToEidRoutes,
  voteOnLocation, getMsUntilMidnight, getTodayStr,
  type FirestoreIftarLocation, type FirestoreEidRoute,
} from '@/lib/firestore'

interface InfoPanelProps {
  activeTab: number
  expanded: boolean
  onToggle: () => void
  onAddIftar?: () => void
  onAddTraffic?: () => void
  onAddHelp?: () => void
}

// ─── Countdown to midnight ─────────────────────────────────────────────────

function MidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calc = () => {
      const ms = getMsUntilMidnight()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1">
      <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
      <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
        রিসেট: {timeLeft}
      </span>
    </div>
  )
}

// ─── Iftar List Panel ──────────────────────────────────────────────────────

function IftarListPanel({ onAdd }: { onAdd?: () => void }) {
  const [spots, setSpots] = useState<FirestoreIftarLocation[]>([])
  const [connected, setConnected] = useState(false)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let unsub: (() => void) | null = null
    try {
      unsub = subscribeToIftarLocations((data) => { setSpots(data); setConnected(true) })
    } catch { setConnected(false) }
    return () => unsub?.()
  }, [])

  const handleVote = async (id: string, vote: 'yes' | 'no') => {
    if (votedIds.has(id)) return
    setVotedIds(prev => new Set([...prev, id]))
    try { await voteOnLocation(id, vote) } catch { /* offline */ }
  }

  const displaySpots = connected && spots.length > 0 ? spots : staticIftarSpots.map(s => ({ ...s, votes_yes: 0, votes_no: 0, gold_badge: false, gps_verified: false, is_permanent: true, date_str: getTodayStr(), food_type: 'সব ধরন', added_by: undefined, created_at: null } as FirestoreIftarLocation))

  const userAdded = displaySpots.filter(s => !s.is_permanent)
  const permanent = displaySpots.filter(s => s.is_permanent)

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">ইফতার স্পট</h3>
        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">{displaySpots.length}টি</span>
        {connected && <MidnightCountdown />}
      </div>

      {/* Add button */}
      <button onClick={onAdd}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 font-bold text-sm text-primary hover:bg-primary/5 transition-colors">
        <Plus className="h-4 w-4" />
        নতুন ইফতার স্পট যোগ করুন
      </button>

      {/* User-submitted today */}
      {userAdded.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-2">আজ যোগ করা হয়েছে</p>
          {userAdded.map((spot, i) => (
            <SpotCard key={spot.id ?? i} spot={spot} onVote={handleVote} voted={votedIds.has(spot.id!)} />
          ))}
        </div>
      )}

      {/* Permanent spots */}
      {permanent.length > 0 && (
        <div>
          {userAdded.length > 0 && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2">নিয়মিত ইফতার পয়েন্ট</p>}
          {permanent.map((spot, i) => (
            <SpotCard key={spot.id ?? i} spot={spot} onVote={handleVote} voted={votedIds.has(spot.id!)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SpotCard({ spot, onVote, voted }: { spot: FirestoreIftarLocation; onVote: (id: string, v: 'yes' | 'no') => void; voted: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 mb-2 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${spot.gold_badge ? 'bg-yellow-400/30' : spot.verified ? 'bg-primary/20' : 'bg-muted'}`}>
          {spot.gold_badge ? <Star className="h-4 w-4 text-yellow-500" /> : spot.verified ? <CheckCircle className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-bold text-foreground truncate">{spot.name}</h4>
            {spot.gold_badge && <span className="rounded-full bg-yellow-400/20 px-1.5 py-0.5 text-[9px] font-black text-yellow-600">⭐ Gold</span>}
            {spot.verified && !spot.gold_badge && <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">✓ Verified</span>}
            {spot.gps_verified && <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-500">📍 GPS</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{spot.location}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-foreground/70"><Clock className="h-3 w-3" />{spot.time}</span>
            <span className="text-xs font-medium text-secondary"><Users className="h-3 w-3 inline mr-0.5" />{spot.meals} জন</span>
            {spot.food_type && <span className="text-xs text-muted-foreground">{spot.food_type}</span>}
          </div>
        </div>
      </div>

      {/* Community vote (only for non-permanent, not-yet-verified) */}
      {!spot.is_permanent && !spot.verified && spot.id && (
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground flex-1">এটা কি সঠিক তথ্য?</span>
          <button onClick={() => onVote(spot.id!, 'yes')} disabled={voted}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${voted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/20'} text-emerald-500`}>
            <ThumbsUp className="h-3 w-3" />{spot.votes_yes}
          </button>
          <button onClick={() => onVote(spot.id!, 'no')} disabled={voted}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${voted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/20'} text-red-500`}>
            <ThumbsDown className="h-3 w-3" />{spot.votes_no}
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Traffic Panel ────────────────────────────────────────────────────────────

function TrafficPanel({ onAdd }: { onAdd?: () => void }) {
  const [routes, setRoutes] = useState<FirestoreEidRoute[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let unsub: (() => void) | null = null
    try {
      unsub = subscribeToEidRoutes((data) => { setRoutes(data); setConnected(true) })
    } catch { setConnected(false) }
    return () => unsub?.()
  }, [])

  const displayRoutes = connected && routes.length > 0 ? routes : staticTraffic.map(p => ({
    id: String(p.id), label: p.label, location: p.label, lat: p.lat, lng: p.lng,
    type: p.type, crowd_level: 'high' as const, description: p.description,
    date_str: getTodayStr(), reported_at: null,
  }))

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
      <div className="flex items-center gap-2 flex-wrap">
        <Navigation className="h-5 w-5 text-destructive" />
        <h3 className="font-bold text-foreground">ঈদ রুট ও যানজট</h3>
        <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-bold text-destructive ml-auto">{displayRoutes.length}টি</span>
        {connected && <MidnightCountdown />}
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-full bg-[#EF4444]" /><span className="text-muted-foreground">যানজট</span></div>
        <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-full bg-[#22C55E]" /><span className="text-muted-foreground">ফাঁকা / শর্টকাট</span></div>
      </div>

      {/* Add button */}
      <button onClick={onAdd}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-400/40 py-3 font-bold text-sm text-red-500 hover:bg-red-500/5 transition-colors">
        <Plus className="h-4 w-4" />
        রাস্তার আপডেট দিন
      </button>

      {/* Live indicator */}
      {connected && routes.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2">
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" /></span>
          <p className="text-xs font-medium text-foreground/70">সর্বশেষ আপডেট — আজ মানুষজনই দিয়েছেন</p>
        </div>
      )}

      {displayRoutes.map((pin, i) => (
        <motion.div key={pin.id ?? i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
          className={`flex items-start gap-3 rounded-xl border p-3 ${pin.type === 'jam' ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
          <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${pin.type === 'jam' ? 'bg-destructive/20' : 'bg-primary/20'}`}>
            {pin.type === 'jam' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <ArrowRight className="h-4 w-4 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{pin.label}</h4>
              {pin.crowd_level === 'high' && pin.type === 'jam' && <span className="text-[9px] font-black rounded-full bg-destructive/20 px-1.5 py-0.5 text-destructive">তীব্র</span>}
              {pin.crowd_level === 'medium' && pin.type === 'jam' && <span className="text-[9px] font-black rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-yellow-600">মাঝারি</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{pin.description}</p>
            {pin.fare_range && <p className="text-xs text-primary font-medium mt-1">💰 ভাড়া: {pin.fare_range}</p>}
          </div>
        </motion.div>
      ))}

      {displayRoutes.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl">🛣️</span>
          <p className="text-sm text-muted-foreground">এখনো কোনো রাস্তার আপডেট নেই।<br/>আপনিই প্রথম দিন!</p>
        </div>
      )}
    </div>
  )
}

// ─── Main InfoPanel ────────────────────────────────────────────────────────────

export function InfoPanel({ activeTab, expanded, onToggle, onAddIftar, onAddTraffic, onAddHelp }: InfoPanelProps) {
  const panels = [
    <IftarListPanel key="iftar" onAdd={onAddIftar} />,
    <TrafficPanel key="traffic" onAdd={onAddTraffic} />,
    <VolunteerPanel key="volunteer" />,
    <HelpPanel key="help" onAdd={onAddHelp} />,
  ]

  return (
    <>
      {/* Mobile: Bottom sheet */}
      <div className="md:hidden">
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" onClick={onToggle} />
          )}
        </AnimatePresence>
        <motion.div animate={{ y: expanded ? 0 : '100%' }} initial={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-[68px] left-0 right-0 z-40 max-h-[70vh] overflow-hidden rounded-t-2xl border-t border-border bg-card shadow-2xl">
          <div className="flex justify-center py-2.5 cursor-pointer" onClick={onToggle}>
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          {panels[activeTab]}
        </motion.div>
      </div>

      {/* Desktop: Side panel */}
      <div className="hidden md:flex md:w-[380px] md:flex-shrink-0 md:flex-col md:border-l md:border-border md:bg-card md:overflow-y-auto">
        {panels[activeTab]}
      </div>
    </>
  )
}
