'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HandHelping, MapPin, Users, Phone, AlertTriangle, Loader2, X, Navigation } from 'lucide-react'
import { addHelpRequest } from '@/lib/firestore'

interface Props { open: boolean; onClose: () => void }

const URGENCY_LEVELS = [
  { value: 'high',   label: 'খুব জরুরি!',   color: '#EF4444', emoji: '🔴', desc: 'আজই দরকার' },
  { value: 'medium', label: 'মোটামুটি জরুরি', color: '#F59E0B', emoji: '🟡', desc: '১-২ দিনের মধ্যে' },
  { value: 'low',    label: 'কম জরুরি',     color: '#22C55E', emoji: '🟢', desc: 'সুযোগ হলে' },
]

const TARGET_GROUPS = ['রিকশাওয়ালা', 'পথশিশু', 'বস্তিবাসী', 'দিনমজুর', 'বিধবা মহিলা', 'প্রতিবন্ধী', 'অন্য']

export function AddHelpModal({ open, onClose }: Props) {
  const [step, setStep]       = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)

  const [form, setForm] = useState({
    location:         '',
    lat:              23.76,
    lng:              90.38,
    people_count:     10,
    urgency:          'high' as 'low' | 'medium' | 'high',
    need_description: '',
    contact:          '',
    group_type:       '',
    gps_used:         false,
  })

  const grabGPS = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude, gps_used: true })); setLocating(false) },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  const handleSubmit = async () => {
    if (!form.location.trim() || !form.need_description.trim()) return
    setLoading(true)
    try {
      await addHelpRequest({
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        people_count: form.people_count,
        urgency: form.urgency,
        need_description: `${form.group_type ? `[${form.group_type}] ` : ''}${form.need_description}`,
        contact: form.contact,
      })
      setStep('success')
    } catch {
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('form')
    setForm({ location:'', lat:23.76, lng:90.38, people_count:10, urgency:'high', need_description:'', contact:'', group_type:'', gps_used:false })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={reset} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

          <motion.div initial={{opacity:0, y:60, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:60}}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15">
                  <HandHelping className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">সাহায্যের অনুরোধ</h2>
                  <p className="text-xs text-muted-foreground">ইফতারের জন্য সাহায্য চাই</p>
                </div>
              </div>
              <button onClick={reset} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'form' && (
                <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col gap-4">

                  {/* Group type chips */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-2 block">কারা সাহায্য চাইছেন?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TARGET_GROUPS.map(g => (
                        <button key={g} type="button" onClick={() => setForm(f => ({ ...f, group_type: g }))}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${form.group_type === g ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground hover:bg-orange-500/20'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">এলাকা / ঠিকানা *</label>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input type="text" value={form.location}
                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="যেমন: পুরান ঢাকা, সদরঘাট"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                    </div>
                  </div>

                  {/* Need description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">কী সাহায্য দরকার? *</label>
                    <textarea value={form.need_description}
                      onChange={e => setForm(f => ({ ...f, need_description: e.target.value }))}
                      placeholder="যেমন: ৫০ জন রিকশাওয়ালার জন্য ইফতার দরকার, কেউ এগিয়ে আসবেন?"
                      rows={3}
                      className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none" />
                  </div>

                  {/* People count + urgency side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">কতজন? ({form.people_count} জন)</label>
                      <input type="range" min={1} max={500} step={5} value={form.people_count}
                        onChange={e => setForm(f => ({ ...f, people_count: +e.target.value }))}
                        className="accent-orange-500 mt-2" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>১</span><span>১০০</span><span>৫০০</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted-foreground">জরুরি মাত্রা</label>
                      <div className="flex flex-col gap-1 mt-1">
                        {URGENCY_LEVELS.map(ul => (
                          <button key={ul.value} type="button" onClick={() => setForm(f => ({ ...f, urgency: ul.value as any }))}
                            className={`rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-all flex items-center gap-1.5 ${form.urgency === ul.value ? 'text-white' : 'bg-muted text-muted-foreground'}`}
                            style={form.urgency === ul.value ? { background: ul.color } : {}}>
                            {ul.emoji} {ul.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-muted-foreground">যোগাযোগ নম্বর (ঐচ্ছিক)</label>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input type="tel" value={form.contact}
                        onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                        placeholder="01XXX-XXXXXX"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                    </div>
                  </div>

                  {/* GPS */}
                  <div className="rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-orange-500">📍 GPS অবস্থান</p>
                        <p className="text-xs text-muted-foreground mt-0.5">ম্যাপে সঠিক জায়গায় দেখাবে</p>
                      </div>
                      {form.gps_used
                        ? <span className="text-xs font-bold text-emerald-500">✅ সেট হয়েছে</span>
                        : <button type="button" onClick={grabGPS} disabled={locating}
                            className="flex items-center gap-1.5 rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-500 hover:bg-orange-500/30 transition-colors disabled:opacity-60">
                            {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                            GPS নিন
                          </button>
                      }
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={!form.location.trim() || !form.need_description.trim() || loading}
                    className="w-full rounded-xl py-3.5 text-sm font-black text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> যোগ হচ্ছে...</> : '🤲 সাহায্যের অনুরোধ পাঠান'}
                  </button>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                  className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="text-5xl">🤲</div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">অনুরোধ পাঠানো হয়েছে!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      আপনার সাহায্যের অনুরোধ সকল সেবকদের কাছে পৌঁছে গেছে।<br/>
                      ইনশাআল্লাহ, কেউ না কেউ এগিয়ে আসবেন। আল্লাহ সহায় হোন। 🙏
                    </p>
                  </div>
                  <button onClick={reset} className="w-full rounded-xl py-3 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>ঠিক আছে</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
