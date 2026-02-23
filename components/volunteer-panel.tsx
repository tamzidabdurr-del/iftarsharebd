'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, User, MapPin, Heart, Loader2, Star, Trophy } from 'lucide-react'
import {
  subscribeToVolunteers,
  registerVolunteer,
  type FirestoreVolunteer,
} from '@/lib/firestore'
import { topVolunteers as staticVolunteers } from '@/lib/map-data'

const TARGET_GROUPS = [
  { value: 'rickshaw', label: 'রিকশাওয়ালা 🛺' },
  { value: 'homeless', label: 'অসহায় মানুষ 🏠' },
  { value: 'orphan', label: 'এতিম শিশু 👦' },
  { value: 'widow', label: 'বিধবা মহিলা 👩' },
  { value: 'all', label: 'সবার জন্য ❤️' },
] as const

export function VolunteerPanel() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [volunteers, setVolunteers] = useState<FirestoreVolunteer[]>([])
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', city: '',
    target_group: 'all' as FirestoreVolunteer['target_group'],
    meals_target: 50,
  })

  useEffect(() => {
    let unsub: (() => void) | null = null
    try {
      unsub = subscribeToVolunteers((data) => { setVolunteers(data); setFirebaseConnected(true) })
    } catch { setFirebaseConnected(false) }
    return () => unsub?.()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (firebaseConnected) await registerVolunteer(form)
      setSubmitted(true); setShowForm(false)
    } catch { setSubmitted(true); setShowForm(false) }
    finally { setLoading(false) }
  }

  const displayVolunteers = firebaseConnected && volunteers.length > 0
    ? volunteers
    : staticVolunteers.map((v) => ({
        id: String(v.id), name: v.name, city: v.area, meals_done: v.meals,
        meals_target: v.meals + 500, sawab_points: v.meals * 10,
        phone: '', target_group: 'all' as const, joined_at: null,
      }))

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[60vh] md:max-h-none">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">সেবক নিবন্ধন</h3>
          {firebaseConnected && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">রমজানে অসহায় মানুষদের ইফতার পৌঁছে দিতে সেবক হিসেবে যোগ দিন 🤲</p>

        <AnimatePresence mode="wait">
          {!showForm && !submitted && (
            <motion.button key="btn" exit={{ opacity: 0 }} onClick={() => setShowForm(true)}
              className="w-full rounded-xl py-3 font-bold text-sm text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              🙋 আমি সেবক হতে চাই
            </motion.button>
          )}

          {showForm && !submitted && (
            <motion.form key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }} onSubmit={handleSubmit} className="flex flex-col gap-3">
              {[
                { label: 'আপনার নাম', icon: <User className="h-4 w-4 text-muted-foreground" />, field: 'name', type: 'text', placeholder: 'পুরো নাম লিখুন' },
                { label: 'মোবাইল নম্বর', icon: <Phone className="h-4 w-4 text-muted-foreground" />, field: 'phone', type: 'tel', placeholder: '01XXX-XXXXXX' },
                { label: 'আপনার শহর', icon: <MapPin className="h-4 w-4 text-muted-foreground" />, field: 'city', type: 'text', placeholder: 'ঢাকা / চট্টগ্রাম / অন্য' },
              ].map(({ label, icon, field, type, placeholder }) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                    {icon}
                    <input type={type} placeholder={placeholder} value={(form as any)[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" required />
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">কাদের সেবা করতে চান?</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TARGET_GROUPS.map((tg) => (
                    <button key={tg.value} type="button" onClick={() => setForm((f) => ({ ...f, target_group: tg.value }))}
                      className={`rounded-lg px-2 py-2 text-xs font-medium text-left transition-all ${form.target_group === tg.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/20'}`}>
                      {tg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">কতজনকে ইফতার দিতে পারবেন? ({form.meals_target} জন)</label>
                <input type="range" min={10} max={500} step={10} value={form.meals_target}
                  onChange={(e) => setForm((f) => ({ ...f, meals_target: +e.target.value }))} className="accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>১০</span><span>৫০</span><span>১০০</span><span>২৫০</span><span>৫০০</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-xl py-3 font-black text-sm text-primary-foreground disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />নিবন্ধন হচ্ছে...</span> : '✅ নিবন্ধন সম্পন্ন করুন'}
              </button>
            </motion.form>
          )}

          {submitted && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-4 text-center">
              <div className="text-5xl">🤲</div>
              <p className="font-black text-foreground text-lg">জাযাকাল্লাহু খাইরান!</p>
              <p className="text-sm text-muted-foreground">আপনার নিবন্ধন সফল! Leaderboard-এ আপনার নাম যোগ হয়েছে। প্রতি ইফতারে সওয়াব পয়েন্ট পাবেন 🌟</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-secondary" />
          <h3 className="font-bold text-foreground">সেবক লিডারবোর্ড</h3>
          <span className="ml-auto text-xs text-muted-foreground">🌟 সওয়াব</span>
        </div>
        <div className="flex flex-col gap-2">
          {displayVolunteers.slice(0, 10).map((v, i) => (
            <motion.div key={v.id ?? i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.city}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-primary">{v.meals_done.toLocaleString('bn-BD')}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                  <Star className="h-2.5 w-2.5" />{(v.sawab_points ?? v.meals_done * 10).toLocaleString('bn-BD')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
