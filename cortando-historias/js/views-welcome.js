/* views-welcome.js — Boas-vindas: capa → nome → escolha do editor → início da jornada.
   Não é cadastro: nome e persona ficam só neste aparelho. A escolha não dá poder nem nível. */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,icon}=CH;
CH.views=CH.views||{};

CH.views.welcome=function(root,mode){
  const troca=mode==="troca";
  const fromCap=(()=>{try{const v=sessionStorage.getItem('ch:go3');sessionStorage.removeItem('ch:go3');return v==='1'}catch(e){return false}})();let step=(troca||fromCap)?3:(CH.store.name()?3:2),nameAsked=false,pick=CH.store.persona()||(()=>{try{const h=localStorage.getItem('ch:persona-hint');return CH.PERSONAS[h]?h:null}catch(e){return null}})(),nome=CH.store.name();
  document.body.classList.add("immersive");
  const first=CH.allActs()[0];
  const P=CH.data.personas.personas;
  /* cor de fundo = cor medida no próprio vídeo de corpo inteiro (para o palco se fundir ao vídeo) */
  const FULLBG={ritmo:"#2b3e58",som:"#4e3145",historias:"#9b5745",olhar:"#91a493",experimental:"#b1833e"};
  root.innerHTML=`
<div class="wel" id="wel">
  <section class="ws ws1" data-step="1" aria-labelledby="w1-t">
    <div class="cover">
      <p class="cv-eye">Bem-vindo ao simulador</p>
      <h1 class="cv-t" id="w1-t" tabindex="-1" aria-label="Cortando Histórias"><span class="cv-w" aria-hidden="true">Cortando</span><span class="cv-w cv-w2" aria-hidden="true">Histórias</span></h1>
    </div>
    <div class="cv-base">
      <p class="cv-sub">Introdução à edição e montagem audiovisual</p>
      <p class="cv-in">Aqui você corta, assiste e descobre o que cada corte faz. Sem prova, sem nota.</p>
      <div class="cv-act"><button class="btn red lg" type="button" data-go="2">Iniciar a Jornada do Editor${icon("next")}</button>${CH.store.onboarded()?`<a class="btn ghost lg" href="#/inicio">Entrar direto</a>`:""}</div>
    </div>
  </section>

  <section class="ws ws2" data-step="2" aria-labelledby="w2-t" hidden>
    <a class="w-back" href="index.html">${icon("back")}Voltar</a>
    <form class="w-form" id="w-name" novalidate>
      <p class="eyebrow">Jornada do Editor</p>
      <h2 class="w-h" id="w2-t" tabindex="-1">Qual é o seu nome?</h2>
      <label class="sr" for="w-nm">Seu nome</label>
      <input id="w-nm" class="w-in" type="text" maxlength="40" autocomplete="given-name" placeholder="Escreva aqui" value="${esc(nome)}">
      <p class="w-hint">Fica só neste aparelho. Não existe conta nem cadastro.</p>
      <div class="cv-act"><button class="btn red lg" type="submit">Continuar${icon("next")}</button><button class="btn ghost lg" type="button" data-skipname>Prefiro não dizer</button></div>
    </form>
  </section>

  <section class="ws ws3" data-step="3" aria-labelledby="w3-t" hidden>
    ${fromCap&&!troca?`<a class="w-back" href="index.html">${icon("back")}Voltar</a>`:`<button class="w-back" type="button" data-go="${troca?"back":"2"}">${icon("back")}${troca?"Meu espaço":"Voltar"}</button>`}
    <div class="pk2" id="pick" data-state="base">
      <div class="pk2-track" id="pk2-track" role="group" aria-roledescription="carrossel" aria-label="Perfis de editor" tabindex="0">${P.map((p,k)=>{
        const src="assets/personas/full/"+p.id,w=p.nome.split(" "),l=w.pop();
        return `<article class="pf ${(p.bgfg||p.fg)==="#ffffff"||(p.bgfg||p.fg)==="#fff"?"pf-lt":"pf-dk"}" data-id="${p.id}" aria-roledescription="perfil" aria-label="${esc(p.nome)}, ${k+1} de ${P.length}" style="--pc:${FULLBG[p.id]||p.bg||p.cor};--pf:${p.bgfg||p.fg}">
        <div class="pf-stage" aria-hidden="true"><video class="pf-v" muted playsinline preload="none" poster="${src}.jpg">${CH.videoSources(src)}</video><video class="pf-v pf-v2" muted playsinline preload="none">${CH.videoSources(src)}</video></div>
        <h2 class="pf-kick"${k===0?' id="w3-t" tabindex="-1"':''}>Escolha o seu perfil de editor</h2>
        <div class="pf-tx">
          <h3 class="pd-name">${esc(w.join(" "))} <b>${esc(l)}</b></h3>
          <p class="pf-q">“${esc(p.pergunta)}”</p>
          <p class="pd-rep">${esc(p.representa)}</p>
          <ul class="chips">${p.valoriza.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          <details class="pd-more"><summary>Como esse perfil pensa</summary><ul>${p.pensa.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p>${esc(p.papel)}</p></details>
          <p class="pd-ia">Personagem gerado por inteligência artificial</p>
          <button class="gb pf-go" type="button" data-confirm="${p.id}">Escolher${icon("next")}</button>
        </div></article>`}).join("")}</div>
      <div class="pk-ctl" id="pk-ctl" role="group" aria-label="Perfis de editor" style="--n:${P.length};--pos:0">
        <span class="pk-track pk-gl" aria-hidden="true"></span><span class="pk-cap pk-gl" aria-hidden="true"></span>
        <div class="pk-cells" id="pk-dots">${P.map((p,k)=>`<button type="button" class="pk-dot" style="--f:${k?0:1}" aria-label="Perfil ${k+1} de ${P.length}: ${esc(p.curto)}"></button>`).join("")}</div>
        <span class="pk-sel" id="pk-sel" aria-hidden="true"></span>
      </div>
    </div>
  </section>

  <section class="ws ws4" data-step="4" aria-labelledby="w4-t" hidden>
    <div class="go" id="go"></div>
  </section>
</div>`;
  const wel=$("#wel",root);
  const say=m=>CH.say(m);

  function show(n){
    step=n;$$(".ws",wel).forEach(s=>{const on=+s.dataset.step===n;s.hidden=!on;if(on){s.classList.remove("in");void s.offsetWidth;s.classList.add("in")}});
    const t=$(`.ws[data-step="${n}"] [tabindex="-1"]`,wel);t&&window.name!=="ch-peek"&&t.focus({preventScroll:true});   /* a cópia invisível da abertura não rouba o foco */window.scrollTo(0,0);
    if(n===3){enterPick()}if(n===4)renderGo();
    if(n!==3&&n!==4)stopVideos();
  }
  function stopVideos(){$$("video",wel).forEach(v=>{v.pause()})}
  let hov=null;
  const mob=()=>matchMedia("(max-width:640px)").matches;
  /* cor do fundo = cor das bordas do próprio vídeo/poster, para a imagem não destoar */
  const edge={};P.forEach(p=>{if(p.bg)edge[p.id]={bg:p.bg,fg:p.bgfg||p.fg}});
  function lum(r,g,b){return (.2126*r+.7152*g+.0722*b)/255}
  /* amostra o quadro REAL do vídeo (mediana da faixa externa, sem cantos) — fallback: poster */
  function medianEdge(src,W,H){
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0,W,H);
    const R=[],G=[],B=[],px=(i,j)=>{const d=x.getImageData(i,j,1,1).data;R.push(d[0]);G.push(d[1]);B.push(d[2])};
    const bx=Math.round(W*.13),bx0=Math.round(W*.07),by=Math.round(H*.13),by0=Math.round(H*.07),x0=Math.round(W*.12),x1=Math.round(W*.88),y0=Math.round(H*.12),y1=Math.round(H*.88);
    for(let j=y0;j<y1;j+=2)for(let i=bx0;i<bx;i++){px(i,j);px(W-1-i,j)}
    for(let i=x0;i<x1;i+=2)for(let j=by0;j<by;j++){px(i,j);px(i,H-1-j)}
    const med=a=>{a.sort((m,n)=>m-n);return a[a.length>>1]};return [med(R),med(G),med(B)]}
  function paint(p,rgb){const [r,g,b]=rgb;return edge[p.id]={bg:`rgb(${r} ${g} ${b})`,fg:lum(r,g,b)>.6?"#161618":"#fff"}}
  function edgeColor(p){
    if(p.bg){edge[p.id]={bg:p.bg,fg:p.bgfg||p.fg};return Promise.resolve(edge[p.id])}
    if(edge[p.id])return Promise.resolve(edge[p.id]);
    const viaPoster=()=>new Promise(res=>{const im=new Image();im.onload=()=>{try{res(paint(p,medianEdge(im,96,54)))}catch(e){res({bg:p.cor,fg:p.fg})}};im.onerror=()=>res({bg:p.cor,fg:p.fg});im.src=p.poster});
    return new Promise(res=>{const v=document.createElement("video");v.muted=true;v.playsInline=true;v.preload="auto";v.crossOrigin="anonymous";
      let done=false;const fin=f=>{if(done)return;done=true;v.removeAttribute("src");v.load();f().then(res)};
      v.addEventListener("loadeddata",()=>{try{v.currentTime=Math.min(.4,(v.duration||1)/3)}catch(e){}});
      v.addEventListener("seeked",()=>fin(()=>{try{const m=medianEdge(v,96,54);if(lum(m[0],m[1],m[2])<.04||v.readyState<2)return viaPoster();return Promise.resolve(paint(p,m))}catch(e){return viaPoster()}}));
      v.addEventListener("error",()=>fin(viaPoster));setTimeout(()=>fin(viaPoster),2500);
      v.innerHTML=CH.videoSources(p.video.replace(/\.webm$/,""));v.load()})}
  /* escolha do perfil: um palco de 100vw por personagem (corpo inteiro, vídeo animado) + barra de vidro "Escolha →" que recolhe em "Reset" */
  const person=()=>CH.PERSONAS[pick];
  const pk=$("#pick",wel),track=$("#pk2-track",wel),slides=$$(".pf",track);
  let cur=-1,rafP=0,drag=null;
  const idxOf=()=>Math.max(0,Math.min(P.length-1,Math.round(track.scrollLeft/(track.clientWidth||1))));
  /* o laço de 10 s não tem emenda perfeita: dois vídeos se alternam com fusão de 0,8 s perto do fim */
  const loops=new WeakMap();
  function startLoop(sl){
    const [a,b]=$$(".pf-v",sl);if(!a||!b||loops.has(sl))return;
    const st={cur:a,oth:b,on:true,fade:false};loops.set(sl,st);a.style.opacity=1;b.style.opacity=0;
    const tick=()=>{if(!st.on)return;const v=st.cur,d=v.duration;
      if(d&&!st.fade&&v.currentTime>d-.9){st.fade=true;const o=st.oth;try{o.currentTime=0}catch(e){}o.play().catch(()=>{});o.style.transition="opacity .8s linear";v.style.transition="opacity .8s linear";o.style.opacity=1;v.style.opacity=0;
        setTimeout(()=>{if(!st.on)return;v.pause();try{v.currentTime=0}catch(e){}st.cur=o;st.oth=v;st.fade=false},850)}
      requestAnimationFrame(tick)};
    a.play().catch(()=>{});requestAnimationFrame(tick);
  }
  function stopLoop(sl){const st=loops.get(sl);if(!st)return;st.on=false;loops.delete(sl);$$(".pf-v",sl).forEach(v=>{v.pause();v.style.transition="none"})}
  function ativa(i,anuncia){
    if(i===cur)return;cur=i;
    slides.forEach((sl,k)=>{sl.classList.toggle("on",k===i);if(k!==i)stopLoop(sl);else if(!CH.motionOff())startLoop(sl)});
    [i-1,i+1].forEach(k=>{const sl=slides[k];if(sl)$$(".pf-v",sl)[0].preload="metadata"});
    const p=P[i],r3=pk.parentElement;r3.style.setProperty("--cf",p.bgfg||p.fg);r3.style.setProperty("--cb",FULLBG[p.id]||p.bg||p.cor);
    if(anuncia)CH.say("Perfil "+p.curto+", "+(i+1)+" de "+P.length+".");
  }
  function ir(i,suave){i=Math.max(0,Math.min(P.length-1,i));track.scrollTo({left:i*track.clientWidth,behavior:suave&&!CH.motionOff()?"smooth":"auto"})}
  track.addEventListener("scroll",()=>{if(rafP)return;rafP=requestAnimationFrame(()=>{rafP=0;ativa(idxOf(),true)})},{passive:true});
  /* mouse: arrastar o palco (o toque já desliza nativamente); travado enquanto há perfil escolhido */
  track.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0||(e.target.closest&&e.target.closest("button,a,summary,details,input")))return;drag={x:e.clientX,s:track.scrollLeft,m:false};try{track.setPointerCapture(e.pointerId)}catch(x){}});
  track.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x;if(!drag.m&&Math.abs(dx)>5){drag.m=true;track.classList.add("grab")}if(drag.m)track.scrollLeft=drag.s-dx});
  const solta=e=>{if(!drag)return;const d=drag,dx=e.clientX-d.x;drag=null;if(!d.m)return;track.classList.remove("grab");const w=track.clientWidth;let i=Math.round(track.scrollLeft/w);if(Math.abs(dx)>w*.12)i=Math.round(d.s/w)+(dx<0?1:-1);ir(i,true)};
  track.addEventListener("pointerup",solta);track.addEventListener("pointercancel",solta);
  wel.addEventListener("keydown",e=>{if(step!==3||(e.target.closest&&e.target.closest("input,textarea,summary,.pk-ctl")))return;if(e.key==="ArrowRight"){e.preventDefault();ir(cur+1,true)}else if(e.key==="ArrowLeft"){e.preventDefault();ir(cur-1,true)}});
  window.addEventListener("resize",()=>{if(step===3&&cur>=0)track.scrollLeft=cur*track.clientWidth});
  /* ---------- controlador de vidro: a cápsula acompanha o dedo; as bolinhas enchem; "Escolher" recolhe o trilho em cápsula ---------- */
  const ctl=$("#pk-ctl",wel),dots=$$(".pk-dot",wel),dotsEl=$("#pk-dots",wel),sel=$("#pk-sel",wel),btnGo=()=>$$(".pf-go",wel);
  let lock=false,token=0,rafM=0;const timers=new Set();
  const after=(ms,fn)=>{const id=setTimeout(()=>{timers.delete(id);fn()},CH.motionOff()?1:ms);timers.add(id)};
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  /* progresso do deslize → cápsula, bolinhas e a "distância" de cada página (--a: 0 no centro, 1 a uma página) */
  function marca(){
    const w=track.clientWidth||1,x=cl(track.scrollLeft/w,0,P.length-1);
    ctl.style.setProperty("--pos",x.toFixed(3));
    dots.forEach((d,k)=>d.style.setProperty("--f",Math.max(0,1-Math.abs(x-k)).toFixed(3)));
    if(CH.motionOff())return;
    slides.forEach((sl,k)=>{const d=cl(x-k,-1,1);sl.style.setProperty("--d",d.toFixed(3));sl.style.setProperty("--a",Math.abs(d).toFixed(3))});
  }
  track.addEventListener("scroll",()=>{if(rafM)return;rafM=requestAnimationFrame(()=>{rafM=0;marca()})},{passive:true});
  dots.forEach((d,k)=>d.addEventListener("click",()=>{if(!lock)ir(k,true)}));
  dotsEl.addEventListener("keydown",e=>{if(lock)return;const k=dots.indexOf(document.activeElement);if(k<0)return;const d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(d){e.preventDefault();const n=cl(k+d,0,P.length-1);dots[n].focus();ir(n,true)}});
  ctl.addEventListener("pointermove",e=>{const r=ctl.getBoundingClientRect();if(!r.width)return;ctl.style.setProperty("--glass-x",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");ctl.style.setProperty("--glass-y",((e.clientY-r.top)/r.height*100).toFixed(1)+"%")});
  function escolher(btn){
    if(lock)return;lock=true;const my=++token,id=btn.dataset.confirm,p=CH.PERSONAS[id],i=P.findIndex(x=>x.id===id);   /* trava na hora, antes de qualquer espera */
    btnGo().forEach(b=>{b.disabled=true});dots.forEach(d=>{d.disabled=true});
    track.classList.add("locked");
    sel.textContent=p.curto;sel.style.setProperty("--sel-left",`calc(100% * ${(i+.5)} / var(--n))`);
    const c=ctl.getBoundingClientRect();const mid=c.left+c.width/2,at=c.left+c.width*(i+.5)/P.length;sel.style.setProperty("--sel-dx",(mid-at).toFixed(1)+"px");
    pk.classList.add("choosing");ctl.classList.add("collapsed","rear-fade");   /* recolhe e agenda o fade do trilho de trás na mesma recalc */
    CH.say("Perfil "+p.curto+" escolhido.");
    after(1150,()=>{if(my!==token)return;pick=id;CH.store.setPersona(pick);CH.who&&CH.who();if(!CH.store.name()&&!nameAsked){nameAsked=true;show(2)}else show(4)});
  }
  wel.addEventListener("click",e=>{const cf=e.target.closest("[data-confirm]");if(cf&&!lock)escolher(cf)});
  function enterPick(){
    token++;timers.forEach(clearTimeout);timers.clear();lock=false;cur=-1;slides.forEach(stopLoop);
    pk.classList.remove("choosing");track.classList.remove("locked");ctl.classList.remove("collapsed","rear-fade");btnGo().forEach(b=>{b.disabled=false});dots.forEach(d=>{d.disabled=false});
    const i0=Math.max(0,P.findIndex(x=>x.id===pick));
    requestAnimationFrame(()=>{track.scrollLeft=i0*track.clientWidth;ativa(i0,false);marca()});
  }

  function renderGo(){
    const p=person(),n=CH.store.name();
    const g=$("#go",wel);g.style.setProperty("--pc",p.cor);g.style.setProperty("--pf",p.fg);const w4=$(".ws4",wel);{const k=edge[p.id]||{bg:p.cor,fg:p.fg};w4.style.setProperty("--pc",k.bg);w4.style.setProperty("--pf",k.fg);g.style.setProperty("--pc",k.bg);g.style.setProperty("--pf",k.fg);if(!edge[p.id])edgeColor(p).then(()=>{if(person()&&$(".ws4",wel)&&!$(".ws4",wel).hidden)renderGo()})}
    g.innerHTML=`
      <div class="go-media"><video class="go-v" ${CH.motionOff()?"":"autoplay"} muted loop playsinline poster="${p.poster}" aria-label="Animação do perfil ${esc(p.curto)}">${CH.videoSources(p.video.replace(/\.webm$/,""))}</video>
        </div>
      <div class="go-tx"><p class="eyebrow">Perfil ${esc(p.curto)}</p>
        <h2 class="go-h" id="w4-t" tabindex="-1">${n?esc(n)+", agora":"Agora"} <b>começa</b><br>a sua jornada.</h2>
        <p class="pd-ia">Personagem gerado por inteligência artificial</p><p class="go-q">Este é você no laboratório. Fique de olho na sua pergunta:<br><b>“${esc(p.pergunta)}”</b></p>
        <div class="cv-act"><a class="btn red lg" href="#/lab/${first}" data-end>Começar a jornada${icon("next")}</a></div>
        <button class="w-link" type="button" data-change>Trocar de perfil</button></div>`;
    $("[data-change]",g).onclick=()=>show(3);
    $$("[data-end]",g).forEach(a=>a.addEventListener("click",()=>{CH.store.setOnboarded();}));
    $("#w4-t",g).focus({preventScroll:true});
    if(troca){CH.store.setOnboarded();}
  }

  wel.addEventListener("click",e=>{
    const go=e.target.closest("[data-go]");
    if(go){const t=go.dataset.go;if(t==="back"){location.hash="#/eu";return}show(+t);return}
    const c=e.target.closest(".p-card");if(c){pick=c.dataset.id;renderPick()}
  });
  $("#w-name",wel).addEventListener("submit",e=>{e.preventDefault();const v=$("#w-nm",wel).value.trim();CH.store.setName(v);nome=v;CH.who&&CH.who();show(person()?4:3)});
  $("[data-skipname]",wel).onclick=()=>{CH.store.setName("");CH.who&&CH.who();show(person()?4:3)};
  show(step);
  if(troca&&pick){/* na troca, abre já no editor atual */}
  return{title:"Boas-vindas",destroy(){document.body.classList.remove("immersive");token++;timers.forEach(clearTimeout);timers.clear();stopVideos()}};
};
CH.views.editor=function(root,m){return CH.views.welcome(root,"troca")};
})();
