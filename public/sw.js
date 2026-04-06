// Flourish Daily 5 — Service Worker
// Handles background push notifications for the 4pm reminder.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// Handle push events (sent by web push servers)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || "It's 4pm — still time to flourish 🌸"
  const options = {
    body: data.body || 'Open the app and check off your pillars.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'flourish-4pm',
    renotify: false,
    data: { url: '/dashboard' },
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

// Open the app when a notification is clicked
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/dashboard'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes('/dashboard'))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
