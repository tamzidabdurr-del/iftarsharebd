'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { helpRequests as staticHelp } from '@/lib/map-data'
import {
  AlertTriangle, MapPin, Users, Phone, Plus, Loader2, X,
  CheckCircle, RefreshCw
} from 'lucide-react'
import {
  subscribeToHelpRequests, addHelpRequest, markHelpFulfilled,
  type FirestoreHelpRequest, getTodayStr,
} from '@/lib/firestore'

const URGENCY_OPTIONS = [
  { value: 'high', label: '🚨 জরুরি', color: '#EF4444' },
  { value: 'medium', label: '⚠️ মাঝারি', color: '#F59E0B' },
  { value: 'low', label: '✅ সাধারণ', color: '#10B981' },
] as const

interface HelpPanelProps {
  onAdd?: () => void
}

function AddHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [gettingGps, setGettingGps] = useState(false)
  const [form, setForm] = useState({
    name: '', location: '', lat: 23.7104, lng: 90.4074,
    people_count: 10, urgency: 'high' as FirestoreHelpRequest['urgency'],
    need_description: '', contact: '', hasGps: false,
  })

  const getGps = () => {
    setGettingGps(true)
    navigator.geolocation.getCurrentPosition(
      p => { setForm(f => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude, hasGps: true })); setGettingGps(false) },
      () => setGettingGps(false), { timeout: 8000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addHelpRequest({ name: form.name, location: form.location, lat: form.lat, lng: form.lng, people_count: form.people_count, urgency: form.urgency, need_description: form.need_description, contact: form.contact || undefined })
      setSuccess(true)
    } catch { setSuccess(true) }
    finally { setLoading(false) }
  }

  const reset = () => { setSuccess(false); setForm({ name: '', location: '', lat: 23.7104, lng: 90.4074, people_count: 10, urgency: 'high', need_description: '', contact: '', hasGps: false }); onClose() }

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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground">সাহায্য চাই</h2>
                        <p className="text-xs text-muted-foreground">🔄 রাত ১২টায় স্বয়ংক্রিয় রিসেট</p>
                      </div>
                    </div>
                    <button onClick={reset} className="rounded-full p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {[
                      { label: 'আপনার নাম / গ্রুপের নাম *', placeholder: 'যেমন: রিকশাচালক গ্রুপ', field: 'name' },
                      { label: 'এলাকা / ঠিকানা *', placeholder: 'যেমন: পুরান ঢাকা, সদরঘাট', field: 'location' },
                      { label: 'যোগাযোগ নম্বর', placeholder: '01XXX-XXXXXX (ঐচ্ছিক)', field: 'contact' },
                    ].map(({ label, placeholder, field }) => (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                        <input type="text" placeholder={placeholder} value={(form as any)[field]}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                          required={field !== 'contact'}
                          className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                      </div>
                    ))}

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">কী প্রয়োজন? *</label>
                      <textarea value={form.need_description} onChange={e => setForm(f => ({ ...f, need_description: e.target.value }))} rows={2} required
                        placeholder="যেমন: ৫০ জন রিকশাচালকের জন্য ইফতার দরকার..."
                        className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted-foreground">কতজনের জন্য?</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <input type="number" min={1} max={1000} value={form.people_count}
                            onChange={e => setForm(f => ({ ...f, people_count: +e.target.value }))}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none w-16" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted-foreground">জরুরি মাত্রা</label>
                        <div className="flex flex-col gap-1">
                          {URGENCY_OPTIONS.map(u => (
                            <button key={u.value} type="button" onClick={() => setForm(f => ({ ...f, urgency: u.value }))}
                              className={`rounded-lg py-1.5 px-2 text-xs font-bold transition-all text-left ${form.urgency === u.value ? 'text-white' : 'bg-muted text-muted-foreground'}`}
                              style={form.urgency === u.value ? { backgroundColor: u.color } : {}}>
                              {u.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-orange-400/30 bg-orange-500/5 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-orange-500">📍 আমার অবস্থান</p>
                        <p className="text-[10px] text-muted-foreground">ম্যাপে সঠিকভাবে দেখাবে</p>
                      </div>
                      {form.hasGps
                        ? <div className="flex items-center gap-1 text-emerald-500"><CheckCircle className="h-4 w-4" /><span className="text-xs font-bold">পাওয়া গেছে</span></div>
                        : <button type="button" onClick={getGps} disabled={gettingGps} className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-500 hover:bg-orange-500/30 disabled:opacity-60">
                            {gettingGps ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'যাচাই করুন'}
                          </button>
                      }
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-3 py-2">
                      <span>🔄</span>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">এই অনুরোধ আজ রাত ১২:০০টায় মুছে যাবে</p>
                    </div>

                    <button type="submit" disabled={loading || !form.name || !form.location || !form.need_description}
                      className="w-full rounded-xl py-3.5 font-black text-sm text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />যোগ হচ্ছে...</span> : '🙏 সাহায্যের অনুরোধ পাঠান'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="text-5xl">🤲</div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">জাযাকাল্লাহু খাইরান!</h3>
                    <p className="text-sm text-muted-foreground mt-1">আপনার অনুরোধ পাঠানো হয়েছে।<br/>সেবকরা দেখতে পাচ্ছেন। রাত ১২টায় মুছে যাবে 🔄</p>
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

export function HelpPanel({ onAdd }: HelpPanelProps) {
  const [requests, setRequests] = useState<FirestoreHelpRequest[]>([])
  const [connected, setConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fulfilledIds, setFulfilledIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let unsub: (() => void) | null = null
    try {
      unsub = subscribeToHelpRequests(data => { setRequests(data); setConnected(true) })
    } catch { setConnected(false) }
    return () => unsub?.()
  }, [])

  const displayRequests = connected && requests.length > 0 ? requests : staticHelp.map(r => ({
    id: String(r.id), name: r.name, location: r.location, lat: r.lat, lng: r.lng,
    people_count: r.people, urgency: (r.urgent ? 'high' : 'low') as FirestoreHelpRequest['urgency'],
    need_description: r.need, fulfilled: false, date_str: getTodayStr(), created_at: null,
  }))

  const handleFulfill = async (id: string) => {
    if (fulfilledIds.has(id)) return
    setFulfilledIds(prev => new Set([...prev, id]))
    try { await markHelpFulfilled(id) } catch { /* offline */ }
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
      <div className="flex items-center gap-2 flex-wrap">
        <AlertTriangle className="h-5 w-5 text-secondary" />
        <h3 className="font-bold text-foreground">সাহায্যের অনুরোধ</h3>
        <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-500">{displayRequests.length}টি</span>
        {connected && (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1">
            <RefreshCw className="h-3 w-3 text-yellow-500" style={{ animation: 'spin 3s linear infinite' }} />
            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">আজ রাত ১২টায় রিসেট</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground -mt-1">এই মানুষগুলোর ইফতারের সাহায্য দরকার 🤲</p>

      {/* Add button */}
      <button onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-400/40 py-3 font-bold text-sm text-orange-500 hover:bg-orange-500/5 transition-colors">
        <Plus className="h-4 w-4" />
        সাহায্যের অনুরোধ দিন
      </button>

      {displayRequests.map((req, i) => (
        <motion.div key={req.id ?? i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
          className={`rounded-xl border p-4 ${req.urgency === 'high' ? 'border-secondary/50 bg-secondary/5' : req.urgency === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-card'}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-foreground">{req.name}</h4>
              {req.urgency === 'high' && <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-destructive/20 text-destructive">🚨 জরুরি</span>}
              {req.urgency === 'medium' && <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-600">⚠️ মাঝারি</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" /><span>{req.location}</span>
          </div>
          <p className="text-sm text-foreground/80 mb-3">{req.need_description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /><span>{req.people_count} জন</span>
            </div>
            <div className="flex items-center gap-2">
              {req.contact && (
                <button onClick={() => window.open(`tel:${req.contact}`)}
                  className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted/70">
                  <Phone className="h-3 w-3" />কল
                </button>
              )}
              <button
                onClick={() => {
                  const msg = encodeURIComponent(`আপনার সাহায্যের অনুরোধ পেয়েছি। আমি ইফতার দিতে আসছি। (iftarsharebd.vercel.app)`)
                  window.open(`https://wa.me/?text=${msg}`, '_blank')
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <Phone className="h-3 w-3" />সাহায্য করুন
              </button>
            </div>
          </div>
          {req.id && !fulfilledIds.has(req.id) && (
            <button onClick={() => handleFulfill(req.id!)}
              className="mt-2 w-full rounded-lg border border-primary/30 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
              ✅ ইফতার দিয়েছি — পূর্ণ হয়েছে চিহ্নিত করুন
            </button>
          )}
          {req.id && fulfilledIds.has(req.id) && (
            <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary">
              <CheckCircle className="h-3.5 w-3.5" />ইফতার পৌঁছে দেওয়া হয়েছে 🤲
            </div>
          )}
        </motion.div>
      ))}

      {displayRequests.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl">🤲</span>
          <p className="text-sm text-muted-foreground">আজ কোনো অনুরোধ নেই।<br/>আলহামদুলিল্লাহ!</p>
        </div>
      )}

      <AddHelpModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
