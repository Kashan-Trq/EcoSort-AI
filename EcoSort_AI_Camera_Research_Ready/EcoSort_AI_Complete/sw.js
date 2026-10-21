const CACHE='ecosort-static-v2-1';
const ASSETS=['/','/index.html','/styles.css','/src/app.mjs','/src/rules.mjs','/src/scanner.mjs','/src/yield.mjs','/dataset/samples.json','/assets/favicon.svg','/assets/icon-192.png','/assets/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;e.respondWith(caches.match(r).then(cached=>cached||fetch(r).then(resp=>{if(resp.ok){const copy=resp.clone();void caches.open(CACHE).then(c=>c.put(r,copy));}return resp})))})
