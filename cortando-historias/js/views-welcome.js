/* views-welcome.js — Boas-vindas: capa → nome → escolha do editor → início da jornada.
   Não é cadastro: nome e persona ficam só neste aparelho. A escolha não dá poder nem nível. */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,icon}=CH;
CH.views=CH.views||{};

CH.views.welcome=function(root,mode){
  const troca=mode==="troca";
  let step=troca?3:(CH.store.name()?3:2),pick=CH.store.persona()||(()=>{try{const h=localStorage.getItem('ch:persona-hint');return CH.PERSONAS[h]?h:null}catch(e){return null}})(),nome=CH.store.name();
  document.body.classList.add("immersive");
  const first=CH.allActs()[0];
  const P=CH.data.personas.personas;
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
    <button class="w-back" type="button" data-go="${troca?"back":"2"}">${icon("back")}${troca?"Meu espaço":"Voltar"}</button>
    <div class="pk" id="pick" data-state="base">
      <div class="pk-left">
        <header class="w-head"><h2 class="w-h" id="w3-t" tabindex="-1">Qual <b>perfil de editor</b> é o seu?</h2>
          <p class="w-hint">Escolha um perfil para ver como ele olha a montagem. Não existe melhor nem pior.</p></header>
        <div class="pk-dock">
          <div class="pk-ctl" id="pk-ctl" role="group" aria-label="Escolha de perfil de editor" style="--n:${P.length+1}">
            <span class="pk-track pk-gl" aria-hidden="true"></span>
            <span class="pk-cap pk-gl" aria-hidden="true"></span>
            <div class="pk-cells" id="pk-cells">
              <div class="pk-cell pk-label">Escolha seu perfil →</div>
              ${P.map(p=>`<button type="button" class="pk-cell pk-b" data-id="${p.id}"><span class="pk-t">${esc(p.curto)}</span></button>`).join("")}
            </div>
          </div>
          <p class="pk-err" id="pk-err" role="alert" hidden><span id="pk-err-t"></span><button type="button" class="pk-retry" id="pk-retry">Tentar de novo</button></p>
        </div>
        <article class="p-det" id="p-det" aria-live="polite"></article>
      </div>
      <div class="pk-swipe" id="pk-swipe" aria-label="Deslize para escolher o perfil" role="group">${P.map(p=>`<figure class="sw" data-id="${p.id}" data-name="${esc(p.curto)}" style="--pc:${p.bg||p.cor};--pf:${p.bgfg||p.fg}"><img src="${p.poster}" alt="" width="640" height="640" loading="lazy"><video class="sw-v" muted loop playsinline preload="metadata" poster="${p.poster}" aria-hidden="true">${CH.videoSources(p.video.replace(/\.webm$/,""))}</video></figure>`).join("")}</div>
      <div class="sw-ui" aria-hidden="true"><span class="sw-hint glass">${icon("back")}Deslize para escolher${icon("next")}</span><span class="sw-dots">${P.map((p,k)=>`<i data-i="${k}"></i>`).join("")}</span></div>
      <div class="pk-stage" id="pk-stage" aria-hidden="true"><div class="pk-idle"><span>Escolha um perfil para ver como ele olha o corte.</span></div></div>
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
    const t=$(`.ws[data-step="${n}"] [tabindex="-1"]`,wel);t&&t.focus({preventScroll:true});window.scrollTo(0,0);
    if(n===3){if(mob()&&!pick)hov=P[0].id;ensureLayers();renderPick().catch(()=>{});setIndex(0);if(person()&&!mob()&&scene==="base"&&!lock)choose($(`.pk-b[data-id="${pick}"]`,cells),{instant:true});else if(scene==="selected"&&shown&&layers[shown]&&!CH.reduced())layers[shown].play().catch(()=>{});if(mob()&&pick){const i=P.findIndex(x=>x.id===pick);requestAnimationFrame(()=>{swipe.scrollLeft=i*slideW();tocaSw(i);marcaDot(i)})}}if(n===4)renderGo();
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
  const swipe=$("#pk-swipe",wel);let swT=0;
  const slideW=()=>{const f=swipe.children[0],g=swipe.children[1];return f&&g?g.offsetLeft-f.offsetLeft:swipe.clientWidth};
  const dots=()=>[...wel.querySelectorAll(".sw-dots i")];
  /* só o perfil à vista se move (os vizinhos pausam) */
  function tocaSw(i){[...swipe.children].forEach((f,k)=>{const v=f.querySelector(".sw-v");if(!v)return;if(k===i&&!CH.reduced()){v.preload="auto";v.play().catch(()=>{})}else v.pause()})}
  function marcaDot(i){tocaSw(i);dots().forEach((d,k)=>d.classList.toggle("on",k===i))}
  swipe.addEventListener("scroll",()=>{if(!mob())return;const i=Math.max(0,Math.min(P.length-1,Math.round(swipe.scrollLeft/slideW())));marcaDot(i);[...swipe.children].forEach((f,k)=>f.classList.toggle('on',k===i));wel.classList.add("swiped");
    clearTimeout(swT);swT=setTimeout(()=>{const f=swipe.children[i];if(!f)return;const id=f.dataset.id;if(pick){if(pick!==id){pick=id;renderPick()}}else if(hov!==id){hov=id;renderPick()}},80)},{passive:true});
  wel.addEventListener("click",e=>{const d=e.target.closest(".sw-dots i");if(d)swipe.children[+d.dataset.i].scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})});
  setTimeout(()=>marcaDot(0),50);swipe.children[0]&&swipe.children[0].classList.add('on');
  const person=()=>CH.PERSONAS[pick];
  const shownP=()=>person()||(hov&&CH.PERSONAS[hov]);

  const stage=$("#pk-stage",wel),pk=$("#pick",wel),ctl=$("#pk-ctl",wel),cells=$("#pk-cells",wel),errBox=$("#pk-err",wel),errT=$("#pk-err-t",wel),retry=$("#pk-retry",wel);
  const layers={};let shown=null,lastBtn=null,failed=null;
  /* estado: scene base|selected; lock síncrono; token invalida qualquer callback antigo (timer, vídeo, transição) */
  let lock=false,token=0,scene="base",swapGen=0,pendingSwap=null;
  const timers=new Set(),offs=[];
  const after=(ms,fn)=>{const id=setTimeout(()=>{timers.delete(id);fn()},CH.reduced()?1:ms);timers.add(id)};
  const wait=ms=>new Promise(r=>after(ms,r));
  const on=(t,ev,fn,o)=>{t.addEventListener(ev,fn,o);offs.push(()=>t.removeEventListener(ev,fn,o))};
  const btns=()=>$$(".pk-b",cells);
  const N=P.length+1;
  /* cápsula: posição por custom properties (nunca left/width inline); 0 = rótulo, 1..n = perfis; as pontas avançam 5px */
  function setIndex(i){
    ctl.style.setProperty("--cap-left",i===0?"-5px":`calc(100% * ${i} / var(--n))`);
    ctl.style.setProperty("--cap-width",i===0||i===N-1?"calc(100% / var(--n) + 5px)":"calc(100% / var(--n))");
    ctl.classList.toggle("hl",i>0);
  }
  const idle=()=>scene==="base"&&!lock;
  on(cells,"pointerover",e=>{const b=e.target.closest(".pk-b");if(!b||b.disabled||!idle())return;setIndex(btns().indexOf(b)+1)});
  on(ctl,"pointerleave",()=>{const a=document.activeElement;if(a&&cells.contains(a)&&a.matches(":focus-visible"))return;if(idle())setIndex(0)});
  on(ctl,"pointermove",e=>{const r=ctl.getBoundingClientRect();if(!r.width)return;ctl.style.setProperty("--glass-x",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");ctl.style.setProperty("--glass-y",((e.clientY-r.top)/r.height*100).toFixed(1)+"%")});
  on(cells,"focusin",e=>{const b=e.target.closest(".pk-b");if(b&&idle())setIndex(btns().indexOf(b)+1)});
  on(cells,"focusout",e=>{if(idle()&&!cells.contains(e.relatedTarget)&&!ctl.matches(":hover"))setIndex(0)});
  on(cells,"keydown",e=>{
    const bs=btns().filter(b=>!b.disabled),i=bs.indexOf(document.activeElement);if(i<0)return;
    const d=e.key==="ArrowRight"||e.key==="ArrowDown"?1:e.key==="ArrowLeft"||e.key==="ArrowUp"?-1:0;
    if(d&&bs.length>1){e.preventDefault();bs[(i+d+bs.length)%bs.length].focus()}
  });
  /* o rótulo escolhido viaja até o centro da cápsula recolhida (medido contra o alvo, não por deslocamento fixo) */
  const narrow=()=>matchMedia("(min-width:641px) and (max-width:1279px)").matches;
  function travel(b){
    const c=ctl.getBoundingClientRect(),r=b.getBoundingClientRect();
    b.style.setProperty("--tx",(c.left+c.width/2-(r.left+r.width/2)).toFixed(1)+"px");
    b.style.setProperty("--ty",(c.top+(narrow()?32:35)-(r.top+r.height/2)).toFixed(1)+"px");
  }
  on(window,"resize",()=>{if(scene==="selected"&&lastBtn&&!lock){const t=lastBtn.style.transition;lastBtn.style.transition="none";lastBtn.style.setProperty("--tx","0px");lastBtn.style.setProperty("--ty","0px");travel(lastBtn);void lastBtn.offsetWidth;lastBtn.style.transition=t}});
  function label(b,txt,aria){b.querySelector(".pk-t").textContent=txt;if(aria)b.setAttribute("aria-label",aria);else b.removeAttribute("aria-label")}
  function ensureLayers(){
    if(Object.keys(layers).length)return;
    P.forEach(p=>{const v=document.createElement("video");v.className="pk-v";v.muted=true;v.loop=true;v.playsInline=true;v.preload="auto";v.poster=p.poster;
      v.setAttribute("aria-hidden","true");v.innerHTML=CH.videoSources(p.video.replace(/\.webm$/,""));layers[p.id]=v;stage.append(v)});
  }
  function cancelSwap(){if(pendingSwap){const s=pendingSwap;pendingSwap=null;s.abort()}swapGen++}
  /* troca de vídeo sem costura: só revela um quadro decodificado DESTA requisição (mediaTime<=.5 && readyState>=2); o tempo limite nunca conta como sucesso */
  function swap(p){
    if(pendingSwap&&pendingSwap.id===p.id)return pendingSwap.promise;
    ensureLayers();
    const nv=layers[p.id];
    if(shown===p.id&&nv.classList.contains("on"))return Promise.resolve();
    cancelSwap();
    const gen=swapGen;
    stage.style.setProperty("--pc",p.bg||p.cor);
    let finish;
    const promise=new Promise((resolve,reject)=>{
      let finished=false,left=12000,t0=0,tm=0,att=0,ac=[];
      const live=()=>!finished&&gen===swapGen;
      const clean=()=>{ac.forEach(f=>f());ac=[]};
      finish=(fn,v)=>{if(finished)return;finished=true;clearTimeout(tm);clean();document.removeEventListener("visibilitychange",vis);if(pendingSwap&&pendingSwap.gen===gen)pendingSwap=null;fn(v)};
      const arm=()=>{t0=performance.now();clearTimeout(tm);tm=setTimeout(()=>finish(reject,new Error("timeout")),Math.max(0,left))};
      const disarm=()=>{if(t0){left-=performance.now()-t0;t0=0}clearTimeout(tm)};
      function vis(){
        if(!live())return;
        if(document.hidden){disarm();att++;clean();nv.pause();try{nv.currentTime=0}catch(e){}}
        else{arm();attempt()}
      }
      function seekZero(){return new Promise(res=>{
        if(nv.currentTime<=.001){res();return}
        const h=()=>{nv.removeEventListener("seeked",h);res()};
        nv.addEventListener("seeked",h);ac.push(()=>nv.removeEventListener("seeked",h));
        try{nv.currentTime=0}catch(e){res()}})}
      function frame(){return new Promise(res=>{
        if(typeof nv.requestVideoFrameCallback==="function"){
          let id=0;const cb=(now,meta)=>{if(meta.mediaTime<=.5&&nv.readyState>=2)res();else id=nv.requestVideoFrameCallback(cb)};
          id=nv.requestVideoFrameCallback(cb);ac.push(()=>{try{nv.cancelVideoFrameCallback(id)}catch(e){}});
        }else{
          let raf=0;
          const chk=()=>{if(nv.readyState>=2)raf=requestAnimationFrame(()=>{raf=requestAnimationFrame(res)});else raf=requestAnimationFrame(chk)};
          const h=()=>{nv.removeEventListener("playing",h);chk()};
          nv.addEventListener("playing",h);ac.push(()=>{nv.removeEventListener("playing",h);cancelAnimationFrame(raf)});
        }})}
      function attempt(){
        const a=++att;clean();nv.preload="auto";
        seekZero().then(()=>{
          if(!live()||a!==att||document.hidden)return;
          const fp=frame();   /* o callback do primeiro quadro é registrado ANTES de play() */
          const pp=Promise.resolve(nv.play());
          return Promise.all([pp,fp]).then(()=>{if(live()&&a===att)reveal()});
        }).catch(e=>{if(live()&&a===att)finish(reject,e)});
      }
      function reveal(){
        Object.values(layers).forEach(x=>{x.classList.toggle("on",x===nv);if(x!==nv)x.pause()});
        shown=p.id;stage.classList.add("has");if(CH.reduced())nv.pause();
        finish(resolve);
      }
      /* todas as fontes falharam (erro nos <source> não borbulha): falha na hora, sem esperar os 12 s */
      let bad=0;const nsrc=nv.querySelectorAll("source").length;
      const onErr=e=>{if(e.target&&e.target.tagName==="SOURCE"){if(++bad>=nsrc)finish(reject,new Error("source"))}else if(e.target===nv)finish(reject,nv.error||new Error("media"))};
      nv.addEventListener("error",onErr,true);
      const finish0=finish;finish=(fn,v)=>{nv.removeEventListener("error",onErr,true);finish0(fn,v)};
      document.addEventListener("visibilitychange",vis);
      if(nv.networkState===3||nv.error){try{nv.load()}catch(e){}}   /* já falhou antes (o erro passou antes do listener): recarrega para tentar de novo */
      if(!document.hidden){arm();attempt()}
    });
    pendingSwap={id:p.id,gen,promise,abort:()=>finish(()=>{},null)};
    return promise;
  }
  /* conteúdo da escolha: detalhe, cores e (no desktop) o vídeo; devolve a promessa do vídeo */
  function renderPick(){
    const p=shownP(),sel=!!person();
    pk.dataset.state=sel?"selected":"base";
    const d=$("#p-det",wel),sec=$(".ws3",wel);
    sec.classList.toggle("colored",!!p);
    if(p){const k=edge[p.id]||{bg:p.cor,fg:p.fg};sec.style.setProperty("--pc",k.bg);sec.style.setProperty("--pf",k.fg);if(!edge[p.id])edgeColor(p).then(()=>{if(shownP()&&shownP().id===p.id)renderPick()})}
    if(!p){d.innerHTML="";cancelSwap();stage.classList.remove("has");Object.values(layers).forEach(x=>{x.classList.remove("on");x.pause()});shown=null;return Promise.resolve()}
    const vid=mob()?Promise.resolve():swap(p);
    d.style.setProperty("--pc",p.cor);d.style.setProperty("--pf",p.fg);
    d.innerHTML=`
      <h3 class="pd-name">${(()=>{const w=p.nome.split(" "),l=w.pop();return esc(w.join(" "))+" <b>"+esc(l)+"</b>"})()}</h3>
      <p class="pd-rep">${esc(p.representa)}</p>
      <ul class="chips">${p.valoriza.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <p class="pd-ia">Personagem gerado por inteligência artificial</p><details class="pd-more"><summary>Como esse perfil pensa</summary><ul>${p.pensa.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p>${esc(p.papel)}</p></details>
      ${sel||mob()?`<button class="btn red lg" type="button" data-confirm>Esse sou eu${icon("next")}</button>`:""}`;
    const cf=$("[data-confirm]",d);if(cf)cf.onclick=()=>{pick=pick||p.id;CH.store.setPersona(pick);CH.who&&CH.who();show(4)};
    return vid;
  }
  /* FORWARD: base → selected. Trava síncrona; recolhe a barra e carrega o vídeo em paralelo; Reset só vale quando os dois terminam */
  function choose(btn,o){
    if(lock||scene!=="base"||!btn||btn.disabled)return;
    lock=true;const my=++token,instant=!!(o&&o.instant),id=btn.dataset.id,p=CH.PERSONAS[id];
    const had=document.activeElement===btn;   /* capturar o foco ANTES de desabilitar */
    lastBtn=btn;failed=null;errBox.hidden=true;
    if(instant)ctl.classList.add("no-anim");
    btns().forEach(b=>{b.disabled=true});
    travel(btn);btn.classList.add("is-pick");
    ctl.classList.add("collapsed","rear-fade");   /* recolhe e agenda o fade do trilho na mesma recalc */
    pick=id;hov=null;
    const vid=renderPick();
    if(!instant)CH.say("Carregando o perfil "+p.curto+".");
    Promise.all([vid,wait(instant?0:980)]).then(()=>{if(my!==token)return;commit(btn,had,p,instant)},e=>{if(my!==token)return;fail(btn,p,e)});
  }
  function commit(btn,had,p,instant){
    scene="selected";
    label(btn,"Reset","Reset: voltar à escolha de perfis");btn.classList.add("is-reset");btn.disabled=false;
    btns().forEach(b=>{if(b!==btn){b.disabled=true;b.setAttribute("aria-hidden","true");b.tabIndex=-1}});
    if(had)btn.focus({preventScroll:true});
    lock=false;
    if(instant)requestAnimationFrame(()=>requestAnimationFrame(()=>ctl.classList.remove("no-anim")));
    else CH.say("Perfil "+p.curto+" selecionado. Use Reset para escolher outro.");
  }
  function fail(btn,p,e){
    const my=token;
    pick=null;renderPick();
    ctl.classList.remove("no-anim","collapsed","rear-fade");btn.classList.remove("is-pick");setIndex(0);
    failed=btn;
    after(980,()=>{
      if(my!==token)return;
      btn.style.removeProperty("--tx");btn.style.removeProperty("--ty");
      btns().forEach(b=>{b.disabled=false});lock=false;
      errT.textContent="Não foi possível carregar o vídeo do perfil "+p.curto+".";errBox.hidden=false;
      CH.say("Não foi possível carregar o vídeo do perfil "+p.curto+". Use Tentar de novo.",true);
    });
  }
  /* REVERSE: selected → base. A barra reabre e os rótulos voltam em paralelo; os botões só reabilitam no fim */
  function reset(){
    if(lock||scene!=="selected")return;
    lock=true;const my=++token,btn=lastBtn,had=document.activeElement===btn,name=CH.PERSONAS[pick]?CH.PERSONAS[pick].curto:btn.querySelector(".pk-t").textContent;
    btn.disabled=true;btn.classList.add("rst-out");
    ctl.classList.add("reversing");ctl.classList.remove("collapsed","rear-fade");setIndex(0);
    btns().forEach(b=>{if(b!==btn)b.removeAttribute("aria-hidden")});
    pick=null;renderPick();
    CH.say("Voltando à escolha de perfis.");
    after(420,()=>{if(my!==token)return;label(btn,name);btn.classList.remove("is-reset","is-pick","rst-out");if(had)btn.focus({preventScroll:true})});
    after(980,()=>{
      if(my!==token)return;
      scene="base";ctl.classList.remove("reversing");
      btn.style.removeProperty("--tx");btn.style.removeProperty("--ty");
      btns().forEach(b=>{b.disabled=false;b.removeAttribute("aria-hidden");b.removeAttribute("tabindex")});
      if(had)btn.focus({preventScroll:true});
      lock=false;CH.say("Escolha um perfil de editor.");
    });
  }
  on(cells,"click",e=>{const b=e.target.closest(".pk-b");if(!b)return;if(scene==="selected"&&b===lastBtn)reset();else choose(b)});
  on(retry,"click",()=>{const b=failed;if(b){retry.blur();choose(b)}});

  function renderGo(){
    const p=person(),n=CH.store.name();
    const g=$("#go",wel);g.style.setProperty("--pc",p.cor);g.style.setProperty("--pf",p.fg);const w4=$(".ws4",wel);{const k=edge[p.id]||{bg:p.cor,fg:p.fg};w4.style.setProperty("--pc",k.bg);w4.style.setProperty("--pf",k.fg);g.style.setProperty("--pc",k.bg);g.style.setProperty("--pf",k.fg);if(!edge[p.id])edgeColor(p).then(()=>{if(person()&&$(".ws4",wel)&&!$(".ws4",wel).hidden)renderGo()})}
    g.innerHTML=`
      <div class="go-media"><video class="go-v" ${CH.reduced()?"":"autoplay"} muted loop playsinline poster="${p.poster}" aria-label="Animação do perfil ${esc(p.curto)}">${CH.videoSources(p.video.replace(/\.webm$/,""))}</video>
        </div>
      <div class="go-tx"><p class="eyebrow">Perfil ${esc(p.curto)}</p>
        <h2 class="go-h" id="w4-t" tabindex="-1">${n?esc(n)+", agora":"Agora"} <b>começa</b><br>a sua jornada.</h2>
        <p class="pd-ia">Personagem gerado por inteligência artificial</p><p class="go-q">Este é você no laboratório. Fique de olho na sua pergunta:<br><b>“${esc(p.pergunta)}”</b></p>
        <div class="cv-act"><a class="btn red lg" href="#/lab/${first}" data-end>Começar a jornada${icon("next")}</a><a class="btn ghost lg" href="#/percurso" data-end>Ver a jornada</a></div>
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
  $("#w-name",wel).addEventListener("submit",e=>{e.preventDefault();const v=$("#w-nm",wel).value.trim();CH.store.setName(v);nome=v;CH.who&&CH.who();show(3)});
  $("[data-skipname]",wel).onclick=()=>{CH.store.setName("");CH.who&&CH.who();show(3)};
  show(step);
  if(troca&&pick){/* na troca, abre já no editor atual */}
  return{title:"Boas-vindas",destroy(){document.body.classList.remove("immersive");token++;cancelSwap();timers.forEach(clearTimeout);timers.clear();offs.forEach(f=>f());stopVideos()}};
};
CH.views.editor=function(root,m){return CH.views.welcome(root,"troca")};
})();
