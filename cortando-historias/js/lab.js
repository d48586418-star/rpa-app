/* lab.js — o Laboratório (atividade + Laboratório Livre): monitor, timeline, ferramentas, rascunho.
   Preserva o modelo do v7: seq=[{id,a,b}] (fração do take), sel, cutAt, hist, regras canSplit/canTrim/noDup. */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,fmt,icon}=CH;
const MAXCLIPS=8,MIN_DUR=0.6,MINW=matchMedia("(max-width:999px)").matches?104:64;

class Lab{
  constructor(root,exId,opts={}){
    this.root=root;this.exId=exId;this.free=exId===CH.LIVRE;this.ex=CH.EXF[exId];this.act=CH.ACT[exId];
    this.ar=CH.ratioOf(exId);
    this.seq=[];this.sel=-1;this.cutAt=.5;this.hist=[];this.t=0;
    this.watched=false;this.tab=this.free?"planos":"planos";this.libTab=this.free?"all":"pool";this.film="ALL";
    this.read=null;this.fromVersion=null;this.dirty=false;this.nowIdx=-1;this.destroyed=false;
    this.nv=CH.NOVAS&&CH.NOVAS[exId]||null;this.av=!!(this.nv&&this.nv.av);this.aud=[];this.selA=-1;this.mix=this.av?new CH.AudioMix():null;
    CH.store.touch(exId);
    this.build();
    this.restore();
    this.bind();
    this.refresh();
  }

  /* ---------- regras herdadas do v7 ---------- */
  ops(){return this.ex.operations||{}}
  canSplit(id){const s=this.ops().split;return !!(s&&s.enabled&&(!s.takes||!s.takes.length||s.takes.includes(id)))}
  canTrim(id){const t=this.ops().trim;return !!(t&&t.enabled&&(t.takes||[]).includes(id))}
  canHandle(id){return this.canTrim(id)||this.canSplit(id)}
  noDup(){return (this.ex.version_constraints||{}).allow_duplicates===false}
  rp(){return this.ex.reflection_policy||{}}
  push(){this.hist.push(JSON.stringify({seq:this.seq,sel:this.sel}))}

  /* ---------- esqueleto ---------- */
  build(){
    const ato=CH.atoDe(this.exId),ex=this.ex,free=this.free,dd=CH.didatica(this.exId);
    const back=free?`<a class="back" href="#/inicio">${icon("back")}Início</a>`:`<a class="back" href="#/percurso">${icon("back")}Jornada</a>`;
    this.root.innerHTML=`
<div class="lab" data-panel="planos" data-free="${free?1:0}">
 <div class="lab-main">
  <header class="lab-head">
    ${back}
    <span class="eyebrow">${free?"Agora é o seu laboratório":ato?`Etapa ${ato.n}: ${esc(ato.verbo)}`:""}</span>
    <h1 class="h2" id="page-title" tabindex="-1">${esc(this.act.t)}</h1>
    ${free?"":`<ol class="trail" id="stepper" aria-label="Caminho da atividade"></ol>`}
  </header>

  <section class="brief" aria-label="O que fazer">
    <p class="brief-do"><span class="brief-k">${free?"Comece":"Faça"}</span><b>${esc(dd.curto||dd.faca||ex.student_mission)}</b></p>
    <details class="brief-more"><summary>Observe e enunciado completo</summary>${dd.observe?`<p class="brief-ob"><span class="brief-k">Observe</span>${esc(dd.observe)}</p>`:""}${dd.faca&&dd.curto?`<p>${esc(dd.faca)}</p>`:""}${dd.intro?`<p class="brief-intro"><b>O que é:</b> ${esc(dd.intro)}</p>`:""}<p>${esc(ex.student_mission)}</p></details>
    <div class="coach" id="coach" hidden role="status"></div>
  </section>

  ${this.exId==="EX_CROSSCUT_001"&&CH.museuLink?CH.museuLink(CH.data.museu.linha.filter(e=>e.id==="griffith"),"Para ler antes, no Museu"):""}

  <div class="dock">
    <div class="dock-in">
      <div class="mon-wrap" style="--arn:${this.ar==="4:3"?1.3333:1.7778}">
        ${CH.monitorHTML(this.ar)}
        <div class="transport">
          <button class="btn ink" id="b-play" type="button"><span class="ic-slot">${icon("play")}</span><span id="b-play-t">Assistir</span></button>
          <button class="btn icon-only" id="b-start" type="button" aria-label="Voltar ao início">${icon("rewind")}</button>
          <span class="tc mono tnum" id="tc" aria-hidden="true">00:00.0 / 00:00.0</span>
          <button class="btn sm" id="b-sound" type="button" hidden aria-pressed="false">${icon("mute")}<span>Ligar o som</span></button><span class="muted-note" id="note-mute" title="Este laboratório reproduz sem som">${icon("mute")}<span>sem som</span></span>
        </div>
      </div>
      <p class="cr" id="cr" aria-live="polite"></p>
      <div class="prox" id="prox" hidden aria-live="polite"><div class="prox-top"><span>Você está a <b class="prox-n">0%</b> do efeito</span><span class="prox-l"></span></div><div class="prox-bar"><i></i></div><p class="prox-dica" hidden></p></div>
      <div class="tl" id="tl">
        <div class="tl-head"><span class="tl-r in"><i></i>Início <b id="tl-a">00:00.0</b></span><span class="tl-r mid"><span class="mono tnum" id="tl-dur">00:00.0</span> no total<span class="tl-zoom" role="group" aria-label="Zoom da timeline"><button type="button" class="btn sm" id="tl-zo" aria-label="Diminuir o zoom da timeline">−</button><button type="button" class="btn sm" id="tl-zi" aria-label="Aumentar o zoom da timeline">+</button></span></span><span class="tl-r out"><i></i>Fim <b id="tl-b">00:00.0</b></span></div>
        <div class="tl-body"><div class="tl-lanes" aria-hidden="true"><i class="r"></i><b class="lb">V1</b><b class="lb b">A1</b></div>
        <div class="tl-scroll" id="tl-scroll" tabindex="0" role="group" aria-label="Timeline. Use as setas para mover o ponto de leitura; Shift move de 1 em 1 segundo.">
          <div class="tl-inner" id="tl-inner"></div>
        </div></div>
        <p class="tl-legend"><span id="tl-hint" class="tl-hint"></span></p>
      </div>
    </div>
  </div>
  <div class="tools" id="tools" role="toolbar" aria-label="Ferramentas de montagem" hidden>
    <button class="btn sm" id="b-left" type="button" aria-label="Mover o plano uma posição para a esquerda">${icon("left")}Recuar</button>
    <button class="btn sm" id="b-right" type="button" aria-label="Mover o plano uma posição para a direita">Avançar${icon("right")}</button>
    <button class="btn sm" id="b-scis" type="button" hidden aria-pressed="false">${icon("scissors")}<span>Tesoura</span></button>
    <button class="btn sm" id="b-cut" type="button">${icon("scissors")}<span id="b-cut-t">Cortar aqui</span></button>
    <button class="btn sm" id="b-rm" type="button">${icon("trash")}Remover</button>
    <button class="btn sm ghost" id="b-undo" type="button">${icon("undo")}Desfazer</button>
    <button class="btn sm ghost" id="b-clear" type="button">${icon("x")}Limpar</button>
    <span class="tools-sep" aria-hidden="true"></span>
    <button class="btn sm" id="b-sep" type="button" hidden>${icon("cut")}Separar áudio</button>
    <button class="btn sm" id="b-ant" type="button" hidden>${icon("left")}Som antes</button>
    <button class="btn sm" id="b-dep" type="button" hidden>Som depois${icon("right")}</button>
    <button class="btn sm" id="b-est" type="button" hidden>${icon("right")}Esticar som</button>
    <button class="btn sm" id="b-enc" type="button" hidden>${icon("left")}Encolher som</button>
  </div>
 </div>

 <div class="lab-side">
  <div class="ptabs" role="tablist" aria-label="Painéis do laboratório">
    <button role="tab" id="t-planos" aria-controls="p-planos" aria-selected="true" data-tab="planos">Planos</button>
    <button role="tab" id="t-leitura" aria-controls="p-leitura" aria-selected="false" data-tab="leitura">Descoberta<i class="dot" hidden></i></button>
    <button role="tab" id="t-versoes" aria-controls="p-versoes" aria-selected="false" data-tab="versoes">Aprofundar<b class="cnt" id="cnt-v">0</b></button>
  </div>
  <div class="panels">
    <section class="panel" id="p-planos" role="tabpanel" aria-labelledby="t-planos"></section>
    <section class="panel" id="p-leitura" role="tabpanel" aria-labelledby="t-leitura" hidden></section>
    <section class="panel" id="p-versoes" role="tabpanel" aria-labelledby="t-versoes" hidden></section>
  </div>
 </div>
</div>`;
    this.el=this.root.firstElementChild;
    this.$=s=>$(s,this.el);
    this.player=new CH.SeqPlayer(this.$(".monitor"),{rate:(this.ex&&this.ex.playback_rate)||1,
      onTime:(t,i)=>this.onTime(t,i),onEnd:ok=>this.onEnd(ok),onState:s=>this.onState(s),onCut:i=>{this.nowIdx=i;this.markNow()}});
    this.buildPlanos();this.buildLeitura();this.buildVersoes();
  }

  /* ---------- rascunho (retomar atividade) ---------- */
  restore(){
    const a=CH.store.act(this.exId);
    if(a.draft&&a.draft.seq&&a.draft.seq.length&&a.draft.seq.every(s=>CH.TK[s.id])){
      this.seq=a.draft.seq;this.sel=-1;this.watched=!!a.draft.watched;this.fromVersion=a.draft.from||null;this.aud=JSON.parse(JSON.stringify(a.draft.aud||[]));
      this.resumed=true;
    }
    if(a.versions.length)this.tab="planos";
  }
  saveDraft(){
    clearTimeout(this._sd);
    this._sd=setTimeout(()=>{CH.store.setDraft(this.exId,this.seq.length?{seq:this.seq,aud:this.aud,watched:this.watched,from:this.fromVersion}:null)},250);
  }

  /* ---------- eventos ---------- */
  bind(){
    this.$("#b-play").onclick=()=>this.togglePlay();
    this.$("#b-start").onclick=()=>{this.player.stop();this.t=0;this.seekTo(0);this.setPlayBtn("stopped")};
    this.bindDrop();
    /* toque no vídeo = play/pausa (os botões ficam fora da imagem) */
    this.$(".monitor").addEventListener("click",()=>{if(this.seq.length)this.togglePlay()});
    this.$("#tl-zi").onclick=()=>this.setZoom((this.zoom||1)*1.6);this.$("#tl-zo").onclick=()=>this.setZoom((this.zoom||1)/1.6);
    /* pinça com dois dedos na timeline = zoom */
    { const sc=this.$("#tl-scroll");let d0=0,z0=1;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
      sc.addEventListener("touchstart",e=>{if(e.touches.length===2){d0=dist(e.touches);z0=this.zoom||1}},{passive:true});
      sc.addEventListener("touchmove",e=>{if(e.touches.length===2&&d0){e.preventDefault();this.setZoom(z0*dist(e.touches)/d0)}},{passive:false});
      sc.addEventListener("touchend",()=>{d0=0},{passive:true}) }
    this.$("#b-left").onclick=()=>this.move(-1);
    this.$("#b-right").onclick=()=>this.move(1);
    this.$("#b-cut").onclick=()=>this.cut();
    this.$("#b-rm").onclick=()=>this.remove();
    this.$("#b-undo").onclick=()=>this.undo();
    this.$("#b-clear").onclick=()=>this.clear();
    $$("[data-tab]",this.el).forEach(b=>{b.onclick=()=>this.setTab(b.dataset.tab);b.onkeydown=e=>{
      const tabs=$$("[data-tab]",this.el).filter(x=>!x.hidden&&x.offsetParent!==null),i=tabs.indexOf(b);
      if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const n=tabs[(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length];n.focus();this.setTab(n.dataset.tab)}}});
    this.bindTimeline();
    this._ro=new ResizeObserver(()=>{if(!this.destroyed&&this._lastW!==this.$("#tl-scroll").clientWidth)this.renderTL()});
    this._ro.observe(this.$("#tl-scroll"));
    this._key=e=>{
      if(e.target.closest("input,textarea,select,dialog"))return;
      if(e.key===" "&&e.target===document.body){e.preventDefault();this.togglePlay()}};
    document.addEventListener("keydown",this._key);
  }
  destroy(){document.documentElement.style.removeProperty("--dock-pad");this.destroyed=true;this.saveDraftNow();this.mix&&this.mix.destroy();this.player.destroy();this._ro&&this._ro.disconnect();document.removeEventListener("keydown",this._key);this.closeOverlays&&this.closeOverlays()}
  saveDraftNow(){clearTimeout(this._sd);CH.store.setDraft(this.exId,this.seq.length?{seq:this.seq,aud:this.aud,watched:this.watched,from:this.fromVersion}:null)}

  dockPad(){
    const r=document.documentElement,on=this.tab==="planos"&&!matchMedia("(min-width:1000px)").matches;
    const d=this.$(".dock");r.style.setProperty("--dock-pad",on&&d?d.offsetHeight+"px":"0px");
  }
  setTab(t){
    this.tab=t;this.el.dataset.panel=t;
    ["planos","leitura","versoes"].forEach(k=>{const on=k===t;this.$("#p-"+k).hidden=!on;this.$("#t-"+k).setAttribute("aria-selected",on)});
    if(t==="leitura")this.$("#t-leitura .dot").hidden=true;
    this.dockPad();
  }

  /* ---------- reprodução ---------- */
  togglePlay(){
    if(!this.seq.length)return CH.toast("Adicione ao menos um plano para assistir.");
    const p=this.player;
    if(p.playing){p.pause();return}
    this.readClear();
    p.play(this.t>=p.total-.05?0:this.t);
  }
  onState(s){if(s!=="playing"&&s!=="loading"&&this.mix)this.mix.stop();this.setPlayBtn(s);this.el.classList.toggle("is-playing",s==="playing");this.renderCoach&&this.renderCoach()}
  setPlayBtn(s){
    const b=this.$("#b-play"),t=this.$("#b-play-t"),ic=this.$(".ic-slot",b);
    const m={playing:["pause","Pausar"],loading:["pause","Carregando…"],buffering:["pause","Carregando…"],ended:["play","Assistir de novo"],paused:["play","Assistir"],stopped:["play","Assistir"]};
    const [i,l]=m[s]||m.paused;ic.innerHTML=icon(i);t.textContent=l;b.setAttribute("aria-pressed",s==="playing")
  }
  onTime(t,i){
    this.t=t;this.paintTime(t);if(this.mix)this.mix.sync(this.aud,t,this.player.playing);
    if(this.nowIdx!==i){this.nowIdx=i;this.markNow()}
  }
  paintTime(t){
    const T=this.player.total;
    const s=fmt(t)+" / "+fmt(T);this.$("#tc").textContent=s;const tv=this.$(".mv-tc");if(tv)tv.textContent=s;
    this.placePlayhead(t);
  }
  onEnd(ok){
    if(ok===false){CH.toast("A conexão não deixou todos os planos aparecerem. Assista de novo para valer como visto.");this.setPlayBtn("ended");return}
    this.watched=true;this.saveDraft();this.afterWatch();
  }
  markNow(){$$(".cp",this.el).forEach(c=>c.classList.toggle("now",+c.dataset.i===this.nowIdx&&this.player.playing))}
  seekTo(t){this.mix&&this.mix.stop();
    this.t=Math.max(0,Math.min(this.player.total,t));this.paintTime(this.t);this.player.seek(this.t);
    this.syncSel();
  }
  /* seleciona o clipe sob o playhead e calcula o ponto de corte */
  syncSel(){
    const i=this.player.segAt(this.t);if(i<0){this.sel=-1;return}
    const g=this.player.segs[i];this.sel=i;this.cutAt=Math.min(.95,Math.max(.05,(this.t-g.start)/g.dur));
    this.updateSelUI();
  }

  /* ---------- operações de montagem (mesma lógica do v7) ---------- */
  /* arrastar um plano da biblioteca e soltar na timeline (mouse); no toque, use o + */
  bindDrop(){
    const sc=this.$("#tl-scroll"),lib=this.el;if(!sc||sc._dd)return;sc._dd=1;
    lib.addEventListener("dragstart",e=>{const t=e.target.closest(".take");if(!t)return;e.dataTransfer.setData("text/plain",t.dataset.id);e.dataTransfer.effectAllowed="copy";document.body.classList.add("dragging-take")});
    lib.addEventListener("dragend",()=>{document.body.classList.remove("dragging-take");sc.classList.remove("drop-on")});
    sc.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="copy";sc.classList.add("drop-on")});
    sc.addEventListener("dragleave",()=>sc.classList.remove("drop-on"));
    sc.addEventListener("drop",e=>{e.preventDefault();sc.classList.remove("drop-on");const id=e.dataTransfer.getData("text/plain");if(!id||!CH.TK[id])return;
      const n=this.seq.length;let at=n;
      if(this.lay&&n){const r=sc.getBoundingClientRect(),x=e.clientX-r.left+sc.scrollLeft;at=this.lay.pos.findIndex(p=>x<p.l+p.w/2);if(at<0)at=n}
      this.add(id,true);
      if(at<n&&this.ops&&this.ops().reorder!==false){const it=this.seq.pop();this.seq.splice(at,0,it);this.sel=at;this.changed();this.reseq(true)}
      CH.say("Plano solto na timeline. Posição "+(at+1)+".")});
  }
  add(id,silent){
    if(this.seq.length>=MAXCLIPS)return CH.toast("Cada versão aceita até "+MAXCLIPS+" planos.");
    if(this.noDup()&&this.seq.some(s=>s.id===id))return CH.toast("Esta atividade não permite repetir o mesmo plano.");
    this.push();this.seq.push({id,a:0,b:1});this.changed();
    const last=this.seq.length-1;this.sel=last;this.cutAt=.5;
    this.player.setSeq(this.seq);
    this.t=this.player.segs[last].start;this.player.seek(this.t);
    this.afterChange(true);
    CH.store.act(this.exId).viewed=true;
    if(!silent)CH.say("Plano adicionado à timeline. Posição "+this.seq.length+".");
  }
  move(dir){
    const i=this.sel,j=i+dir;if(i<0||j<0||j>=this.seq.length)return;
    this.push();[this.seq[i],this.seq[j]]=[this.seq[j],this.seq[i]];this.sel=j;this.changed();this.reseq(true);
    CH.say("Plano movido para a posição "+(j+1));
  }
  remove(){
    if(this.sel<0)return;this.push();this.seq.splice(this.sel,1);this.sel=Math.min(this.sel,this.seq.length-1);this.changed();this.reseq(true);
  }
  clear(){if(!this.seq.length)return;this.push();this.seq=[];this.sel=-1;this.t=0;this.changed();this.reseq(true)}
  undo(){if(!this.hist.length)return;const o=JSON.parse(this.hist.pop());this.seq=o.seq;this.sel=o.sel;this.changed();this.reseq(true)}
  cut(){
    const s=this.seq[this.sel];if(!s)return CH.toast("Toque num plano da timeline para selecioná-lo.");
    if(CH.dur(s)<MIN_DUR)return CH.toast("Este trecho é curto demais para cortar.");
    const m=s.a+(s.b-s.a)*this.cutAt;
    if(this.canSplit(s.id)){this.push();this.seq.splice(this.sel,1,{id:s.id,a:s.a,b:m},{id:s.id,a:m,b:s.b});CH.say("Plano dividido em dois.")}
    else if(this.canTrim(s.id)){this.push();s.b=m;CH.say("Plano encurtado até o ponto marcado.")}
    else return CH.toast("Nesta atividade este plano não pode ser cortado.");
    this.changed();this.reseq(true);
  }
  trimTo(i,dur){ /* alça de Saída: nova duração do clipe i (segundos) */
    const s=this.seq[i],d=CH.TK[s.id].d;let nb=s.a+dur/d;nb=Math.max(s.a+.3/d,Math.min(nb,1));s.b=nb;
  }
  trimIn(i,dur){ /* alça de Entrada: corta o começo do clipe i */
    const s=this.seq[i],d=CH.TK[s.id].d;let na=s.b-dur/d;na=Math.min(s.b-.3/d,Math.max(0,na));s.a=na;
  }
  changed(){this.watched=false;this.dirty=true;this.fromVersionChanged=true;this.saveDraft();this.resetReadout&&this.resetReadout()}
  reseq(keepT){
    const t=this.t;this.player.setSeq(this.seq);
    this.t=Math.min(keepT?t:0,this.player.total);
    if(this.sel>=0&&this.seq[this.sel]){const g=this.player.segs[this.sel];this.t=Math.min(g.start+g.dur*this.cutAt,this.player.total)}
    this.player.seek(this.t);this.paintTime(this.t);this.afterChange();
  }
  afterChange(skipSeek){
    this.syncAud();this.renderTL();this.updateButtons();this.renderStepper&&this.renderStepper();this.renderCoach&&this.renderCoach();this.renderVersionsDraft&&this.renderVersionsDraft();this.renderReadout&&this.renderReadout();this.paintProx&&this.paintProx();
    const n=this.seq.length;this.$(".monitor").classList.toggle("empty",!n);
    this.$("#cr").textContent="";
    this.paintCredit();this.dockPad();
  }
  paintCredit(){
    if(!this.seq.length)return;const i=this.sel>=0?this.sel:0,s=this.seq[i],f=CH.data.films[CH.TK[s.id].f]||{};
    this.$("#cr").innerHTML=`Plano ${i+1} de ${this.seq.length}, cena de <i>${esc(f.t||"")}</i>${f.d?`, direção de ${esc(f.d)}`:""}`;
  }

  /* ---------- timeline ---------- */
  layout(){
    const W=this.$("#tl-scroll").clientWidth||320,T=Math.max(this.player.total,.1),pad=2;
    const n=this.seq.length;this.zoom=this.zoom||1;let pps=this.freezePps||(W-pad)/T*this.zoom;
    let widths=this.seq.map(s=>Math.max(MINW,CH.dur(s)*pps));
    let sum=widths.reduce((a,b)=>a+b,0);
    if(!this.freezePps&&this.zoom===1&&sum<W-pad){const k=(W-pad)/sum;widths=widths.map(w=>w*k);sum=W-pad}
    let x=0;const pos=widths.map(w=>{const l=x;x+=w;return{l,w}});
    return{W,total:Math.max(sum,W),pos,pps};
  }
  tToX(t){
    const L=this.lay;if(!L||!L.pos.length)return 0;const i=this.player.segAt(t),g=this.player.segs[i],p=L.pos[i];
    if(i<0||!g||!p)return 0;
    return p.l+Math.max(0,Math.min(1,(t-g.start)/g.dur))*p.w;
  }
  xToT(x){
    const L=this.lay;if(!L||!L.pos.length)return 0;
    let i=L.pos.findIndex(p=>x<p.l+p.w);if(i<0)i=L.pos.length-1;const p=L.pos[i],g=this.player.segs[i];
    return g.start+Math.max(0,Math.min(1,(x-p.l)/p.w))*g.dur;
  }
  setZoom(z){this.zoom=Math.max(1,Math.min(6,z));this.renderTL();const sc=this.$("#tl-scroll");if(sc&&this.lay)sc.scrollLeft=Math.max(0,this.tToX(this.t)-sc.clientWidth/2);const f=this.$("#tl-zo"),g=this.$("#tl-zi");if(f)f.disabled=this.zoom<=1;if(g)g.disabled=this.zoom>=6}
  renderTL(){
    const box=this.$("#tl-inner");if(!box)return;
    this._lastW=this.$("#tl-scroll").clientWidth;
    if(!this.seq.length){
      box.style.width="100%";box.innerHTML=`<div class="tl-empty"><span class="strip"><i></i><i class="on"></i><i></i><i></i></span><p>A timeline começa vazia.<br>Toque em <b>+</b> num plano para colocá-lo aqui.</p></div>`;
      this.lay=null;this.$("#tl-dur").textContent="00:00.0";this.$("#tl-hint").textContent="";return;
    }
    const L=this.lay=this.layout();box.style.width=L.total+"px";
    const T=this.player.total;
    /* régua */
    const step=T>60?10:T>24?5:T>10?2:1;let rul="";
    const segs=this.player.segs;
    for(let s=0;s<=T+1e-6;s+=step){rul+=`<i class="tk" style="left:${this.tToX(Math.min(s,T-1e-6))}px"><b>${Math.round(s)}s</b></i>`}
    /* faixa de vídeo + áudio silenciado */
    let v="",a="";
    this.seq.forEach((s,i)=>{
      const tk=CH.TK[s.id],p=L.pos[i],d=CH.dur(s),f=tk.f;
      const trim=this.canTrim(s.id)&&i===this.sel,lab=CH.cardLabel(this.exId,s.id);
      v+=`<button type="button" class="cp${i===this.sel?" act":""}" data-i="${i}" data-film="${f}" style="left:${p.l}px;width:${p.w}px;--fc:var(--f-${f});background-image:url(${tk.th})" aria-label="Plano ${i+1}: ${esc(lab)}, ${d.toFixed(1)} segundos${i===this.sel?", selecionado":""}" aria-pressed="${i===this.sel}">
        <span class="cp-n">${i+1}</span><span class="cp-l">${esc(lab)}</span><span class="cp-d mono">${d.toFixed(1)}s</span></button>`;
      a+=`<div class="cp au" style="left:${p.l}px;width:${p.w}px" aria-hidden="true">${wave(s)}</div>`;
      if(i<this.seq.length-1)v+=`<i class="cutmark" style="left:${p.l+p.w}px" aria-hidden="true"></i>`;
    });
    let hdl="";
    if(this.sel>=0&&this.canHandle(this.seq[this.sel].id)){
      const p=L.pos[this.sel],q=this.seq[this.sel],dd=CH.dur(q),mx=CH.TK[q.id].d.toFixed(1);
      hdl=`<button type="button" class="trim-h in" data-side="in" role="slider" style="left:${p.l}px" aria-label="Entrada do plano ${this.sel+1}: arraste para cortar o começo" aria-valuemin="0.3" aria-valuemax="${mx}" aria-valuenow="${dd.toFixed(1)}" aria-valuetext="${dd.toFixed(1)} segundos"><i></i></button>`
        +`<button type="button" class="trim-h out" data-side="out" role="slider" style="left:${p.l+p.w}px" aria-label="Saída do plano ${this.sel+1}: arraste para cortar o final" aria-valuemin="0.3" aria-valuemax="${mx}" aria-valuenow="${dd.toFixed(1)}" aria-valuetext="${dd.toFixed(1)} segundos"><i></i></button>`;
    }
    const cutL=this.sel>=0?`<i class="cutline-v" style="left:${L.pos[this.sel].l+L.pos[this.sel].w*this.cutAt}px"></i>`:"";
    box.innerHTML=`<div class="tl-ruler" aria-hidden="true">${rul}</div><div class="tl-row vid">${v}${hdl}</div><div class="tl-row aud">${a}</div>${cutL}<i class="tl-ph" id="tl-ph"><b></b></i>`;
    this.$("#tl-dur").textContent=fmt(T);
    this.$("#tl-hint").textContent=this.sel>=0?(this.canHandle(this.seq[this.sel].id)?"Arraste a barra verde ou a vermelha para encurtar o plano":""):"Toque num plano para selecionar";
    this.paintRange();this.placePlayhead(this.t);
    this.nowIdx=-1;
  }
  paintRange(){
    const a=this.$("#tl-a"),b=this.$("#tl-b");if(!a||!b)return;
    let st=0,en=this.player.total;
    if(this.sel>=0&&this.seq[this.sel]){st=0;for(let k=0;k<this.sel;k++)st+=CH.dur(this.seq[k]);en=st+CH.dur(this.seq[this.sel])}
    a.textContent=fmt(st);b.textContent=fmt(en);
  }
  placePlayhead(t){
    const ph=this.$("#tl-ph");if(!ph||!this.lay)return;
    const x=this.tToX(t);ph.style.transform=`translateX(${x}px)`;
    if(this.player.playing&&!this.av){const sc=this.$("#tl-scroll"),vis=sc.scrollLeft,W=sc.clientWidth;if(x>vis+W-24||x<vis)sc.scrollLeft=Math.max(0,x-W*.3)}
  }
  updateSelUI(){
    $$(".cp:not(.au)",this.el).forEach(c=>{const on=+c.dataset.i===this.sel;c.classList.toggle("act",on);c.setAttribute("aria-pressed",on)});
    const cl=this.$(".cutline-v");if(this.lay&&this.sel>=0){const p=this.lay.pos[this.sel];
      if(cl)cl.style.left=(p.l+p.w*this.cutAt)+"px";else this.renderTL()}
    this.paintRange();this.updateButtons();this.paintCredit();
  }
  bindTimeline(){
    const sc=this.$("#tl-scroll");let drag=null,trim=null;
    const xOf=e=>{const r=this.$("#tl-inner").getBoundingClientRect();return e.clientX-r.left};
    sc.addEventListener("pointerdown",e=>{
      if(!this.seq.length)return;
      const th=e.target.closest(".trim-h");
      if(th){trim={i:this.sel,side:th.dataset.side||"out",x0:e.clientX,d0:CH.dur(this.seq[this.sel]),pps:this.lay.pps,moved:false};this.freezePps=this.lay.pps;sc.setPointerCapture(e.pointerId);e.preventDefault();this.player.pause();return}
      drag={x0:e.clientX,moved:false};sc.setPointerCapture(e.pointerId);
      this.player.pause();this.scrub(xOf(e));
    });
    sc.addEventListener("pointermove",e=>{
      if(trim){
        const dx=e.clientX-trim.x0;
        if(!trim.moved){if(Math.abs(dx)<3)return;trim.moved=true;this.push()}
        if(trim.side==="in")this.trimIn(trim.i,Math.max(.3,trim.d0-dx/trim.pps));else this.trimTo(trim.i,Math.max(.3,trim.d0+dx/trim.pps));
        this.watched=false;this.player.setSeq(this.seq);this.renderTL();
        const g=this.player.segs[trim.i];this.t=trim.side==="in"?g.start:Math.max(g.start,g.start+g.dur-.05);this.paintTime(this.t);
        return}
      if(!drag)return;if(Math.abs(e.clientX-drag.x0)>4)drag.moved=true;
      this.scrub(xOf(e));
    });
    const up=e=>{
      if(trim){this.freezePps=0;if(trim.moved){this.changed();this.reseq(true);CH.say("Plano encurtado para "+CH.dur(this.seq[trim.i]).toFixed(1)+" segundos")}trim=null;return}
      if(drag){this.syncSel();this.renderTL();this.updateButtons();drag=null}
    };
    sc.addEventListener("pointerup",up);sc.addEventListener("pointercancel",up);
    /* teclado: setas movem o ponto de leitura; trim-h tem setas próprias */
    sc.addEventListener("keydown",e=>{
      const th=e.target.closest(".trim-h");
      if(th&&(e.key==="ArrowLeft"||e.key==="ArrowRight")){e.preventDefault();const s=this.seq[this.sel];this.push();this.trimTo(this.sel,CH.dur(s)+(e.key==="ArrowRight"?.1:-.1)*(e.shiftKey?10:1));this.changed();this.reseq(true);const n=this.$(".trim-h");n&&n.focus();return}
      if(e.target.classList&&e.target.classList.contains("cp")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();this.selectClip(+e.target.dataset.i);return}
      if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
        if(!this.seq.length)return;e.preventDefault();this.player.pause();
        this.seekTo(this.t+(e.key==="ArrowRight"?1:-1)*(e.shiftKey?1:.1));this.renderTL();
      }
    });
  }
  scrub(x){
    const t=this.xToT(x);this.t=t;this.paintTime(t);
    if(this._scr)return;this._scr=requestAnimationFrame(()=>{this._scr=0;this.player.seek(this.t)});
    const i=this.player.segAt(t);if(i!==this.sel){this.sel=i;this.updateSelUI()}
    const g=this.player.segs[i];if(g)this.cutAt=Math.min(.95,Math.max(.05,(t-g.start)/g.dur));
  }
  selectClip(i){
    this.player.pause();const g=this.player.segs[i];if(!g)return;this.sel=i;this.cutAt=.5;this.t=g.start+g.dur*.5;this.player.seek(this.t);this.paintTime(this.t);this.renderTL();this.updateButtons();this.paintCredit();
  }

  updateButtons(){
    const n=this.seq.length,s=this.sel>=0?this.seq[this.sel]:null;
    this.$("#b-play").disabled=!n;this.$("#b-start").disabled=!n;
    this.$("#b-left").disabled=!s||this.sel<1;this.$("#b-right").disabled=!s||this.sel>=n-1;
    const can=s&&(this.canSplit(s.id)||this.canTrim(s.id));
    const bc=this.$("#b-cut");bc.disabled=!s||!can;
    this.$("#b-cut-t").textContent=s&&!this.canSplit(s.id)&&this.canTrim(s.id)?"Aparar até aqui":"Cortar aqui";
    bc.title=s&&!can?"Nesta atividade este plano não pode ser cortado.":"";
    this.$("#b-rm").disabled=!s;this.$("#b-undo").disabled=!this.hist.length;this.$("#b-clear").disabled=!n;
    const ops=this.ops();
    /* esconde ferramentas que a atividade não oferece */
    this.$("#b-cut").hidden=!(ops.trim&&ops.trim.enabled)&&!(ops.split&&ops.split.enabled);
    this.$("#b-left").hidden=this.$("#b-right").hidden=!ops.reorder;
    this.$("#b-rm").hidden=!ops.remove;
    this.$("#tools").hidden=!n;
  }
  refresh(){
    this.player.setSeq(this.seq);this.t=0;
    this.afterChange();this.setTab(this.tab);
    if(this.seq.length){this.sel=0;this.player.seek(0);this.updateSelUI()}
    this._mq=matchMedia("(min-width:1000px)");this._mq.addEventListener&&this._mq.addEventListener("change",()=>this.dockPad());
    if(this.resumed)CH.toast("Retomamos de onde você parou.");
  }
}

/* forma de onda (faixa A1 silenciada) — dado `pk` do v7 */
function wave(s){
  const p=CH.TK[s.id].pk||[];if(!p.length)return"";
  let o='<svg preserveAspectRatio="none" viewBox="0 0 96 20">';
  for(let k=0;k<32;k++){const v=(p[Math.min(p.length-1,Math.floor((s.a+(s.b-s.a)*k/32)*p.length))]||6)/100,hh=2+16*v;o+=`<rect x="${k*3}" y="${10-hh/2}" width="1.6" height="${hh}" rx=".8"/>`}
  return o+"</svg>";
}
CH.Lab=Lab;CH.labWave=wave;
})();
