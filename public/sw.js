self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle background messages from main app thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    const tag = 'zen-msg-' + Date.now();
    self.registration.showNotification(title, {
      body,
      icon: '/pwa-icon.png',
      badge: '/pwa-icon.png',
      vibrate: [200, 100, 200, 100, 400],
      tag,
      renotify: true,
      requireInteraction: true
    });
  }
});

// Handle native Web Push events
self.addEventListener('push', (event) => {
  let data = { title: 'Zen Masajes', body: 'Tienes un nuevo aviso de masaje.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const tag = 'zen-msg-' + Date.now();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-icon.png',
      badge: '/pwa-icon.png',
      vibrate: [200, 100, 200, 100, 400],
      tag,
      renotify: true,
      requireInteraction: true
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
