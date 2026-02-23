'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Facebook, MessageCircle, Copy, Download, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ShareCardProps {
  count?: number
}

export function ShareButton({ count = 18450 }: ShareCardProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareText = `🌙 আজ আমরা ${count.toLocaleString('bn-BD')}+ মানুষকে ইফতার দিলাম! 🤲\n\nআপনিও যোগ দিন:\n👉 iftarsharebd.vercel.app\n\n#ইফতারশেয়ার #রমজান২০২৬ #Bangladesh`

  const shareUrl = 'https://iftarsharebd.vercel.app'

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#F59E0B', '#fff'] })
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    triggerConfetti()
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank')
    triggerConfetti()
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')
    triggerConfetti()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2.5 text-sm font-bold text-foreground shadow-lg backdrop-blur-md hover:bg-card transition-colors"
      >
        <Share2 className="h-4 w-4 text-primary" />
        শেয়ার করুন
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl md:left-auto md:right-6 md:bottom-20 md:w-80">
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-foreground text-base">শেয়ার করুন 📢</h3>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Preview Card */}
              <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: 'linear-gradient(135deg, #064e3b, #10B981)' }}>
                <p className="text-2xl mb-1">🌙</p>
                <p className="text-white font-black text-lg leading-tight">আজ আমরা</p>
                <p className="text-yellow-300 font-black text-3xl tabular-nums">{count.toLocaleString('bn-BD')}+</p>
                <p className="text-white font-bold text-sm">মানুষকে ইফতার দিলাম!</p>
                <p className="text-white/70 text-xs mt-2">iftarsharebd.vercel.app</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={shareWhatsApp}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-[#25D366]/10 p-3 hover:bg-[#25D366]/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  <span className="text-xs font-medium text-foreground">WhatsApp</span>
                </button>
                <button onClick={shareFacebook}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-[#1877F2]/10 p-3 hover:bg-[#1877F2]/20 transition-colors">
                  <Facebook className="h-6 w-6 text-[#1877F2]" />
                  <span className="text-xs font-medium text-foreground">Facebook</span>
                </button>
                <button onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-muted p-3 hover:bg-muted/70 transition-colors">
                  {copied ? <Check className="h-6 w-6 text-primary" /> : <Copy className="h-6 w-6 text-muted-foreground" />}
                  <span className="text-xs font-medium text-foreground">{copied ? 'কপি!' : 'কপি লিংক'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
