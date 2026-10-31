// Guarda o app no iPhone para abrir sem internet.
// Ao publicar uma versão nova, troque VERSION para o app baixar os arquivos de novo.
const VERSION = 'revela-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'fonts/manrope-latin.woff2', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // a página: tenta a internet primeiro (pega atualizações), sem internet usa a cópia guardada
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // fonte e ícones: usa a cópia guardada
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
