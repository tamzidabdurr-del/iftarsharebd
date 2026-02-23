import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Bengali } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'ইফতার শেয়ার ম্যাপ ২০২৬ | রমজান বাংলাদেশ | Iftar Map Bangladesh',
  description: 'রমজান ২০২৬ এর জন্য বাংলাদেশের সেরা ইফতার শেয়ার ম্যাপ - ইফতার স্পট খুঁজুন, সেবক হোন, অসহায়দের সাহায্য করুন। Iftar sharing map Bangladesh Ramadan 2026.',
  keywords: ['ইফতার ম্যাপ বাংলাদেশ ২০২৬', 'iftar map bangladesh', 'রমজান ইফতার', 'Ramadan 2026 Bangladesh', 'ইফতার শেয়ার'],
  openGraph: {
    title: 'ইফতার শেয়ার ম্যাপ ২০২৬ 🌙',
    description: 'আপনার কাছের ইফতার পয়েন্ট খুঁজুন। সেবক হোন। অসহায়দের সাহায্য করুন।',
    locale: 'bn_BD',
    type: 'website',
    siteName: 'ইফতার শেয়ার ম্যাপ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ইফতার শেয়ার ম্যাপ ২০২৬ 🌙',
    description: 'Bangladesh Iftar sharing map - Find iftar spots, volunteer, help the needy.',
  },
  manifest: '/manifest.json',
  generator: 'Next.js',
}

export const viewport: Viewport = {
  themeColor: '#064e3b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ইফতার ম্যাপ" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${notoSansBengali.className} antialiased overflow-hidden`}>
        {children}
        <Analytics />
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('SW registered'); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
