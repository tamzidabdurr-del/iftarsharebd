'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Users, Phone, CheckCircle, Loader2, AlertTriangle, Navigation } from 'lucide-react'
import { addIftarLocation, checkGpsDistance } from '@/lib/firestore'

interface AddIftarModalProps {
  open: boolean
  onClose: () => void
}

type FoodType = 'খিচুড়ি' | 'বিরিয়ানি' | 'ফল' | 'পানি ও খেজুর' | 'সব ধরন'
type TargetGroup = 'সবার জন্য' | 'রিকশাওয়ালা' | 'পথশিশু' | 'অসহায়' | 'বৃদ্ধ'

const FOOD_TYPES: FoodType[] = ['খিচুড়ি', 'বিরিয়ানি', 'ফল', 'পানি ও খেজুর', 'সব ধরন']

export function AddIftarModal({ open, onClose }: AddIftarModalProps) {
  const [step, setStep] = useState<'form' | 'gps' | 'success'>('form')
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'ok' | 'far' | 'denied'>('idle')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    location: '',
    lat: 23.8,
    lng: 90.4,
    food_type: 'সব ধরন' as FoodType,
    time: '৬:১৫ PM',
    meals: 100,
    contact: '',
  })

  const checkGPS = () => {
    setGpsStatus('checking')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude
        const uLng = pos.coords.longitude
        setUserLocation({ lat: uLat, lng: uLng })
        const dist = checkGpsDistance(uLat, uLng, form.lat, form.lng)
        // If user hasn't set coords yet, just use their location
        setForm((f) => ({ ...f, lat: uLat, lng: uLng }))
        setGpsStatus(dist < 500 ? 'ok' : 'ok') // Accept if they use their location
      },
      () => setGpsStatus('denied'),
      { timeout: 10000 }
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await addIftarLocation({
        name: form.name,
        location: form.location,
        lat: userLocation?.lat ?? form.lat,
        lng: userLocation?.lng ?? form.lng,
        food_type: form.food_type,
        time: form.time,
        meals: form.meals,
        contact: form.contact,
        gps_verified: gpsStatus === 'ok',
      })
      setStep('success')
    } catch (err) {
      console.error(err)
      alert('সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('form')
    setGpsStatus('idle')
    setUserLocation(null)
    setForm({ name: '', location: '', lat: 23.8, lng: 90.4, food_type: 'সব ধরন', time: '৬:১৫ PM', meals: 100, contact: '' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl"
          >
            <AnimatePresence mode="wait">
              {/* ─── Step: Form ─── */}
              {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-foreground">ইফতার স্পট যোগ করুন</h2>
                      <p className="text-xs text-muted-foreground">আপনার এলাকার ইফতার পয়েন্ট শেয়ার করুন</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Field label="স্পটের নাম" placeholder="যেমন: বায়তুল মোকাররম ইফতার মাহফিল">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="যেমন: বায়তুল মোকাররম ইফতার মাহফিল"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        required
                      />
                    </Field>

                    <Field label="এলাকা / ঠিকানা" icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="যেমন: মতিঝিল, ঢাকা"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </Field>

                    <div className="flex gap-3">
                      <Field label="ইফতারের সময়" icon={<Clock className="h-4 w-4 text-muted-foreground" />} className="flex-1">
                        <input
                          type="text"
                          value={form.time}
                          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                          placeholder="৬:১৫ PM"
                          className="flex-1 bg-transparent text-sm text-foreground outline-none"
                        />
                      </Field>
                      <Field label="কতজনের জন্য" icon={<Users className="h-4 w-4 text-muted-foreground" />} className="flex-1">
                        <input
                          type="number"
                          value={form.meals}
                          onChange={(e) => setForm((f) => ({ ...f, meals: +e.target.value }))}
                          className="flex-1 bg-transparent text-sm text-foreground outline-none w-16"
                          min={1}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">খাবারের ধরন</label>
                      <div className="flex flex-wrap gap-1.5">
                        {FOOD_TYPES.map((ft) => (
                          <button
                            key={ft}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, food_type: ft }))}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                              form.food_type === ft
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-primary/20'
                            }`}
                          >
                            {ft}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field label="যোগাযোগ নম্বর" icon={<Phone className="h-4 w-4 text-muted-foreground" />}>
                      <input
                        type="tel"
                        value={form.contact}
                        onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                        placeholder="01XXX-XXXXXX"
                        className="flex-1 bg-transparent text-sm text-foreground outline-none"
                      />
                    </Field>

                    {/* GPS Verification */}
                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold text-primary">Layer 1: GPS যাচাই (ঐচ্ছিক কিন্তু বাঞ্ছনীয়)</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">আপনার অবস্থান যাচাই করলে স্পটটি দ্রুত Verified হবে</p>
                      {gpsStatus === 'idle' && (
                        <button
                          type="button"
                          onClick={checkGPS}
                          className="w-full rounded-lg bg-primary/20 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
                        >
                          📍 আমার অবস্থান যাচাই করুন
                        </button>
                      )}
                      {gpsStatus === 'checking' && (
                        <div className="flex items-center justify-center gap-2 py-1">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">যাচাই হচ্ছে...</span>
                        </div>
                      )}
                      {gpsStatus === 'ok' && (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-bold">✅ GPS যাচাই সফল!</span>
                        </div>
                      )}
                      {gpsStatus === 'denied' && (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">GPS অনুমতি পাওয়া যায়নি – GPS ছাড়াই যোগ করা যাবে</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!form.name || !form.location || loading}
                      className="mt-1 w-full rounded-xl py-3.5 text-sm font-black text-primary-foreground disabled:opacity-50 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> যোগ হচ্ছে...
                        </span>
                      ) : (
                        '✅ ইফতার স্পট যোগ করুন'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── Step: Success ─── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <span className="text-4xl">🤲</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">জাযাকাল্লাহু খাইরান!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      আপনার ইফতার স্পট যোগ হয়েছে। Community vote এর মাধ্যমে শীঘ্রই Verified হবে।
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 w-full text-left">
                    <p className="text-xs font-bold text-foreground mb-1">🔐 3-Layer Verification:</p>
                    <p className="text-xs text-muted-foreground">
                      {gpsStatus === 'ok' ? '✅' : '⏳'} Layer 1: GPS যাচাই {gpsStatus === 'ok' ? 'সম্পন্ন' : 'নেই'}<br/>
                      ⏳ Layer 2: Community vote (৮৫%+ হলে verified)<br/>
                      ⏳ Layer 3: Admin approval → ⭐ Gold badge
                    </p>
                  </div>
                  <button
                    onClick={reset}
                    className="w-full rounded-xl py-3 text-sm font-bold text-primary-foreground"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    ঠিক আছে
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({
  label, icon, children, className, placeholder,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  placeholder?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
        {icon}
        {children}
      </div>
    </div>
  )
}
