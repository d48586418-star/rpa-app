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
          <p class="w-hint">Passe o dedo ou o mouse pelos perfis para ver como cada um olha a montagem. Não existe melhor nem pior.</p></header>
        <div class="pk-dock">
          <div class="pk-ctl glass" role="radiogroup" aria-label="Perfis de editor">
            <span class="pk-cap" aria-hidden="true"></span>
            <ul class="pk-ul" id="pk-ul">${P.map(p=>`<li><button type="button" role="radio" class="pk-b" data-id="${p.id}" aria-checked="false" style="--pc:${p.cor}"><img src="${p.busto}" alt="" width="40" height="40" loading="lazy"><span>${esc(p.curto)}</span></button></li>`).join("")}</ul>
            <button type="button" class="pk-reset" id="pk-reset" tabindex="-1" aria-hidden="true">Trocar</button>
          </div>
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
    if(n===3){if(mob()&&!pick)hov=P[0].id;renderPick();requestAnimationFrame(moveCap);if(mob()&&pick){const i=P.findIndex(x=>x.id===pick);requestAnimationFrame(()=>{swipe.scrollLeft=i*slideW();tocaSw(i);marcaDot(i)})}}if(n===4)renderGo();
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
  /* profundidade: cada cartão recebe sua distância ao centro (--d); o central é grande, os vizinhos inclinam e esmaecem */
  let depthRaf=0;
  function profundidade(){depthRaf=0;const w=slideW()||1,c=swipe.scrollLeft;[...swipe.children].forEach((f,k)=>{f.style.setProperty("--d",Math.max(-2,Math.min(2,(k*w-c)/w)).toFixed(3))})}
  const agendaProf=()=>{if(!depthRaf)depthRaf=requestAnimationFrame(profundidade)};
  swipe.addEventListener("scroll",()=>{agendaProf();if(!mob())return;const i=Math.max(0,Math.min(P.length-1,Math.round(swipe.scrollLeft/slideW())));marcaDot(i);[...swipe.children].forEach((f,k)=>f.classList.toggle('on',k===i));wel.classList.add("swiped");
    clearTimeout(swT);swT=setTimeout(()=>{const f=swipe.children[i];if(!f)return;const id=f.dataset.id;if(pick){if(pick!==id){pick=id;renderPick()}}else if(hov!==id){hov=id;renderPick()}},80)},{passive:true});
  wel.addEventListener("click",e=>{const d=e.target.closest(".sw-dots i");if(d)swipe.children[+d.dataset.i].scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})});
  setTimeout(()=>{marcaDot(0);profundidade()},50);swipe.children[0]&&swipe.children[0].classList.add('on');
  const person=()=>CH.PERSONAS[pick];
  const shownP=()=>person()||(hov&&CH.PERSONAS[hov]);

  const stage=$("#pk-stage",wel),pk=$("#pick",wel),ul=$("#pk-ul",wel),cap=$(".pk-cap",wel),rst=$("#pk-reset",wel),ctl=$(".pk-ctl",wel);
  const layers={};let shown=null,lastBtn=null;
  /* a cápsula desliza até o item escolhido; medida a partir da própria posição dos itens */
  function moveCap(){
    const b=$(`.pk-b[aria-checked="true"]`,ul)||(hov&&$(`.pk-b[data-id="${hov}"]`,ul));
    if(!b){cap.style.opacity=0;return}
    const c=ctl.getBoundingClientRect(),r=b.getBoundingClientRect();
    cap.style.opacity=1;cap.style.width=r.width+"px";cap.style.height=r.height+"px";cap.style.transform=`translate(${r.left-c.left}px,${r.top-c.top}px)`;
  }
  /* troca de vídeo sem costura: o novo só aparece quando o primeiro quadro já pode ser mostrado; o antigo sai no mesmo quadro (sem fusão) */
  function swap(p){
    if(!layers[p.id]){
      const v=document.createElement("video");v.className="pk-v";v.muted=true;v.loop=true;v.playsInline=true;v.preload="auto";v.poster=p.poster;
      v.setAttribute("aria-hidden","true");v.innerHTML=CH.videoSources(p.video.replace(/\.webm$/,""));layers[p.id]=v;stage.append(v);
    }
    const nv=layers[p.id],old=shown&&layers[shown];shown=p.id;
    stage.style.setProperty("--pc",p.bg||p.cor);
    const go=()=>requestAnimationFrame(()=>{if(shown!==p.id)return;Object.values(layers).forEach(x=>{x.classList.toggle("on",x===nv);if(x!==nv)x.pause()});stage.classList.add("has");if(!CH.reduced())nv.play().catch(()=>{})});
    if(nv.readyState>=2)go();else{nv.addEventListener("loadeddata",go,{once:true});nv.load()}
  }
  function renderPick(){
    const p=shownP(),sel=!!person();
    $$(".pk-b",ul).forEach(b=>{const on=b.dataset.id===pick;b.setAttribute("aria-checked",on);b.tabIndex=on||(!pick&&b===ul.querySelector(".pk-b"))?0:-1});
    pk.dataset.state=sel?"selected":"base";
    rst.tabIndex=sel?0:-1;rst.setAttribute("aria-hidden",sel?"false":"true");
    const d=$("#p-det",wel),sec=$(".ws3",wel);
    sec.classList.toggle("colored",!!p);
    if(p){const k=edge[p.id]||{bg:p.cor,fg:p.fg};sec.style.setProperty("--pc",k.bg);sec.style.setProperty("--pf",k.fg);if(!edge[p.id])edgeColor(p).then(()=>{if(shownP()&&shownP().id===p.id)renderPick()})}
    if(!p){d.innerHTML="";stage.classList.remove("has");Object.values(layers).forEach(x=>{x.classList.remove("on");x.pause()});shown=null;requestAnimationFrame(moveCap);return}
    if(!mob())swap(p);
    d.style.setProperty("--pc",p.cor);d.style.setProperty("--pf",p.fg);
    d.innerHTML=`
      <h3 class="pd-name">${(()=>{const w=p.nome.split(" "),l=w.pop();return esc(w.join(" "))+" <b>"+esc(l)+"</b>"})()}</h3>
      <p class="pd-rep">${esc(p.representa)}</p>
      <ul class="chips">${p.valoriza.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <p class="pd-ia">Personagem gerado por inteligência artificial</p><details class="pd-more"><summary>Como esse perfil pensa</summary><ul>${p.pensa.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p>${esc(p.papel)}</p></details>
      ${sel||mob()?`<button class="btn red lg" type="button" data-confirm>Esse sou eu${icon("next")}</button>`:""}`;
    const cf=$("[data-confirm]",d);if(cf)cf.onclick=()=>{pick=pick||p.id;CH.store.setPersona(pick);CH.who&&CH.who();show(4)};
    /* o item colapsa só depois do layout assentar, então medimos no quadro seguinte e de novo ao fim da transição */
    requestAnimationFrame(()=>{moveCap();setTimeout(moveCap,520)});
  }
  /* deslizar no computador: arrastar o palco (ou setas ←/→ nele) passa para o perfil vizinho, com o mesmo efeito de troca do toque */
  function passo(d){
    const ids=P.map(x=>x.id),cur=person()?pick:(hov||ids[0]),n=ids[(ids.indexOf(cur)+d+ids.length)%ids.length];
    if(person())pick=n;else hov=n;renderPick();
  }
  let dx0=null,dy0=0;
  stage.style.touchAction="pan-y";stage.style.cursor="grab";
  stage.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")return;dx0=e.clientX;dy0=e.clientY;stage.style.cursor="grabbing";try{stage.setPointerCapture(e.pointerId)}catch(x){}});
  const fimArrasto=e=>{if(dx0===null)return;const dx=e.clientX-dx0;dx0=null;stage.style.cursor="grab";if(Math.abs(dx)>50)passo(dx<0?1:-1)};
  stage.addEventListener("pointerup",fimArrasto);stage.addEventListener("pointercancel",()=>{dx0=null;stage.style.cursor="grab"});
  pk.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea"))return;if(e.key==="ArrowRight"&&e.target===stage){e.preventDefault();passo(1)}else if(e.key==="ArrowLeft"&&e.target===stage){e.preventDefault();passo(-1)}});
  ul.addEventListener("click",e=>{const b=e.target.closest(".pk-b");if(!b||pk.dataset.state==="selected")return;lastBtn=b;pick=b.dataset.id;hov=null;renderPick();rst.focus({preventScroll:true})});
  ul.addEventListener("keydown",e=>{
    const bs=$$(".pk-b",ul),i=bs.indexOf(document.activeElement);if(i<0)return;
    const d=e.key==="ArrowRight"||e.key==="ArrowDown"?1:e.key==="ArrowLeft"||e.key==="ArrowUp"?-1:0;
    if(d){e.preventDefault();const n=bs[(i+d+bs.length)%bs.length];bs.forEach(x=>x.tabIndex=x===n?0:-1);n.focus()}
  });
  if(matchMedia("(hover:hover)").matches){
    ul.addEventListener("pointerover",e=>{const b=e.target.closest(".pk-b");if(!b||person())return;if(hov!==b.dataset.id){hov=b.dataset.id;renderPick()}});
    ctl.addEventListener("pointerleave",()=>{if(person()||!hov)return;hov=null;renderPick()});
  }
  rst.addEventListener("click",()=>{const back=lastBtn||$(`.pk-b[data-id="${pick}"]`,ul);pick=null;renderPick();setTimeout(()=>{moveCap();back&&back.focus({preventScroll:true})},60)});
  window.addEventListener("resize",moveCap);

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
  return{title:"Boas-vindas",destroy(){document.body.classList.remove("immersive");stopVideos()}};
};
CH.views.editor=function(root,m){return CH.views.welcome(root,"troca")};
})();
