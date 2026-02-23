// ইফতার শেয়ার ম্যাপ - Service Worker (PWA Offline Support)
const CACHE_NAME = 'iftar-map-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'ইফতার শেয়ার ম্যাপ', {
      body: data.body ?? 'কাছাকাছি ইফতার পাওয়া গেছে! 🌙',
      icon: '/apple-icon.png',
      badge: '/icon-dark-32x32.png',
      vibrate: [200, 100, 200],
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'view', title: 'দেখুন' },
        { action: 'close', title: 'বন্ধ করুন' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action !== 'close') {
    event.waitUntil(clients.openWindow(event.notification.data?.url ?? '/'))
  }
})
