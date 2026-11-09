/* Service worker The Land of Summoner: menyimpan gambar di Cache Storage supaya tidak diunduh ulang.
   - Gambar: tampil langsung dari cache, lalu diam-diam diperbarui dari server (muncul pada kunjungan berikutnya).
   - index.html dan lainnya: selalu dari jaringan, jadi pembaruan kode langsung terbaca.
   - Musik (mp3) tidak disentuh karena besar dan memakai Range request.
   Naikkan angka VERSI di bawah untuk menghapus semua cache lama dan memaksa semua gambar diunduh ulang. */
const VERSI='tls-v1',GAMBAR=/\.(png|webp|jpe?g|gif|svg)$/i;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSI).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin||!GAMBAR.test(u.pathname))return;
  e.respondWith(caches.open(VERSI).then(async c=>{
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
