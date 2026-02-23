'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { IftarSpot, TrafficPin, HelpRequest } from '@/lib/map-data'
import { subscribeToIftarLocations, subscribeToEidRoutes, subscribeToHelpRequests, type FirestoreIftarLocation, type FirestoreEidRoute, type FirestoreHelpRequest } from '@/lib/firestore'

function createIcon(color: string, pulse: boolean, size: number = 28, emoji?: string) {
  const pulseClass = pulse ? 'pin-pulse' : ''
  const inner = emoji
    ? `<div style="font-size:${size * 0.5}px; line-height:1">${emoji}</div>`
    : `<div style="width:${size * 0.35}px;height:${size * 0.35}px;border-radius:50%;background:rgba(255,255,255,0.8)"></div>`
  return L.divIcon({
    html: `<div class="${pulseClass}" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color}80,0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">${inner}</div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

const icons = {
  iftarVerified: createIcon('#10B981', true, 30),
  iftarGold: createIcon('#F59E0B', true, 32, '⭐'),
  iftarUnverified: createIcon('#6B7280', false, 22),
  iftarUserAdded: createIcon('#3B82F6', true, 26),
  trafficJam: createIcon('#EF4444', false, 26),
  trafficShortcut: createIcon('#22C55E', false, 24),
  helpUrgent: createIcon('#F97316', true, 30),
  helpNormal: createIcon('#FB923C', false, 24),
}

function MapBounds() {
  const map = useMap()
  useEffect(() => {
    map.setMaxBounds([[20.5, 87.5], [26.7, 92.7]])
  }, [map])
  return null
}

interface IftarMapProps {
  activeTab: number
  iftarSpots: IftarSpot[]
  trafficPins: TrafficPin[]
  helpRequests: HelpRequest[]
}

export function IftarMap({ activeTab, iftarSpots, trafficPins, helpRequests }: IftarMapProps) {
  const [mounted, setMounted] = useState(false)
  // Firebase live data
  const [liveIftarSpots, setLiveIftarSpots] = useState<FirestoreIftarLocation[]>([])
  const [liveRoutes, setLiveRoutes] = useState<FirestoreEidRoute[]>([])
  const [liveHelp, setLiveHelp] = useState<FirestoreHelpRequest[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const unsubs: Array<() => void> = []
    try {
      unsubs.push(subscribeToIftarLocations(d => { setLiveIftarSpots(d); setConnected(true) }))
      unsubs.push(subscribeToEidRoutes(d => setLiveRoutes(d)))
      unsubs.push(subscribeToHelpRequests(d => setLiveHelp(d)))
    } catch { /* Firebase not configured, use static */ }
    return () => unsubs.forEach(u => u())
  }, [mounted])

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">ম্যাপ লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  // Merge static + Firebase data
  const displayIftarSpots = connected && liveIftarSpots.length > 0 ? liveIftarSpots : iftarSpots.map(s => ({ ...s, votes_yes: 0, votes_no: 0, gold_badge: false, gps_verified: false, is_permanent: true, date_str: '', food_type: 'সব ধরন', created_at: null } as FirestoreIftarLocation))
  const displayRoutes = connected && liveRoutes.length > 0 ? liveRoutes : trafficPins.map(p => ({ id: String(p.id), label: p.label, location: p.label, lat: p.lat, lng: p.lng, type: p.type, crowd_level: 'high' as const, description: p.description, date_str: '', reported_at: null }))
  const displayHelp = connected && liveHelp.length > 0 ? liveHelp : helpRequests.map(r => ({ id: String(r.id), name: r.name, location: r.location, lat: r.lat, lng: r.lng, people_count: r.people, urgency: (r.urgent ? 'high' : 'low') as FirestoreHelpRequest['urgency'], need_description: r.need, fulfilled: false, date_str: '', created_at: null }))

  return (
    <MapContainer center={[23.8, 90.4]} zoom={7} minZoom={6} maxZoom={15} className="h-full w-full" zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
      <MapBounds />

      {/* Tab 0: Iftar Spots */}
      {activeTab === 0 && displayIftarSpots.map((spot, i) => (
        <Marker key={spot.id ?? i} position={[spot.lat, spot.lng]}
          icon={spot.gold_badge ? icons.iftarGold : spot.verified ? icons.iftarVerified : spot.is_permanent === false ? icons.iftarUserAdded : icons.iftarUnverified}>
          <Popup>
            <div className="min-w-[200px] p-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">{spot.name}</h3>
                {spot.gold_badge && <span className="text-yellow-500 text-xs font-bold">⭐ Gold</span>}
                {spot.verified && !spot.gold_badge && <span className="text-xs text-green-600 font-bold">✓ Verified</span>}
              </div>
              <p className="text-xs text-gray-600 mb-1">{spot.location}</p>
              <div className="flex gap-3 text-xs text-gray-700">
                <span>🕐 {spot.time}</span>
                <span>👥 {spot.meals} জন</span>
              </div>
              {spot.food_type && <p className="text-xs text-gray-500 mt-1">🍽️ {spot.food_type}</p>}
              {spot.contact && <p className="text-xs text-gray-500 mt-0.5">📞 {spot.contact}</p>}
              {!spot.is_permanent && <p className="text-[10px] text-orange-500 mt-1">🔄 আজ রাত ১২টায় মুছে যাবে</p>}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Tab 1: Traffic */}
      {activeTab === 1 && displayRoutes.map((pin, i) => (
        <Marker key={pin.id ?? i} position={[pin.lat, pin.lng]}
          icon={pin.type === 'jam' ? icons.trafficJam : icons.trafficShortcut}>
          <Popup>
            <div className="min-w-[180px] p-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block h-3 w-3 rounded-full ${pin.type === 'jam' ? 'bg-red-500' : 'bg-green-500'}`} />
                <h3 className="font-bold text-sm">{pin.label}</h3>
              </div>
              <p className="text-xs text-gray-600">{pin.description}</p>
              {pin.fare_range && <p className="text-xs text-blue-600 mt-1">💰 ভাড়া: {pin.fare_range}</p>}
              {'crowd_level' in pin && pin.crowd_level === 'high' && <p className="text-[10px] text-red-500 mt-1 font-bold">⚠️ তীব্র যানজট</p>}
              <p className="text-[10px] text-orange-500 mt-1">🔄 আজ রাত ১২টায় মুছে যাবে</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Tab 3: Help */}
      {activeTab === 3 && displayHelp.map((req, i) => (
        <Marker key={req.id ?? i} position={[req.lat, req.lng]}
          icon={req.urgency === 'high' ? icons.helpUrgent : icons.helpNormal}>
          <Popup>
            <div className="min-w-[200px] p-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">{req.name}</h3>
                {req.urgency === 'high' && <span className="text-xs text-red-500 font-bold">🚨 জরুরি</span>}
              </div>
              <p className="text-xs text-gray-600 mb-1">{req.location}</p>
              <p className="text-xs text-gray-700">{req.need_description}</p>
              <p className="text-xs text-gray-500 mt-1">👥 {req.people_count} জন</p>
              <p className="text-[10px] text-orange-500 mt-1">🔄 আজ রাত ১২টায় মুছে যাবে</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
