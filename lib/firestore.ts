/**
 * ইফতার শেয়ার ম্যাপ — Firestore Collections
 *
 * Daily Reset Logic (no Cloud Functions needed):
 *   প্রতিটি user-submitted document এ `date_str: "2026-03-01"` থাকে।
 *   Query-তে `where('date_str', '==', today)` দিলে auto-reset হয়।
 *   রাত ১২টায় date পাল্টালে পুরনো documents automatically বাদ পড়ে।
 *
 * Collections:
 *   iftar_locations  — ইফতার স্পট (permanent + daily user-added)
 *   eid_routes       — যানজট / শর্টকাট (daily only)
 *   help_requests    — সাহায্য চাই (daily only)
 *   volunteers       — সেবক (permanent)
 *   stats/daily      — realtime counter
 */

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Date Helper ─────────────────────────────────────────────────────────────

/** আজকের তারিখ string: "2026-03-01" */
export function getTodayStr(): string {
  const d = new Date()
  // Bangladesh time (UTC+6)
  const bd = new Date(d.getTime() + 6 * 60 * 60 * 1000)
  return bd.toISOString().slice(0, 10)
}

/** রাত ১২টায় কতক্ষণ বাকি (ms) */
export function getMsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FirestoreIftarLocation {
  id?: string
  name: string
  location: string
  lat: number
  lng: number
  food_type: string
  time: string
  meals: number
  contact: string
  verified: boolean
  votes_yes: number
  votes_no: number
  gold_badge: boolean
  gps_verified: boolean
  is_permanent: boolean   // true = সবসময় দেখাবে, false = আজকেই
  date_str: string        // "2026-03-01" — daily reset এর জন্য
  added_by?: string
  created_at: Timestamp | null
}

export interface FirestoreEidRoute {
  id?: string
  label: string
  location: string
  lat: number
  lng: number
  type: 'jam' | 'shortcut'
  crowd_level: 'low' | 'medium' | 'high'
  description: string
  fare_range?: string
  date_str: string        // daily reset
  reported_by?: string
  reported_at: Timestamp | null
}

export interface FirestoreVolunteer {
  id?: string
  name: string
  phone: string
  city: string
  target_group: 'rickshaw' | 'homeless' | 'orphan' | 'widow' | 'all'
  meals_target: number
  meals_done: number
  sawab_points: number
  joined_at: Timestamp | null
}

export interface FirestoreHelpRequest {
  id?: string
  name: string
  location: string
  lat: number
  lng: number
  people_count: number
  urgency: 'low' | 'medium' | 'high'
  need_description: string
  contact?: string
  fulfilled: boolean
  date_str: string        // daily reset
  created_at: Timestamp | null
}

export interface DailyStats {
  total: number
  volunteers: number
  locations: number
  help_fulfilled: number
  routes_reported: number
  last_updated: Timestamp | null
  date_str: string
}

// ─── Realtime Counter ─────────────────────────────────────────────────────────

export function subscribeToDaily(callback: (stats: DailyStats) => void) {
  const ref = doc(db, 'stats', 'daily')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as DailyStats
      // যদি stored date আজকের না হয়, reset করো
      if (data.date_str !== getTodayStr()) {
        updateDoc(ref, {
          total: 0, volunteers: 0, locations: 0,
          help_fulfilled: 0, routes_reported: 0,
          date_str: getTodayStr(),
          last_updated: serverTimestamp(),
        })
        callback({ total: 0, volunteers: 0, locations: 0, help_fulfilled: 0, routes_reported: 0, last_updated: null, date_str: getTodayStr() })
      } else {
        callback(data)
      }
    } else {
      callback({ total: 18450, volunteers: 0, locations: 0, help_fulfilled: 0, routes_reported: 0, last_updated: null, date_str: getTodayStr() })
    }
  })
}

export async function incrementDailyCount(field: string = 'total', amount: number = 1) {
  try {
    await updateDoc(doc(db, 'stats', 'daily'), {
      [field]: increment(amount),
      last_updated: serverTimestamp(),
    })
  } catch { /* doc may not exist yet */ }
}

// ─── Iftar Locations ──────────────────────────────────────────────────────────

/**
 * আজকের ইফতার স্পট + permanent স্পট সাবস্ক্রাইব করো
 * Permanent ones always show, user-added ones reset at midnight
 */
export function subscribeToIftarLocations(
  callback: (spots: FirestoreIftarLocation[]) => void
) {
  const today = getTodayStr()

  // Query 1: Today's user-added spots
  const todayQuery = query(
    collection(db, 'iftar_locations'),
    where('date_str', '==', today),
    orderBy('created_at', 'desc'),
    limit(50)
  )

  // Query 2: Permanent spots (mosque-level, always shown)
  const permanentQuery = query(
    collection(db, 'iftar_locations'),
    where('is_permanent', '==', true),
    limit(30)
  )

  const spots = new Map<string, FirestoreIftarLocation>()
  let unsubToday: () => void
  let unsubPermanent: () => void

  const emit = () => callback(Array.from(spots.values()))

  unsubToday = onSnapshot(todayQuery, (snap) => {
    snap.docs.forEach((d) => spots.set(d.id, { id: d.id, ...d.data() } as FirestoreIftarLocation))
    emit()
  })

  unsubPermanent = onSnapshot(permanentQuery, (snap) => {
    snap.docs.forEach((d) => spots.set(d.id, { id: d.id, ...d.data() } as FirestoreIftarLocation))
    emit()
  })

  return () => { unsubToday(); unsubPermanent() }
}

export async function addIftarLocation(data: {
  name: string; location: string; lat: number; lng: number
  food_type: string; time: string; meals: number; contact: string
  gps_verified: boolean
}) {
  const docRef = await addDoc(collection(db, 'iftar_locations'), {
    ...data,
    votes_yes: 0, votes_no: 0,
    verified: false, gold_badge: false,
    is_permanent: false,
    date_str: getTodayStr(),
    created_at: serverTimestamp(),
  })
  await incrementDailyCount('locations')
  return docRef
}

export async function voteOnLocation(locationId: string, vote: 'yes' | 'no') {
  const ref = doc(db, 'iftar_locations', locationId)
  await updateDoc(ref, { [`votes_${vote}`]: increment(1) })
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data() as FirestoreIftarLocation
    const total = data.votes_yes + data.votes_no
    if (total >= 3 && data.votes_yes / total >= 0.85 && !data.verified) {
      await updateDoc(ref, { verified: true })
    }
  }
}

export function checkGpsDistance(uLat: number, uLng: number, sLat: number, sLng: number): number {
  const R = 6371000
  const dLat = ((sLat - uLat) * Math.PI) / 180
  const dLng = ((sLng - uLng) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((uLat * Math.PI) / 180) * Math.cos((sLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Eid Routes (daily) ────────────────────────────────────────────────────────

/** আজকের রাস্তার আপডেট সাবস্ক্রাইব করো */
export function subscribeToEidRoutes(callback: (routes: FirestoreEidRoute[]) => void) {
  const q = query(
    collection(db, 'eid_routes'),
    where('date_str', '==', getTodayStr()),
    orderBy('reported_at', 'desc'),
    limit(50)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreEidRoute)))
  })
}

export async function addEidRoute(data: {
  label: string; location: string; lat: number; lng: number
  type: 'jam' | 'shortcut'; crowd_level: 'low' | 'medium' | 'high'
  description: string; fare_range?: string
}) {
  const docRef = await addDoc(collection(db, 'eid_routes'), {
    ...data,
    date_str: getTodayStr(),
    reported_at: serverTimestamp(),
  })
  await incrementDailyCount('routes_reported')
  return docRef
}

// ─── Volunteers (permanent) ───────────────────────────────────────────────────

export function subscribeToVolunteers(callback: (volunteers: FirestoreVolunteer[]) => void) {
  const q = query(
    collection(db, 'volunteers'),
    orderBy('meals_done', 'desc'),
    limit(20)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreVolunteer)))
  })
}

export async function registerVolunteer(data: {
  name: string; phone: string; city: string
  target_group: FirestoreVolunteer['target_group']; meals_target: number
}) {
  const docRef = await addDoc(collection(db, 'volunteers'), {
    ...data,
    meals_done: 0,
    sawab_points: 0,
    joined_at: serverTimestamp(),
  })
  await incrementDailyCount('volunteers')
  return docRef
}

// ─── Help Requests (daily) ────────────────────────────────────────────────────

export function subscribeToHelpRequests(callback: (requests: FirestoreHelpRequest[]) => void) {
  const q = query(
    collection(db, 'help_requests'),
    where('date_str', '==', getTodayStr()),
    where('fulfilled', '==', false),
    orderBy('urgency', 'desc'),
    orderBy('created_at', 'desc'),
    limit(30)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreHelpRequest)))
  })
}

export async function addHelpRequest(data: {
  name: string; location: string; lat: number; lng: number
  people_count: number; urgency: FirestoreHelpRequest['urgency']
  need_description: string; contact?: string
}) {
  return addDoc(collection(db, 'help_requests'), {
    ...data,
    fulfilled: false,
    date_str: getTodayStr(),
    created_at: serverTimestamp(),
  })
}

export async function markHelpFulfilled(id: string) {
  await updateDoc(doc(db, 'help_requests', id), { fulfilled: true })
  await incrementDailyCount('help_fulfilled')
}
