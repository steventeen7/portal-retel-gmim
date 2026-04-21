self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani fetch normal untuk saat ini
  // Ini hanya untuk memenuhi syarat PWA "Reliable"
  event.respondWith(fetch(event.request));
});
