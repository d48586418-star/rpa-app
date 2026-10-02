/* sw.js: guarda o que é leve (páginas, estilos, scripts, dados, fontes, imagens) para o laboratório abrir sem rede.
   Vídeos e áudios não ficam guardados (são grandes): sem rede, o monitor avisa que o vídeo não carregou. */
const V="ch-v31",PRE=["lab.html","index.html","css/tokens.css","css/base.css","css/shell.css","css/home.css","css/screens.css","css/learn.css","css/lab.css","css/welcome.css","css/museu.css","css/ds.css","css/guia.css","css/celebrar.css","css/abertura.css","data/data.js","fonts/dm-sans-latin-wght-normal.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(PRE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\.(webm|mp4|ogg|m4a)$/i.test(u.pathname))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("lab.html"):Response.error()))));
});
