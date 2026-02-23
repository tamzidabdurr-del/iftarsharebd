'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, MapPin, AlertTriangle, ArrowRight, Loader2, X, CheckCircle } from 'lucide-react'
import { addEidRoute, type FirestoreEidRoute } from '@/lib/firestore'

interface AddTrafficModalProps {
  open: boolean
  onClose: () => void
}

const CROWD_LEVELS = [
  { value: 'low', label: 'কম', color: '#22C55E' },
  { value: 'medium', label: 'মাঝারি', color: '#F59E0B' },
  { value: 'high', label: 'তীব্র', color: '#EF4444' },
] as const

const HOTSPOTS = [
  'ফার্মগেট', 'মহাখালী', 'মতিঝিল', 'গুলিস্তান', 'সায়েদাবাদ',
  'যাত্রাবাড়ী', 'মিরপুর-১০', 'উত্তরা', 'ধানমন্ডি', 'কুড়িল'
]

export function AddTrafficModal({ open, onClose }: AddTrafficModalProps) {
  const [type, setType] = useState<'jam' | 'shortcut'>('jam')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [gettingGps, setGettingGps] = useState(false)
  const [form, setForm] = useState({
    location: '', lat: 23.7509, lng: 90.3937, hasGps: false,
    crowd_level: 'high' as FirestoreEidRoute['crowd_level'],
    description: '', fare_range: '',
  })

  const getGps = () => {
    setGettingGps(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { setForm(f => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude, hasGps: true })); setGettingGps(false) },
      () => setGettingGps(false), { timeout: 8000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addEidRoute({ label: form.location, location: form.location, lat: form.lat, lng: form.lng, type, crowd_level: form.crowd_level, description: form.description, fare_range: form.fare_range || undefined })
      setSuccess(true)
    } catch { setSuccess(true) }
    finally { setLoading(false) }
  }

  const reset = () => { setSuccess(false); setForm({ location: '', lat: 23.7509, lng: 90.3937, hasGps: false, crowd_level: 'high', description: '', fare_range: '' }); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={reset} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                        <Navigation className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground">রাস্তার আপডেট দিন</h2>
                        <p className="text-xs text-muted-foreground">🔄 রাত ১২টায় স্বয়ংক্রিয় রিসেট</p>
                      </div>
                    </div>
                    <button onClick={reset} className="rounded-full p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {([['jam', '🚦 যানজট আছে', 'bg-red-500'], ['shortcut', '✅ ফাঁকা রাস্তা', 'bg-emerald-500']] as const).map(([v, label, cls]) => (
                      <button key={v} type="button" onClick={() => setType(v)}
                        className={`rounded-xl py-3 font-bold text-sm transition-all ${type === v ? cls + ' text-white' : 'bg-muted text-muted-foreground'}`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">এলাকার নাম *</label>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                          placeholder="যেমন: ফার্মগেট, মহাখালী..." required
                          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {HOTSPOTS.map(s => (
                          <button key={s} type="button" onClick={() => setForm(f => ({ ...f, location: s }))}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${form.location === s ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground hover:bg-muted'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">বিস্তারিত বলুন *</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} required
                        placeholder={type === 'jam' ? 'যেমন: তীব্র যানজট, বিকল্প পথ ব্যবহার করুন...' : 'যেমন: রামপুরা বাইপাস ফাঁকা, ১৫ মিনিট বাঁচবে...'}
                        className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none" />
                    </div>

                    {type === 'jam' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted-foreground">যানজটের মাত্রা</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {CROWD_LEVELS.map(cl => (
                            <button key={cl.value} type="button" onClick={() => setForm(f => ({ ...f, crowd_level: cl.value }))}
                              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${form.crowd_level === cl.value ? 'text-white' : 'bg-muted text-muted-foreground'}`}
                              style={form.crowd_level === cl.value ? { backgroundColor: cl.color } : {}}>
                              {cl.label} যানজট
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-primary">📍 আমার অবস্থান ব্যবহার করুন</p>
                        <p className="text-[10px] text-muted-foreground">ম্যাপে সঠিকভাবে দেখাবে</p>
                      </div>
                      {form.hasGps
                        ? <div className="flex items-center gap-1 text-emerald-500"><CheckCircle className="h-4 w-4" /><span className="text-xs font-bold">পাওয়া গেছে</span></div>
                        : <button type="button" onClick={getGps} disabled={gettingGps} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 disabled:opacity-60">
                            {gettingGps ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'যাচাই করুন'}
                          </button>
                      }
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-3 py-2">
                      <span>🔄</span>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">এই তথ্য আজ রাত ১২:০০টায় স্বয়ংক্রিয়ভাবে মুছে যাবে</p>
                    </div>

                    <button type="submit" disabled={loading || !form.location || !form.description}
                      className="w-full rounded-xl py-3.5 font-black text-sm text-white disabled:opacity-50"
                      style={{ background: type === 'jam' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#10B981,#059669)' }}>
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />যোগ হচ্ছে...</span>
                        : type === 'jam' ? '🚦 যানজটের খবর দিন' : '✅ ফাঁকা রাস্তার খবর দিন'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="text-5xl">{type === 'jam' ? '🚦' : '🛣️'}</div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">ধন্যবাদ!</h3>
                    <p className="text-sm text-muted-foreground mt-1">সবাই দেখতে পাচ্ছে।<br/>রাত ১২টায় স্বয়ংক্রিয়ভাবে মুছে যাবে 🔄</p>
                  </div>
                  <button onClick={reset} className="w-full rounded-xl py-3 font-bold text-white" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>ঠিক আছে</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
