/* core.js — namespace, utilitários, ícones, dados derivados. Sem dependências. */
(function(){
"use strict";
const CH=window.CH=window.CH||{};
const D=CH.data=window.CH_DATA;

/* ---------- DOM ---------- */
CH.$=(s,r=document)=>r.querySelector(s);
CH.$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
CH.esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* h("div.a.b#id",{attrs},children...) */
CH.h=function(sel,attrs,...kids){
  const m=sel.match(/^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i);
  const el=document.createElement(m&&m[1]||"div");
  (m&&m[2]||"").replace(/([.#])([\w-]+)/g,(_,t,n)=>{t=="."?el.classList.add(n):el.id=n});
  if(attrs&&(typeof attrs!=="object"||attrs.nodeType||Array.isArray(attrs)||typeof attrs==="string")){kids.unshift(attrs);attrs=null}
  for(const k in (attrs||{})){const v=attrs[k];if(v==null||v===false)continue;
    if(k==="html")el.innerHTML=v;else if(k==="text")el.textContent=v;
    else if(k.startsWith("on")&&typeof v==="function")el.addEventListener(k.slice(2),v);
    else if(k==="style"&&typeof v==="object")Object.assign(el.style,v);
    else if(k==="dataset")Object.assign(el.dataset,v);
    else el.setAttribute(k,v===true?"":v)}
  kids.flat(9).forEach(c=>{if(c==null||c===false)return;el.append(c.nodeType?c:document.createTextNode(c))});
  return el;
};
CH.clear=el=>{while(el.firstChild)el.removeChild(el.firstChild);return el};

/* ---------- tempo ---------- */
CH.fmt=t=>{t=Math.max(0,t||0);const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,"0")+":"+s.toFixed(1).padStart(4,"0")};
CH.uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
CH.ago=ts=>{const s=(Date.now()-ts)/1000;if(s<60)return"agora";if(s<3600)return Math.floor(s/60)+" min";if(s<86400)return Math.floor(s/3600)+" h";return Math.floor(s/86400)+" d"};
CH.date=ts=>new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

/* ---------- dados derivados ---------- */
CH.TK={};D.takes.forEach(t=>CH.TK[t.id]=t);
CH.ACT={};D.activities.forEach(a=>CH.ACT[a.id]=a);
CH.EXF=D.exf;
CH.LIVRE="EX_LAB_LIVRE";
CH.filmColor=f=>getComputedStyle(document.documentElement).getPropertyValue("--f-"+f).trim()||"#0b0b0b";
CH.cardLabel=(exId,takeId)=>((CH.EXF[exId]||{}).card_labels||{})[takeId]||takeId;
CH.ratioOf=exId=>{const a=CH.ACT[exId];const t=a&&a.pool.map(i=>CH.TK[i]).find(x=>x&&x.ar);return(t&&t.ar)||"16:9"};
CH.ratioCss=ar=>ar==="4:3"?"4/3":"16/9";
CH.etapa=n=>D.etapas.find(e=>e.n===n);
CH.atoDe=exId=>{
  for(const ato of D.atos.atos){
    for(const n of ato.etapas){const e=CH.etapa(n);if(e&&e.a.includes(exId))return ato}
  }
  return exId===CH.LIVRE?D.atos.atos[D.atos.atos.length-1]:null;
};
CH.atividadesDoAto=ato=>{
  const out=[];ato.etapas.forEach(n=>{const e=CH.etapa(n);if(e)e.a.forEach(id=>{if(CH.ACT[id]&&!out.includes(id))out.push(id)})});return out};

/* ---------- jornada, conceitos, cartilha ---------- */
CH.didatica=id=>(D.didatica.atividades||{})[id]||{};
CH.CONC={};D.conceitos.conceitos.forEach(c=>CH.CONC[c.id]=c);
CH.conceitoPorNome=nome=>{if(!nome)return null;const n=String(nome).toLowerCase();return D.conceitos.conceitos.find(c=>c.aliases.some(a=>a.toLowerCase()===n))||null};
CH.conceitoDaAtividade=id=>D.conceitos.conceitos.find(c=>c.exp[0]===id)||D.conceitos.conceitos.find(c=>c.exp.includes(id))||null;
CH.duoDe=exId=>{const a=CH.atoDe(exId);return a?a.duo:"duo-y"};
CH.corDe=exId=>{const a=CH.atoDe(exId);return a?a.cor:"#c8a020"};
/* ponte cartilha ↔ laboratório: nunca inventa número de página */
CH.naCartilha=(kind,id)=>{
  const K=D.cartilha||{},m=(K[kind==="c"?"conceitos":"atividades"]||{})[id]||{};
  const ato=m.ato&&(K.atos||[]).find(a=>a.n===m.ato)||null;
  const pg=m.pagina,sec=m.secao;
  const txt=sec?(ato?"Ato "+ato.n+" · "+ato.t+" · ":"")+sec+(pg?" · p. "+pg:""):"Este tema não está na cartilha.";
  const pdf=K.pdf;
  return{ato,secao:sec||null,pagina:pg||null,texto:txt,href:pdf?pdf+(pg?"#page="+String(pg).split(/\D/)[0]:""):null};
};
CH.desc=t=>String((t&&t.s)||"").replace(/\s+de\s+[A-Z]{2}_[A-Za-z0-9]+/g,"");
CH.PERSONAS={};D.personas.personas.forEach(x=>CH.PERSONAS[x.id]=x);
CH.persona=()=>CH.PERSONAS[CH.store.persona()]||null;
CH.videoSources=(base)=>{const w=`<source src="${base}.webm" type='video/webm; codecs="vp9, opus"'>`,m=`<source src="${base}.mp4" type="video/mp4">`;return CH.preferMp4?m+w:w+m};
CH.linkDaAtividade=id=>location.href.split("#")[0]+"#/"+(id===CH.LIVRE?"livre":"lab/"+id);
/* primeiro plano da atividade = imagem que a representa */
CH.capaDe=id=>{const a=CH.ACT[id];const t=a&&CH.TK[a.pool[0]];return t?t.th:""};

/* Modelo de montagem {id,a,b} -> clipes do motor (IDÊNTICO ao v7) */
CH.dur=s=>CH.TK[s.id].d*(s.b-s.a);
CH.total=seq=>seq.reduce((a,s)=>a+CH.dur(s),0);
CH.clipsOf=seq=>seq.map(s=>{const d=CH.TK[s.id].d;return{take_id:s.id,trim_in:Math.round(s.a*d*100)/100,trim_out:s.b>=.999?null:Math.round(s.b*d*100)/100,real_duration:d}});

/* suporte a vídeo: WebM/VP8 (original) com fallback MP4/H.264 (Safari/iOS). CH.webm = "este aparelho reproduz algum dos dois". */
(function(){const v=document.createElement("video");
  CH.webmOk=!!v.canPlayType('video/webm; codecs="vp8"');
  CH.mp4Ok=!!v.canPlayType('video/mp4; codecs="avc1.4D401E"');
  CH.webm=CH.webmOk||CH.mp4Ok;
  /* iOS/Safari: prefere MP4 (WebM/VP8 é instável lá), mesmo quando diz suportar */
  const safari=/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)||/iPad|iPhone|iPod/.test(navigator.userAgent);
  CH.preferMp4=CH.mp4Ok&&(safari||!CH.webmOk);
})();
CH.vurl=t=>{const u=t&&t.vid;if(!u)return"";return CH.preferMp4?u.replace(/\.webm$/,".mp4"):u};

/* ---------- a11y ---------- */
let live;
CH.say=(msg,urgente)=>{live=live||CH.$("#live");if(!live)return;live.setAttribute("role",urgente?"alert":"status");live.setAttribute("aria-live",urgente?"assertive":"polite");live.textContent="";setTimeout(()=>live.textContent=msg,30)};
let tt;
CH.toast=(msg,ms=2600)=>{const t=CH.$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),ms);CH.say(msg)};
CH.carregar=src=>new Promise((ok,no)=>{if(document.querySelector(`script[data-lz="${src}"]`))return ok();const s=document.createElement("script");s.src=src;s.dataset.lz=src;s.onload=ok;s.onerror=()=>no(new Error(src));document.head.append(s)});
CH.reduced=()=>{const r=document.documentElement.dataset.motion;if(r==="off")return true;if(r==="on")return false;return matchMedia("(prefers-reduced-motion: reduce)").matches};
/* só a preferência explícita do site desliga os vídeos de personagem e a coreografia da escolha; o "reduzir movimento" do aparelho não esconde o conteúdo principal */
CH.motionOff=()=>document.documentElement.dataset.motion==="off";

/* ---------- ícones (traço 2px, 24px) ---------- */
const P={
  museum:'<path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',
  guide:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  star:'<path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.3L12 17.1 6.4 20.2l1.2-6.3L3 9.6l6.3-.8z"/>',
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/>',
  path:'<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18h6.3a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h6.3"/>',
  film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  user:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6"/>',
  play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  pause:'<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>',
  back:'<path d="M15 5 8 12l7 7"/>',
  next:'<path d="M9 5l7 7-7 7"/>',
  left:'<path d="m11 6-6 6 6 6M19 6l-6 6 6 6"/>',
  right:'<path d="m13 6 6 6-6 6M5 6l6 6-6 6"/>',
  scissors:'<circle cx="6" cy="6.5" r="2.6"/><circle cx="6" cy="17.5" r="2.6"/><path d="M8 8 20 18M8 16 20 6"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
  undo:'<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -5)"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="m4.5 12.5 5 5 10-11"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>',
  eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  rewind:'<path d="M4 5v14M20 5 9 12l11 7z" fill="currentColor"/>',
  compare:'<rect x="3" y="5" width="8" height="14" rx="1.5"/><rect x="13" y="5" width="8" height="14" rx="1.5"/>',
  save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  up:'<path d="m6 15 6-6 6 6"/>',
  download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  pencil:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/>',
  flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  frame:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M3 15h18M7 5v4M12 5v4M17 5v4M7 15v4M12 15v4M17 15v4"/>',
  lens:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/>',
  cut:'<path d="M12 3v18" stroke-dasharray="2 3"/><path d="M6 8 3 12l3 4M18 8l3 4-3 4"/>',
  time:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 10 18.7l1-1"/>',
  more:'<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  dot:'<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ring:'<circle cx="12" cy="12" r="6"/>',
  half:'<circle cx="12" cy="12" r="6"/><path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor"/>',
  bang:'<path d="M12 5v9M12 18.5v.5"/>',
  sound:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
  mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 4 6M21 9l-4 6"/>'
};
CH.icon=(n,cls="")=>`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[n]||""}</svg>`;
CH.iconEl=(n,cls)=>{const t=document.createElement("template");t.innerHTML=CH.icon(n,cls).trim();return t.content.firstChild};
CH.brandMark=()=>`<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 3h20L3 23z" fill="#0b0b0b"/><path d="M29 9v20H9z" fill="#0b0b0b"/><path d="M25 3h4v2.2L5.4 29H3v-2.6z" fill="#c8a020"/></svg>`;
})();

/* ---------- fotogramas da folha de contato (progresso sem pontos) ----------
   nível 0 a revelar · 1 experimentou (quadro em P&B, fraco) · 2 descobriu (duotone do ato) · 3 aprofundou (cor + marca) */
CH.NIVEIS=["A revelar","Experimentou","Descobriu","Aprofundou"];
CH.fotograma=(exId,nivel,opts={})=>{
  const src=CH.capaDe(exId),duo=nivel===1?"duo-k":nivel===2?CH.duoDe(exId):"";
  const lab=(CH.ACT[exId]||{}).t||exId;
  return `<span class="fg n${nivel}" role="img" aria-label="${CH.esc(lab)}: ${CH.NIVEIS[nivel].toLowerCase()}">`+
    (nivel?`<span class="fg-img ${duo}"><img src="${src}" alt="" loading="lazy" width="160" height="120"></span>`:`<span class="fg-empty"><i></i></span>`)+
    (nivel===3?`<span class="fg-ok">${CH.icon("check")}</span>`:"")+`<span class="fg-perf" aria-hidden="true"></span></span>`;
};
CH.pips=nivel=>`<span class="pips" aria-hidden="true">${[1,2,3].map(n=>`<i class="${nivel>=n?"on":""}"></i>`).join("")}</span>`;

/* som opcional do momento de descoberta (WebAudio; só com a preferência ligada) */
CH.fx={blip(){try{if(!CH.store.prefs().fx)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const x=this.x||(this.x=new A()),t=x.currentTime;[[660,0],[990,.09]].forEach(([f,d])=>{const o=x.createOscillator(),g=x.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.12,t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.3);o.connect(g).connect(x.destination);o.start(t+d);o.stop(t+d+.32)})}catch(e){}}};

/* O nome da persona é o nome do aluno; o tipo (Som, Ritmo...) vem da ficha */
CH.personaNome=()=>CH.store.name()||"Editor";

/* arquivo de take ausente (404): em vez de tela preta e ícone de imagem quebrada, quadro neutro com "Vídeo indisponível" (só apresentação).
   Só sinaliza depois de confirmar com HEAD que o arquivo realmente falta; "limpar" um <video> (removeAttribute("src")) também dispara error e NÃO conta. */
(function(){
  var FALTA="data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#26282b"/><g fill="none" stroke="#8b8f94" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="62" y="31" width="36" height="28" rx="4"/><path d="M98 41l10-6v20l-10-6"/></g></svg>');
  var cache={},marca=function(el,on){var m=el.closest&&el.closest(".monitor,.veja-m,.pv-mon,.mh-media,.go-media,.pf-stage");if(m)m.classList.toggle("av-falta",on)};
  var falta=function(url){if(!url)return Promise.resolve(false);if(cache[url]===undefined)cache[url]=fetch(url,{method:"HEAD",cache:"no-store"}).then(function(r){return !r.ok},function(){return false});return cache[url]};
  document.addEventListener("error",function(e){
    var t=e.target;if(!t||!t.tagName)return;
    if(t.tagName==="IMG"){var s=t.getAttribute("src")||"";if(t.dataset.fb||!/\/(takes|img|video)\//.test(s))return;falta(s).then(function(f){if(f&&t.naturalWidth===0){t.dataset.fb="1";t.src=FALTA;t.classList.add("av-falta-i")}});return}
    if(t.tagName==="SOURCE"||t.tagName==="VIDEO"){
      var v=t.tagName==="VIDEO"?t:t.parentNode;if(!v||v.tagName!=="VIDEO"||v.dataset.fb||!v.isConnected)return;
      if(t.tagName==="SOURCE"&&t.nextElementSibling)return;   /* ainda há outra fonte (mp4) para tentar */
      var u=v.currentSrc||v.getAttribute("src")||(t.tagName==="SOURCE"&&t.getAttribute("src"))||"";if(!u)return;
      falta(u).then(function(f){if(f&&v.isConnected&&v.readyState<2){v.dataset.fb="1";v.poster=FALTA;marca(v,true)}})}
  },true);
  /* se o vídeo chegou a tocar, o aviso sai */
  ["loadeddata","playing"].forEach(function(n){document.addEventListener(n,function(e){var v=e.target;if(v&&v.tagName==="VIDEO"&&v.dataset.fb){delete v.dataset.fb;marca(v,false)}},true)});
})();
