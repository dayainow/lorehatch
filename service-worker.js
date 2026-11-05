const VERSION = 'lorehatch-__BUILD_ID__';
const ASSETS = /* PRECACHE */ [];
const BASE = new URL('./', self.location.href).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS.map(path=>new URL(path,BASE).href)))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('lorehatch-')&&key!==VERSION)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||!url.href.startsWith(BASE))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  // One complete app version per cache prevents old JS mixing with new HTML.
  const cached=await cache.match(event.request.mode==='navigate'?BASE:event.request.url,{ignoreSearch:true});
  return cached||fetch(event.request);
 })());
});
