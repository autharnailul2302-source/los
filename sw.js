/* Service worker The Land of Summoner: menyimpan gambar di Cache Storage supaya tidak diunduh ulang.
   - Gambar: tampil langsung dari cache. Pembaruan dari server dicek DIAM-DIAM paling banyak SEKALI per gambar tiap kali aplikasi dibuka
     (sebelumnya setiap permintaan gambar memicu unduhan ulang penuh + tulis cache, sehingga HP makin berat saat dimainkan lama).
   - index.html dan lainnya: selalu dari jaringan, jadi pembaruan kode langsung terbaca.
   - Musik (mp3) tidak disentuh karena besar dan memakai Range request.
   Naikkan angka VERSI di bawah untuk menghapus semua cache lama dan memaksa semua gambar diunduh ulang. */
const VERSI='tls-v1',GAMBAR=/\.(png|webp|jpe?g|gif|svg)$/i;
const SUDAH=new Set(); /* alamat gambar yang sudah dicek ke server selama service worker ini hidup */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSI).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin||!GAMBAR.test(u.pathname))return;
  e.respondWith((async()=>{
    const c=await caches.open(VERSI),hit=await c.match(r);
    const segarkan=()=>fetch(r).then(res=>{if(res&&res.ok)return c.put(r,res.clone()).then(()=>res);return res});
    if(hit){
      if(!SUDAH.has(r.url)){SUDAH.add(r.url);e.waitUntil(segarkan().catch(()=>SUDAH.delete(r.url)))}
      return hit;
    }
    SUDAH.add(r.url);
    return segarkan().catch(err=>{SUDAH.delete(r.url);throw err});
  })());
});
