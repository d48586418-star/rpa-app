/* app.js — roteador por hash + casca do aplicativo (navegação persistente). */
(function(){
"use strict";
const CH=window.CH,{h,$,icon}=CH;
const NAV=[
  {k:"inicio",href:"#/inicio",l:"Início",i:"home"},
  {k:"percurso",href:"#/percurso",l:"Jornada",i:"path"},
  {k:"museu",href:"#/museu",l:"Museu",i:"museum"},
  {k:"livre",href:"#/livre",l:"Livre",i:"film"},
  {k:"caderno",href:"#/caderno",l:"Caderno",i:"book"},
  {k:"guia",href:"#/guia",l:"Guia",i:"guide"},
  {k:"eu",href:"#/eu",l:"Meu espaço",i:"user",desk:1}
];
const ROUTES=[
  [/^\/inicio$/,"inicio",(c,m)=>CH.views.home(c,m)],
  [/^\/percurso$/,"percurso",(c,m)=>CH.views.path(c,m)],
  [/^\/lab\/([A-Z0-9_]+)$/,"percurso",(c,m)=>CH.views.lab(c,m[1])],
  [/^\/livre$/,"livre",(c,m)=>CH.views.lab(c,CH.LIVRE)],
  [/^\/descobertas$/,"percurso",(c,m)=>CH.views.discoveries(c,m)],
  [/^\/conceito\/([a-z-]+)$/,"percurso",(c,m)=>CH.views.concept(c,m[1])],
  [/^\/edicao$/,"guia",(c,m)=>{location.replace("#/guia");return {}}],
  [/^\/guia$/,"guia",(c,m)=>CH.views.guia(c,m)],
  [/^\/boas-vindas$/,"inicio",(c,m)=>CH.views.welcome(c)],
  [/^\/escolher$/,"inicio",(c,m)=>CH.views.welcome(c,"escolher")],
  [/^\/editor$/,"eu",(c,m)=>CH.views.editor(c)],
  [/^\/contraste$/,"percurso",(c,m)=>CH.views.contraste(c,m)],
  [/^\/caderno$/,"caderno",(c,m)=>CH.views.notebook(c,m)],
  [/^\/eu$/,"eu",(c,m)=>CH.views.me(c,m)],
  [/^\/museu$/,"museu",(c,m)=>CH.views.museu(c)],
  [/^\/museu\/([a-z]+)$/,"museu",(c,m)=>CH.views.museuItem(c,m[1])],
  [/^\/creditos$/,"eu",(c,m)=>CH.views.credits(c,m)],
  [/^\/tecnico$/,"eu",(c,m)=>CH.views.tecnico(c,m)]
];
CH.views=CH.views||{};
let cur=null;

function buildNav(){
  $("#topnav").innerHTML=NAV.map(n=>`<a href="${n.href}" data-k="${n.k}">${n.l}</a>`).join("");
  $("#tabbar").innerHTML=NAV.filter(n=>!n.desk).map(n=>`<a href="${n.href}" data-k="${n.k}">${icon(n.i)}<span>${n.l}</span></a>`).join("");
}
function setCurrent(k){
  document.querySelectorAll("#topnav a,#tabbar a").forEach(a=>{if(a.dataset.k===k)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
}
function who(){
  CH.corPerfil&&CH.corPerfil();
  const n=CH.store.name(),p=CH.persona(),el=$("#who");
  el.innerHTML=p?`<a class="persona-chip glass" href="#/eu" style="--pc:${p.cor}" aria-label="Meu espaço: ${CH.esc(CH.personaNome())}, ${CH.esc(p.curto)}"><img src="${p.busto}" alt="" width="34" height="34"><span>${CH.esc(n||p.curto)}</span></a>`:`<a class="persona-chip glass" href="#/eu"><span>${CH.esc(n||"Meu espaço")}</span></a>`;
}
CH.who=who;
CH.corPerfil=()=>{const p=CH.persona(),r=document.documentElement.style;
  if(!p){["--perfil-2","--perfil","--vermelho","--claquete","--foco","--accent","--accent-ink","--on-perfil","--claquete-fundo"].forEach(k=>r.removeProperty(k));return}
  const c=p.cor_ui||p.cor,f=p.fg_ui||p.fg||"#fff";
  r.setProperty("--perfil",c);r.setProperty("--perfil-2","color-mix(in srgb,"+c+" 62%,#000)");r.setProperty("--vermelho",c);r.setProperty("--claquete",c);r.setProperty("--foco",c);r.setProperty("--accent",c);r.setProperty("--accent-ink",c);r.setProperty("--on-perfil",f);r.setProperty("--claquete-fundo","color-mix(in srgb,"+c+" 14%,var(--bg))")};
/* tema claro (padrão) / escuro */
CH.setTema=t=>{const r=document.documentElement;if(t==="dark")r.setAttribute("data-theme","dark");else r.removeAttribute("data-theme");try{localStorage.setItem("ch:tema",t)}catch(e){}
  const b=document.getElementById("theme-btn");if(b){b.setAttribute("aria-pressed",String(t==="dark"));b.setAttribute("aria-label",t==="dark"?"Voltar ao modo claro":"Ativar modo escuro")}};
(()=>{const b=document.getElementById("theme-btn");if(!b)return;const d=document.documentElement.getAttribute("data-theme")==="dark";CH.setTema(d?"dark":"light");
  b.addEventListener("click",()=>CH.setTema(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"))})();

function route(){
  const app=$("#app");
  let path=location.hash.replace(/^#/,"")||"/inicio";
  if(!path.startsWith("/"))path="/inicio";
  let hit=null;for(const r of ROUTES){const m=path.match(r[0]);if(m){hit=[r,m];break}}
  if(!hit){location.hash="#/inicio";return}
  /* primeira visita: boas-vindas (links diretos para atividades, como os QR Codes da cartilha, entram sem passar por ela) */
  if(!CH.store.onboarded()&&/^\/(inicio)?$/.test(path)){location.replace("#/boas-vindas");return}
  if(cur&&cur.destroy){try{cur.destroy()}catch(e){console.warn(e)}}
  document.querySelectorAll("dialog[open]").forEach(d=>{try{d.close()}catch(e){}});
  CH.scroll&&CH.scroll.teardown();
  app.innerHTML="";
  const holder=h("div.view");app.append(holder);
  window.scrollTo(0,0);
  try{cur=hit[0][2](holder,hit[1])||{}}catch(err){console.error(err);holder.innerHTML=`<div class="page"><h1 class="h2">Algo não abriu</h1><p class="lead">Volte ao <a class="link" href="#/inicio">início</a> e tente de novo.</p></div>`;cur={}}
  setCurrent(hit[0][1]);who();
  {const sp=document.getElementById("boot-splash");if(sp)sp.remove();document.documentElement.classList.remove("from-url")}
  document.title=(cur.title?cur.title+", ":"")+"Cortando Histórias";
  const hd=$("#page-title",holder)||$("h1",holder);
  if(hd){hd.setAttribute("tabindex","-1");hd.focus({preventScroll:true})}
  revela(holder);
  try{CH.evoCheck&&CH.evoCheck();if(/^\/(lab|livre)/.test(path))CH.tourSeNovo&&CH.tourSeNovo()}catch(e){console.warn(e)}
  CH.say((cur.title||"Início")+", página carregada",true);
}
/* entrada em escada: os blocos da página sobem uma vez, ao aparecer (não nas telas de laboratório) */
let io=null;
function revela(root){
  if(io){io.disconnect();io=null}
  if(!("IntersectionObserver" in window)||CH.reduced())return;
  const kids=[...root.querySelectorAll(".page > :not(.page-head):not(.lab-head), .page > .page-head > *, .ini-h > *")].filter(e=>!e.closest(".lab"));
  if(!kids.length)return;
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);requestAnimationFrame(()=>requestAnimationFrame(()=>e.target.classList.add("rv-in")))}}),{rootMargin:"0px 0px -6% 0px"});
  kids.forEach((e,i)=>{e.classList.add("rv");e.style.transitionDelay=Math.min(i,5)*.07+"s"});
  void root.offsetWidth;
  kids.forEach(e=>e.classList.add("rv-t"));
  void root.offsetWidth;
  kids.forEach(e=>io.observe(e));
}
window.addEventListener("hashchange",route);
window.addEventListener("pagehide",()=>{if(cur&&cur.destroy)try{cur.destroy()}catch(e){}});
/* modo offline: guarda o essencial e avisa quando a rede cai */
if("serviceWorker" in navigator&&/^https?:/.test(location.protocol)){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}
function aviso(){let b=document.querySelector(".offline");if(navigator.onLine){b&&b.remove();return}if(b)return;b=h("div.offline");b.setAttribute("role","status");b.textContent="Você está sem internet. Os vídeos não carregam, mas o resto continua aqui.";document.body.append(b)}
window.addEventListener("online",aviso);window.addEventListener("offline",aviso);
let started=false;
function start(){if(started)return;started=true;buildNav();route();aviso()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
