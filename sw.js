const CACHE = 'quizpoker-v2';
const FILES = [
  'index.html', 'style.css', 'app.js', 'manifest.json',
  'q_geo.js', 'q_technik.js', 'q_natur.js', 'q_geschichte.js',
  'q_film.js', 'q_musik.js', 'q_medizin.js', 'q_essen.js',
  'q_sport.js', 'q_weltall.js', 'q_geld.js', 'q_absurd.js',
  'questions.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
