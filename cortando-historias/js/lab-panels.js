/* lab-panels.js — painéis do Laboratório.
   Caminho essencial: VER → MONTAR → ASSISTIR → DESCOBRIR (automático, sem depender de texto digitado).
   Aprofundamento (opcional): COMPARAR, EXPERIMENTAR, VERSÕES, ANOTAR.
   Usa o motor (Engine) e as leituras (Leituras) SEM alterá-los. */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,fmt,icon}=CH,Lab=CH.Lab,P=Lab.prototype;
const STEPS=[["ver","Ver"],["montar","Montar"],["assistir","Assistir"],["descobrir","Descobrir"]];
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
const nomeBonito=n=>cap(String(n||"").replace(/\s*\(.*\)\s*/,""));
const SIT_ICON={proposta:"frame",outro_efeito:"compare",diferente:"ring",falta:"half",quebra:"cut",incompleta:"plus"};

/* ============ referência (uma maneira possível de realizar a proposta — derivada do motor) ============ */
const REF={};
REF.EX_BROLL_001=[{id:"NZ_130",a:0,b:1},{id:"NZ_016",a:0,b:1},{id:"NZ_021",a:0,b:1}];
CH.referenceSeq=function(exId){
  if(exId in REF)return REF[exId];
  const ex=CH.EXF[exId];let found=null;
  if(ex&&exId!==CH.LIVRE){
    const c=[];
    ex.evaluation.pair_catalog.filter(p=>p.class==="valid"&&p.a!==p.b).forEach(p=>c.push([{id:p.a,a:0,b:1},{id:p.b,a:0,b:1}]));
    const sp=ex.operations.split;if(sp&&sp.enabled)(sp.takes||[]).forEach(t=>c.push([{id:t,a:0,b:.12},{id:t,a:.6,b:.72}]));
    for(const s of c){
      if(!s.every(x=>CH.TK[x.id]))continue;
      try{const r=Engine.classifyVersion(ex,CH.clipsOf(s));if(r.class==="valid"&&r.matched_targets.length){found=s;break}}catch(e){}
    }
  }
  return REF[exId]=found;
};
/* Enquanto a técnica não foi "descoberta", o texto não pode entregar o nome (ação → resultado → observação → NOMEAÇÃO). */
CH.neutral=function(t){
  if(!t)return t;
  const N="jump cut|elipse|plano\\/contraplano|match cut|efeito Kuleshov|corte na ação|cutaway";
  let x=String(t)
    .replace(new RegExp("\\s*[—–-]\\s*(isso é|é assim que o) (um |uma |o |a )?("+N+")( funciona)?\\.?","gi"),".")
    .replace(new RegExp("\\s*Isso é (um |uma )?("+N+")\\.","gi"),"")
    .replace(/\bdo corte na ação\b/gi,"desse tipo de corte")
    .replace(/\bo corte na ação\b/gi,"esse tipo de corte")
    .replace(/\bo match cut\b/gi,"a ligação entre as imagens")
    .replace(/\.\./g,".").trim();
  return x.replace(/(^|[.!?]\s+)([a-zà-ú])/g,(m,a,b)=>a+b.toUpperCase());
};
CH.readSeq=function(exId,seq){
  if(CH.NOVAS[exId])return CH.novas.read(exId,seq,CH.labInstance&&CH.labInstance.aud);
  const ex=CH.EXF[exId],clips=CH.clipsOf(seq);
  const r=Engine.classifyVersion(ex,clips);
  const L=Leituras.pick(CH.data.leituras,exId,clips,r,id=>CH.cardLabel(exId,id));
  return{clips,r,L};
};
function nextAfter(exId){
  const flat=CH.allActs(),i=flat.indexOf(exId);
  return flat.slice(i+1).find(x=>CH.progress(x).nivel<2)||flat.find(x=>CH.progress(x).nivel<2)||null;
}

/* ============ trilha (Ver, Montar, Assistir, Descobrir) ============ */
P.stepState=function(){
  const a=CH.store.act(this.exId),nv=a.versions.length;
  const disc=CH.progress(this.exId).nivel>=2;
  return{ver:!!a.viewed||this.seq.length>0||nv>0,montar:this.seq.length>0||nv>0,assistir:this.watched||nv>0||!!a.watchedOnce,descobrir:disc};
};
P.renderChips=function(){};
P.renderStepper=function(){
  const ol=this.$("#stepper");if(!ol)return;
  const s=this.stepState();let cur=STEPS.findIndex(([k])=>!s[k]);if(cur<0)cur=STEPS.length;
  ol.innerHTML=STEPS.map(([k,l],i)=>`<li class="st ${s[k]?"done":i===cur?"now":""}" ${i===cur?'aria-current="step"':""}><span class="n">${s[k]?icon("check"):i+1}</span><span class="l">${l}</span><span class="sr">${s[k]?", feito":i===cur?", etapa atual":""}</span></li>`).join("")+`<li class="st opt"><span class="l">Aprofundar</span><span class="sr">, opcional</span></li>`;
};

/* ============ primeira atividade = tutorial do laboratório ============ */
P.isTutorial=function(){return !this.free&&!CH.store.tutDone()&&this.exId===CH.allActs()[0]};
P.renderCoach=function(){
  const c=this.$("#coach");if(!c)return;
  if(!this.isTutorial()){c.hidden=true;return}
  const n=this.seq.length,w=this.watched||this.player.playing;
  let step,t,d,btn="";
  if(!n){step=1;t="Escolha um plano";d="Em Planos, toque num plano para vê-lo inteiro. Depois toque em + para colocá-lo na timeline."}
  else if(n===1){step=2;t="Coloque outro plano depois";d="Agora escolha a imagem que o homem parece estar olhando. Ela entra depois dele."}
  else if(!w){step=3;t="Toque em Assistir";d="A timeline passa da esquerda para a direita. O que você vê quando um plano encontra o outro?"}
  else{step=4;t="Veja o que você descobriu";d="A descoberta apareceu. Para trocar um plano, toque nele na timeline e use Mover ou Remover. Tudo fica guardado sozinho.";btn=`<button class="btn sm ink" type="button" data-coach-ok>Entendi</button>`}
  c.hidden=false;
  c.innerHTML=`<span class="coach-dots" aria-hidden="true">${[1,2,3,4].map(k=>`<i class="${k<=step?"on":""}"></i>`).join("")}</span><div class="coach-tx"><b>${step} de 4, ${esc(t)}</b><span>${esc(d)}</span></div>${btn}`;
  const b=$("[data-coach-ok]",c);if(b)b.onclick=()=>{CH.store.setTutDone();this.renderCoach();CH.toast("Pronto. Você já sabe usar o laboratório.")};
};

/* ============ PLANOS (VER) ============ */
P.buildPlanos=function(){
  const p=this.$("#p-planos");
  p.innerHTML=`
  <div class="pl-head">${this.free?`<div class="seg" role="group" aria-label="Origem dos planos">
    <button type="button" data-lt="pool" aria-pressed="${this.libTab==="pool"}">Seleção</button>
    <button type="button" data-lt="all" aria-pressed="${this.libTab==="all"}">Todos os filmes</button></div>`:""}<span class="tag g" id="pl-count"></span></div>
  <label class="film-f" id="film-wrap" hidden><span class="sr">Filtrar por filme</span><select id="film"></select></label>
  <p class="hint" id="pl-hint"></p>
  <ul class="lib" id="lib"></ul>`;
  const sel=this.$("#film");
  sel.innerHTML='<option value="ALL">Todos os filmes</option>'+Object.entries(CH.data.films).map(([k,v])=>`<option value="${k}">${esc(v.t)}</option>`).join("");
  sel.onchange=()=>{this.film=sel.value;this.renderLibrary()};
  $$("[data-lt]",p).forEach(b=>b.onclick=()=>{this.libTab=b.dataset.lt;this.renderLibrary()});
  p.addEventListener("click",e=>{
    const li=e.target.closest(".take");if(!li)return;
    if(e.target.closest("[data-add]"))this.add(li.dataset.id);
    else if(e.target.closest("[data-ver]"))this.preview(li.dataset.id);
  });
  this.renderLibrary();
};
P.takeLabel=function(id){const l=this.libTab==="pool"&&CH.EXF[this.exId].card_labels[id];return l||id};
P.renderLibrary=function(){
  const p=this.$("#p-planos");
  $$("[data-lt]",p).forEach(b=>b.setAttribute("aria-pressed",b.dataset.lt===this.libTab));
  this.$("#film-wrap").hidden=this.libTab!=="all";
  const ids=this.libTab==="pool"?this.act.pool:CH.data.takes.filter(t=>this.film==="ALL"||t.f===this.film).map(t=>t.id);
  const list=ids.filter(i=>CH.TK[i]);
  list.sort((a,b)=>{const na=parseInt(String(CH.cardLabel(this.exId,a)).replace(/\D/g,""),10),nb=parseInt(String(CH.cardLabel(this.exId,b)).replace(/\D/g,""),10);return this.libTab==="pool"&&!isNaN(na)&&!isNaN(nb)?na-nb:0});
  this.$("#pl-count").textContent=list.length+" planos";
  this.$("#pl-hint").textContent=this.libTab==="pool"
    ? "Toque na imagem para ver o plano inteiro. Toque em + para colocá-lo na timeline."
    : (this.free?"Planos de todos os filmes do projeto. Combine como quiser.":"Estes planos não fazem parte desta atividade. Você pode experimentar, mas a atividade só avalia os planos dela.");
  this.$("#lib").innerHTML=list.map(id=>{
    const t=CH.TK[id],lab=this.takeLabel(id);
    return `<li class="take" draggable="true" data-id="${id}" data-film="${t.f}" style="--fc:var(--f-${t.f})">
      <button type="button" class="take-thumb" data-ver aria-label="Ver ${esc(lab)} inteiro, ${t.d.toFixed(1)} segundos${t.vid?"":" (sem vídeo)"}">
        <img src="${t.th}" alt="" loading="lazy" width="160" height="${t.ar==="4:3"?120:90}">
        <span class="pbadge">${icon("play")}</span><span class="dur mono">${t.d.toFixed(1)}s</span>${t.vid?"":'<span class="novid">sem vídeo</span>'}
      </button>
      <button type="button" class="take-add" data-add aria-label="Adicionar ${esc(lab)} à timeline">${icon("plus")}</button>
      <div class="take-meta"><b>${esc(lab)}</b><small>${esc(CH.desc(t))}</small></div>
    </li>`}).join("");
};

/* pré-visualização: vídeo REAL do take inteiro (controles próprios, sem som) */
P.preview=function(id){
  const t=CH.TK[id],f=CH.data.films[t.f]||{},lab=this.takeLabel(id);
  CH.store.act(this.exId).viewed=true;CH.store.save();this.renderStepper();this.renderCoach();
  const dlg=h("dialog.pv",{"aria-labelledby":"pv-t"});
  dlg.innerHTML=`<div class="pv-in">
    <div class="pv-head"><div><span class="eyebrow">Plano inteiro, ${t.d.toFixed(1)} s</span><h2 class="h3" id="pv-t">${esc(lab)}</h2><p class="muted pv-s">${esc(CH.desc(t))}, cena de <i>${esc(f.t||"")}</i>${f.d?`, direção de ${esc(f.d)}`:""}</p></div>
      <button class="btn ghost sm icon-only" type="button" data-x aria-label="Fechar">${icon("x")}</button></div>
    <div class="monitor pv-mon" style="--ar:${CH.ratioCss(t.ar||"16:9")}">${t.vid&&CH.webm?`<video class="pv-v" src="${CH.vurl(t)}" muted playsinline preload="auto" poster="${t.th}" aria-label="Vídeo: ${esc(lab)}"></video>`:`<img class="pv-v" src="${t.th}" alt=""><p class="mv-note">${CH.webm?"Este plano não tem arquivo de vídeo — mostramos só um quadro.":"Este aparelho não reproduz os formatos de vídeo do laboratório."}</p>`}</div>
    <div class="pv-ctl"><button class="btn ink sm" type="button" data-pp>${icon("play")}<span>Reproduzir</span></button><input type="range" min="0" max="${t.d}" step="0.05" value="0" aria-label="Posição no plano" ${t.vid?"":"disabled"}><span class="mono tnum pv-tc">00:00.0</span></div>
    <div class="pv-act"><button class="btn pri" type="button" data-add>${icon("plus")}Adicionar à montagem</button><button class="btn ghost" type="button" data-x>Fechar</button></div>
  </div>`;
  document.body.append(dlg);
  const v=$("video.pv-v",dlg),rng=$("input",dlg),tc=$(".pv-tc",dlg),pp=$("[data-pp]",dlg);
  const setpp=on=>{pp.innerHTML=icon(on?"pause":"play")+"<span>"+(on?"Pausar":"Reproduzir")+"</span>"};
  if(v){
    v.muted=true;
    pp.onclick=()=>v.paused?v.play():v.pause();
    v.onplay=()=>setpp(true);v.onpause=()=>setpp(false);v.onended=()=>setpp(false);
    v.ontimeupdate=()=>{rng.value=v.currentTime;tc.textContent=fmt(v.currentTime)};
    rng.oninput=()=>{v.currentTime=+rng.value};
    v.onclick=()=>pp.click();
    v.play().catch(()=>{});
  }else{pp.disabled=true}
  const close=()=>{v&&v.pause();dlg.close()};
  dlg.addEventListener("click",e=>{if(e.target===dlg||e.target.closest("[data-x]"))close();if(e.target.closest("[data-add]")){close();this.add(id)}});
  dlg.addEventListener("close",()=>{dlg.remove()});
  dlg.showModal();
  (this.overlays=this.overlays||[]).push(dlg);
};
P.closeOverlays=function(){(this.overlays||[]).forEach(d=>{try{d.open&&d.close()}catch(e){}d.remove()});this.overlays=[]};

/* ============ DESCOBERTA (depois de assistir) ============ */
P.buildLeitura=function(){
  this.$("#p-leitura").innerHTML=`<div id="rd-body"></div>`;
  this.$("#p-leitura").addEventListener("click",e=>{
    if(e.target.closest("[data-play]"))this.togglePlay();
    if(e.target.closest("[data-ref]"))this.openCompare("draft","ref");
    if(e.target.closest("[data-tab-v]"))this.setTab("versoes");
    if(e.target.closest("[data-tab-p]")){this.setTab("planos");const n=this.$("#b-play");n&&n.focus()}
    const b=e.target.closest("[data-note-disc]");if(b)this.noteDiscovery(b.dataset.noteDisc);
  });
};
P.resetReadout=function(){this.read=null;this.renderReadout&&this.renderReadout()};
P.readClear=function(){};
P.onEndExtra=function(){};
P.afterWatch=function(){
  if(!this.seq.length)return;
  if(CH.proximidade(this.exId,this.seq)<100)this._tries=(this._tries||0)+1;
  const a=CH.store.act(this.exId);a.watchedOnce=true;CH.store.save();
  try{CH.praticou&&CH.praticou();setTimeout(()=>CH.evoCheck&&CH.evoCheck(),2200)}catch(e){}
  this.computeRead();
  if(this.read&&this.read.L&&this.read.L.situacao==="proposta"&&this.read.L.nome)this.revealDiscovery();
  this.paintProx&&this.paintProx();this.renderReadout();this.renderStepper();this.renderCoach();this.renderVersionsDraft();this.renderVersionList&&this.renderVersionList();this.renderProgress&&this.renderProgress();
  const dot=this.$("#t-leitura .dot");if(this.tab!=="leitura")dot.hidden=false;
  this.setTab("leitura");
  requestAnimationFrame(()=>{const t=this.$("#t-leitura");if(t&&!matchMedia("(min-width:1000px)").matches)t.scrollIntoView({behavior:CH.reduced()?"auto":"smooth",block:"start"})});
  CH.say("Montagem assistida. "+(this.read&&this.read.disc?"Você fez uma descoberta.":"Veja o que sua montagem faz."));
};
P.computeRead=function(){
  if(this.free){this.read={free:true};return}
  try{
    const {clips,r,L}=CH.readSeq(this.exId,this.seq);
    this.read={clips,r,L,pairs:this.pairFx(this.seq)};
  }catch(err){console.warn(err);this.read={error:true}}
};
P.pairFx=function(seq){
  const fx=this.act.fx||{},o=[];
  for(let i=0;i<seq.length-1;i++){const e=fx[seq[i].id+"→"+seq[i+1].id];if(e)o.push({i,text:e})}
  return o;
};
/* descobrir = consequência da AÇÃO. Registra o experimento (automático, sem texto obrigatório) e revela o nome. */
P.revealDiscovery=function(){
  const R=this.read,L=R.L,a=CH.store.act(this.exId);
  const last=a.versions[a.versions.length-1],same=last&&JSON.stringify(last.seq)===JSON.stringify(this.seq);
  let auto=false;
  const meta={cls:R.r.class,matched:R.r.matched_targets,situacao:L.situacao,titulo:L.titulo,nome:L.nome,porque:L.por_que||null};
  if(!same){
    const v=CH.store.addVersion(this.exId,Object.assign({seq:JSON.parse(JSON.stringify(this.seq)),clips:CH.clipsOf(this.seq),reflection:"",dur:CH.total(this.seq),from:this.fromVersion||null,auto:true,aud:JSON.parse(JSON.stringify(this.aud))},meta));
    this.fromVersion=v.id;auto=true;this.dirty=false;this.saveDraftNow();
  }else if(!last.nome){Object.assign(last,meta);CH.store.save()}
  const isNew=CH.store.discover(L.nome,this.exId);
  const before=CH.progress(this.exId).done;
  const done=this.completionCheck();
  this.read.disc={nome:L.nome,isNew,auto};
  this.cnt();
  CH.toast(isNew?"Descoberta revelada: "+nomeBonito(L.nome):auto?"Experimento registrado.":"Você reencontrou: "+nomeBonito(L.nome),3400);
  if(done&&!before)setTimeout(()=>CH.toast("Você aprofundou esta atividade.",3000),3500);
};
P.cnt=function(){const n=CH.store.act(this.exId).versions.length;const c=this.$("#cnt-v");if(c)c.textContent=n};
P.prompts=function(clips,r){
  if(this.nv)return[];
  const ex=this.ex,a=CH.store.act(this.exId);
  try{
    const others=a.versions.filter(v=>JSON.stringify(v.seq)!==JSON.stringify(this.seq)).map(v=>({clips:v.clips,reflection:v.reflection}));
    const comp=Engine.checkCompletion(ex,[...a.versions.map(v=>v.clips)]);
    const qa=ex.question&&a.answer?{[ex.question.id]:a.answer}:null;
    const fb=Engine.feedback({exercise:ex,version:clips,result:r,otherVersions:others,reflection:"",questionAnswers:qa,completion:comp});
    return fb.filter(f=>f.kind==="on_validate"||f.kind==="after_completion"||f.kind==="system");
  }catch(err){console.warn(err);return[]}
};
P.renderReadout=function(){
  const body=this.$("#rd-body");if(!body)return;
  const dd=CH.didatica(this.exId);
  if(!this.seq.length){body.innerHTML=this.emptyRead("Comece escolhendo planos","Monte uma sequência na timeline. O que ela faz aparece depois que você assistir.",false);return}
  if(!this.watched||!this.read){body.innerHTML=this.emptyRead("Agora, assista","A leitura só aparece depois que você vê o resultado: primeiro a percepção, depois o nome.",true,dd.observe);return}
  const R=this.read;
  if(R.error){body.innerHTML=`<div class="rd-card"><p>Não foi possível ler esta montagem agora.</p></div>`;return}
  if(R.free){body.innerHTML=this.freeRead();return}
  if(R.disc){body.innerHTML=this.discoveryHTML();this.afterDiscoveryPaint();return}
  const {L,r,clips}=R,a=CH.store.act(this.exId);
  const open=Object.values(CH.store.discoveries()).some(d=>(d.ex||[d.exId]).includes(this.exId));
  const mk=t=>open?t:CH.neutral(t);
  const prompts=this.prompts(clips,r);
  const outro=L.situacao==="outro_efeito"||L.situacao==="diferente";
  const tagTxt=outro?"Exploração diferente":L.situacao==="proposta"?"Descoberta":"Ainda não aconteceu";
  body.innerHTML=`
  <article class="rd-card s-${L.situacao}">
    <span class="tag ${outro?"w":"g"}">${icon(SIT_ICON[L.situacao]||"ring")}${tagTxt}</span>
    <h2 class="h3">${esc(L.titulo)}</h2>
    <p class="rd-o">${esc(mk(L.o_que||""))}</p>${L.por_que?`<p class="rd-p">${esc(mk(L.por_que))}</p>`:""}
    ${outro?`<p class="rd-e"><b>Você encontrou outra possibilidade.</b> Ela funciona como experiência, mas não é o efeito que esta atividade investiga. Para chegar nele: ${esc((dd.faca||"").replace(/\.$/,""))}.</p>`
      :L.situacao==="proposta"?"":`<p class="rd-e"><b>Observe:</b> ${esc(dd.observe||"")}</p>`}
    ${L.experimente?`<p class="rd-p"><b>Experimente:</b> ${esc(mk(L.experimente))}</p>`:""}
  </article>
  ${R.pairs&&R.pairs.length?`<div class="rd-block"><span class="eyebrow">O que essa passagem pode fazer sentir</span><ul class="rd-pairs">${R.pairs.map(p=>`<li><span class="mono">Plano ${p.i+1} → ${p.i+2}</span><em>${esc(p.text)}</em></li>`).join("")}</ul></div>`:""}
  ${prompts.length?`<div class="rd-block"><span class="eyebrow">Repare</span><ul class="rd-prompts">${prompts.map(f=>`<li>${esc(mk(f.text).replace(/^Repare:\s*/i,""))}</li>`).join("")}</ul></div>`:""}
  ${this.contrastLink()}
  <div class="rd-block rd-actions">
    <button class="btn ink" type="button" data-tab-p>${icon("plus")}Mudar a montagem</button>
    ${CH.referenceSeq(this.exId)?`<button class="btn sm ghost" type="button" data-ref>${icon("compare")}Comparar com uma referência</button>`:""}
  </div>`;
};
P.emptyRead=function(t,d,btn,obs){
  return `<div class="rd-empty"><span class="strip"><i></i><i class="on"></i><i></i><i></i></span><h2 class="h3">${esc(t)}</h2><p class="muted">${esc(d)}</p>${obs?`<p class="rd-e"><b>Observe:</b> ${esc(obs)}</p>`:""}${btn&&this.seq.length?`<button class="btn ink lg" type="button" data-play>${icon("play")}Assistir agora</button>`:""}</div>`;
};
P.freeRead=function(){
  const seq=this.seq,T=CH.total(seq),films=[...new Set(seq.map(s=>CH.TK[s.id].f))];
  const sug=[];
  if(seq.length===1)sug.push("Adicione um segundo plano. O que um plano faz com o outro?");
  else{sug.push("Troque a ordem de dois planos e assista de novo. O que muda?");sug.push("Tire um plano. A história ainda se entende?");sug.push("Encurte um plano. Como o ritmo muda?")}
  return `<article class="rd-card s-free"><span class="tag w">${icon("ring")}Laboratório livre</span><h2 class="h3">Sem certo ou errado</h2>
    <p class="rd-o">${seq.length} ${seq.length===1?"plano":"planos"}, ${T.toFixed(1)} s, ${Math.max(0,seq.length-1)} ${seq.length===2?"corte":"cortes"}${films.length>1?`, ${films.length} filmes diferentes`:""}.</p>
    <p class="rd-p">O sentido é você quem decide. Descreva o que percebeu em uma frase: é assim que uma montagem vira autoria.</p></article>
    <div class="rd-block"><span class="eyebrow">Experimente</span><ul class="rd-prompts">${sug.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
    <div class="autoria"><b>Você não aprendeu uma receita.</b><span>Aprendeu a perceber o que muda quando você corta. Agora, as escolhas começam a ser suas.</span></div>
    <div class="rd-block rd-actions"><button class="btn ink" type="button" data-tab-v>${icon("save")}Guardar esta versão</button></div>`;
};
P.contrastLink=function(){
  if(!["EX_JUMPCUT_NL01","EX_ELIPSE_NL01","EX_CORTE_002"].includes(this.exId))return"";
  return `<a class="note-link" href="#/contraste"><span class="eyebrow">Para sentir a diferença</span><b>Dois cortes, dois efeitos</b><span>Veja duas montagens lado a lado e diga o que percebeu.</span></a>`;
};

/* ---- momento de descoberta ---- */
P.discoveryHTML=function(){
  const R=this.read,L=R.L,D=R.disc,dd=CH.didatica(this.exId),ato=CH.atoDe(this.exId),nx=nextAfter(this.exId);
  const conc=CH.conceitoPorNome(L.nome),cor=ato?ato.cor:"#c8a020";
  let special="";
  if(dd.kuleshov)special=this.kuleshovBlock();
  else if(dd.emenda)special=`<div class="seam" id="seam"><p class="eyebrow">A emenda</p><div class="seam-row"><figure><canvas width="320" height="180"></canvas><figcaption class="mono">Logo antes do corte</figcaption></figure><span class="seam-cut" aria-hidden="true">${icon("cut")}</span><figure><canvas width="320" height="180"></canvas><figcaption class="mono">Logo depois</figcaption></figure></div><p class="seam-q">Era um plano só, sem corte. O que mudou de lugar dentro do quadro?</p></div>`;
  else if(dd.tempo)special=this.timeBlock();
  else if(dd.jcut||dd.lcut)special=this.avBlock();
  else if(dd.lado)special=this.ladoBlock();
  else if(dd.cross)special=this.crossBlock();
  else if(dd.original)special=this.ordemBlock();
  const nextBtn=nx?`<a class="btn ink lg" href="#/lab/${nx}">Próxima: ${esc(CH.ACT[nx].t)}${icon("next")}</a>`:`<a class="btn ink lg" href="#/livre">Criar no laboratório livre${icon("next")}</a>`;
  return `<article class="disc-card" style="--ac:${cor}">
    ${dd.caraca?`<div class="caraca" role="status" aria-live="polite"><b class="display caraca-t">${esc(dd.caraca.t)}</b><span class="caraca-s">${esc(dd.caraca.s)}</span></div>`:""}
    <span class="tag ${D.isNew?"y":"g"}">${icon("frame")}${D.isNew?"Nova descoberta":"Você reencontrou"}</span>
    <p class="disc-pre">${D.isNew?"Isso que você fez tem um nome:":"Outra vez:"}</p>
    <h2 class="display disc-name">${esc(nomeBonito(L.nome))}</h2>
    <p class="disc-lead">${esc(dd.apos||"")}</p>
    ${L.o_que?`<p class="disc-this"><span class="eyebrow">Nesta versão</span>${esc(L.o_que.replace(/\s*[—–-]\s*isso é (um |uma )?[^.]+\.?$/i,"."))}</p>`:""}
    ${special}
    ${dd.mudou?`<p class="disc-mudou"><span class="eyebrow">O que mudou</span>${esc(dd.mudou)}</p>`:""}
    <p class="disc-def">${esc(dd.descoberta||L.por_que||"")}</p>
    <ul class="got" aria-label="O que você ganhou">
      <li>${icon("frame")}<span>${D.auto?"Experimento registrado.":"Experimento já registrado."} Seu fotograma foi revelado.</span></li>
      ${conc?`<li>${icon("book")}<span><a class="link" href="#/conceito/${conc.id}">${esc(conc.t)}</a> entrou na sua biblioteca de descobertas.</span></li>`:""}
      <li>${icon("lens")}<span>Agora você pode reconhecer isso em outros cortes.</span></li>
    </ul>
    ${CH.museuLink(CH.museuPorAtividade(this.exId))}
    <div class="disc-cta">${nextBtn}<button class="btn" type="button" data-tab-p>${icon("plus")}Experimentar outra combinação</button><button class="btn ghost" type="button" data-note-disc="${esc(L.nome)}">${icon("pencil")}Anotar no Caderno</button></div>
    ${this.personaStrip()}
    ${dd.continue?`<p class="disc-cont"><span class="eyebrow">Quer ir além?</span>${esc(dd.continue)}</p>`:""}
    <div class="disc-deep"><button class="btn sm ghost" type="button" data-tab-v>${icon("compare")}Comparar e aprofundar</button></div>
  </article>`;
};
P.personaStrip=function(){
  const pe=CH.persona();if(!pe)return"";
  const mine=(pe.combina||[]).includes(this.exId);
  return `<div class="pstrip"><img src="assets/personas/${pe.id}-busto.jpg" alt="" width="44" height="44"><p><span class="eyebrow">${esc(CH.personaNome())}, ${esc(pe.curto)}</span>${esc(pe.pergunta||"")}</p></div>`;
};
P.afterDiscoveryPaint=function(){
  const D=this.read&&this.read.disc;
  if(CH.fx&&D&&D.isNew)CH.fx.blip();
  if(D&&(D.isNew||D.auto)&&!D.celebrated&&CH.celebrate){D.celebrated=true;const dd=CH.didatica(this.exId);
    CH.celebrate({nome:nomeBonito(D.nome),novo:D.isNew,frase:dd.caraca?dd.caraca.t:""})}
  const sm=this.$("#seam");if(sm)this.paintSeam(sm);
};
/* Kuleshov: MESMO ROSTO + IMAGEM DIFERENTE = LEITURA DIFERENTE, com os próprios quadros do aluno */
P.kuleshovBlock=function(){
  const comp=this.ex.evaluation.completion,anchors=((comp.distinct_by||{}).anchor)||[];
  const a=CH.store.act(this.exId),seqs=[this.seq,...[...a.versions].reverse().map(v=>v.seq)];
  const rep=[];
  seqs.forEach(sq=>{
    const i=sq.findIndex(s=>anchors.includes(s.id));
    if(i<0||!sq[i+1]||anchors.includes(sq[i+1].id))return;
    const face=sq[i].id,reply=sq[i+1].id;
    if(!rep.some(r=>r.reply===reply&&r.face===face))rep.push({face,reply});
  });
  if(!rep.length)return"";
  const fx=this.act.fx||{},show=rep.slice(0,3);
  return `<div class="kcon" aria-label="O mesmo rosto com imagens diferentes">
    <p class="kcon-eq mono"><b>Mesmo rosto</b><i>+</i><b>Imagem diferente</b><i>=</i><b>Leitura diferente</b></p>
    <ul class="kcon-list">${show.map(r=>{const f=CH.TK[r.face],t=CH.TK[r.reply];
      return `<li class="kcon-r"><div class="kcon-imgs"><img src="${f.th}" alt="Rosto" width="160" height="120"><span aria-hidden="true">+</span><img src="${t.th}" alt="${esc(t.s)}" width="160" height="120"></div><p class="kcon-read"><span class="mono">=</span>${esc(fx[r.face+"→"+r.reply]||"uma leitura própria")}</p></li>`}).join("")}</ul>
    ${show.length<2?`<p class="kcon-more">Troque a imagem depois do rosto e veja a leitura mudar.</p>`:""}</div>`;
};
/* Elipse: quanto tempo desapareceu */
P.timeBlock=function(){
  const segs=this.player.segs;if(!segs.length||!segs.every(g=>g.id===segs[0].id))return"";
  const d=CH.TK[segs[0].id].d,kept=segs.reduce((x,g)=>x+g.dur,0),gone=Math.max(0,d-kept);
  if(gone<.3)return"";
  const iv=segs.map(g=>[g.srcIn,g.srcOut]).sort((a,b)=>a[0]-b[0]);
  const bar=iv.map(([a,b])=>`<i class="tb-seen" style="left:${(a/d*100).toFixed(2)}%;width:${((b-a)/d*100).toFixed(2)}%"></i>`).join("");
  return `<div class="tb"><p class="eyebrow">O tempo que sumiu</p><div class="tb-bar" role="img" aria-label="Você viu ${kept.toFixed(1)} segundos de ${d.toFixed(1)}. Não viu ${gone.toFixed(1)}.">${bar}</div>
    <p class="tb-cap"><b>${kept.toFixed(1)} s</b> vistos, <b>${gone.toFixed(1)} s</b> omitidos <span class="muted">de ${d.toFixed(1)} s</span></p>
    <p class="seam-q">Você não viu esse tempo passar. Mas entendeu que ele passou.</p></div>`;
};
/* captura dois quadros reais do vídeo em volta da emenda */
P.paintSeam=function(box){
  const segs=this.player.segs;let k=-1;
  for(let i=0;i<segs.length-1;i++){if(segs[i].id===segs[i+1].id&&segs[i+1].srcIn>segs[i].srcOut+.05){k=i;break}}
  if(k<0)for(let i=0;i<segs.length-1;i++){if(segs[i].id===segs[i+1].id){k=i;break}}
  if(k<0){box.hidden=true;return}
  const cv=$$("canvas",box),jobs=[[segs[k],Math.max(0,segs[k].srcOut-.06)],[segs[k+1],segs[k+1].srcIn+.02]];
  jobs.forEach(([g,t],n)=>{
    if(!g.url)return;
    const v=document.createElement("video");v.muted=true;v.playsInline=true;v.preload="auto";v.src=g.url;
    const done=()=>{try{const c=cv[n],x=c.getContext("2d");x.drawImage(v,0,0,c.width,c.height)}catch(e){}v.removeAttribute("src");v.load()};
    v.addEventListener("loadedmetadata",()=>{try{v.currentTime=Math.min(t,Math.max(0,(v.duration||g.tk.d)-.05))}catch(e){}},{once:true});
    v.addEventListener("seeked",done,{once:true});
    v.addEventListener("error",()=>{},{once:true});
  });
};

/* ============ APROFUNDAR (comparar, experimentar, versões, anotar) ============ */
const PROMPT_N=["O que você sentiu?","Mudou alguma coisa?","Qual funciona melhor para você?"];
P.buildVersoes=function(){
  const rp=this.rp(),free=this.free,p=this.$("#p-versoes");
  p.innerHTML=`
  <p class="deep-lead">Nada aqui é obrigatório para seguir em frente. Use quando quiser olhar de novo, comparar ou guardar o que percebeu.</p>
  <div class="vs-draft" id="vs-draft"></div>
  <form class="vs-form" id="vs-form" novalidate>
    <div class="fld">
      <label for="refl" class="fld-l" id="refl-l">${PROMPT_N[0]}</label>
      <p class="fld-p" id="refl-p">${esc(rp.prompt||"O que você percebeu nesta versão?")}</p>
      <textarea id="refl" rows="2" maxlength="600" aria-describedby="refl-p" placeholder="${free?"Em uma frase…":"Se quiser, escreva com suas palavras…"}"></textarea>
    </div>
    <button class="btn ink" type="submit" id="b-save">${icon("save")}<span>Guardar esta versão</span></button>
    <p class="save-why" id="save-why" aria-live="polite"></p>
  </form>
  <div class="vs-prog" id="vs-prog"></div>
  <div class="vs-list-h"><h2 class="h3">Versões guardadas</h2><button class="btn sm" type="button" id="b-cmp">${icon("compare")}Comparar</button></div>
  <ul class="vlist" id="vlist"></ul>
  <div class="deep-foot"><button class="btn sm ghost" type="button" id="b-link">${icon("link")}Copiar link desta atividade</button></div>`;
  this.$("#vs-form").addEventListener("submit",e=>{e.preventDefault();this.saveVersion()});
  this.$("#b-cmp").onclick=()=>this.openCompare();
  this.$("#b-link").onclick=async()=>{const u=CH.linkDaAtividade(this.exId);try{await navigator.clipboard.writeText(u);CH.toast("Link copiado.")}catch(e){prompt("Copie o link:",u)}};
  p.addEventListener("click",e=>{
    const b=e.target.closest("[data-vact]");
    if(b){const id=b.closest("[data-vid]").dataset.vid;this.versionAction(b.dataset.vact,id)}
    if(e.target.closest("[data-note-disc]"))this.noteDiscovery(e.target.closest("[data-note-disc]").dataset.noteDisc);
  });
  p.addEventListener("submit",e=>{
    const f=e.target.closest(".v-note");if(!f)return;e.preventDefault();
    const id=f.closest("[data-vid]").dataset.vid,t=$("textarea",f).value.trim();
    CH.store.setVersionReflection(this.exId,id,t);if(t)CH.store.addNote({kind:"reflexao",exId:this.exId,vid:id,vn:(CH.store.act(this.exId).versions.find(v=>v.id===id)||{}).n,text:t});
    this.completionCheck();CH.toast("Anotação guardada.");this.renderVersionList();this.renderProgress();this.renderStepper();
  });
  const rx=this.$("#refl");rx&&rx.addEventListener("input",()=>this.renderSaveState());
  this.renderVersionsDraft();this.renderVersionList();this.renderProgress();
};
P.renderVersionsDraft=function(){
  const d=this.$("#vs-draft");if(!d)return;
  const n=this.seq.length,T=CH.total(this.seq);
  d.innerHTML=`<span class="eyebrow">Sua montagem agora</span>${n?`<div class="mstrip">${this.stripHTML(this.seq)}</div><p class="mono tnum">${n} ${n===1?"plano":"planos"}, ${T.toFixed(1)} s${this.fromVersion?`, a partir da versão ${(CH.store.act(this.exId).versions.find(v=>v.id===this.fromVersion)||{}).n||""}`:""}</p>`:`<p class="muted">Ainda vazia. Escolha planos em <b>Planos</b>.</p>`}`;
  this.renderSaveState();
};
P.stripHTML=function(seq){
  const T=Math.max(CH.total(seq),.1);
  return seq.map(s=>{const t=CH.TK[s.id];return `<i data-film="${t.f}" style="flex:${(CH.dur(s)/T).toFixed(3)};--fc:var(--f-${t.f});background-image:url(${t.th})" title="${esc(CH.cardLabel(this.exId,s.id))}, ${CH.dur(s).toFixed(1)}s"></i>`}).join("");
};
P.saveBlock=function(){
  const a=CH.store.act(this.exId);
  if(!this.seq.length)return"Adicione planos à timeline para guardar uma versão.";
  if(!this.free&&!this.watched)return"Assista à montagem até o fim para poder guardá-la.";
  const last=a.versions[a.versions.length-1];
  if(last&&JSON.stringify(last.seq)===JSON.stringify(this.seq))return"Esta versão já está guardada. Mude algo para guardar outra.";
  return"";
};
P.renderSaveState=function(){
  const b=this.$("#b-save");if(!b)return;
  const why=this.saveBlock();b.disabled=!!why;b.setAttribute("aria-disabled",!!why);
  this.$("#save-why").textContent=why;
  const n=CH.store.act(this.exId).versions.length,l=this.$("#refl-l");if(l)l.textContent=PROMPT_N[Math.min(n,PROMPT_N.length-1)];
};
P.saveVersion=function(){
  const why=this.saveBlock();if(why)return CH.toast(why);
  const rf=this.$("#refl"),refl=rf?rf.value.trim():"";
  let meta={};
  if(!this.free){try{const {r,L}=CH.readSeq(this.exId,this.seq);meta={cls:r.class,matched:r.matched_targets,situacao:L.situacao,titulo:L.titulo,nome:L.nome||null,porque:L.por_que||null}}catch(e){}}
  const v=CH.store.addVersion(this.exId,Object.assign({seq:JSON.parse(JSON.stringify(this.seq)),clips:CH.clipsOf(this.seq),reflection:refl,dur:CH.total(this.seq),from:this.fromVersion||null,aud:JSON.parse(JSON.stringify(this.aud))},meta));
  if(refl)CH.store.addNote({kind:"reflexao",exId:this.exId,vid:v.id,vn:v.n,text:refl});
  if(rf)rf.value="";
  this.fromVersion=v.id;this.dirty=false;this.saveDraftNow();
  if(meta.nome&&meta.situacao==="proposta")CH.store.discover(meta.nome,this.exId);
  const before=CH.progress(this.exId).done,after=this.completionCheck();
  CH.toast(after&&!before?"Você aprofundou esta atividade.":"Versão "+v.n+" guardada.",3000);
  this.renderVersionList();this.renderProgress();this.renderSaveState();this.renderStepper();this.renderVersionsDraft();this.cnt();
};
P.completionCheck=function(){
  if(this.free)return false;
  const pr=CH.progress(this.exId);CH.store.markDone(this.exId,pr.done);return pr.done;
};
P.renderProgress=function(){
  const box=this.$("#vs-prog");if(!box)return;
  if(this.free){box.innerHTML=`<p class="muted">Aqui não há meta: guarde as versões que quiser. Elas vão para o <a class="link" href="#/caderno">Caderno</a>.</p>`;return}
  const pr=CH.progress(this.exId),ex=this.ex,c=ex.evaluation.completion,items=[];
  const nv=(pr.counted?pr.counted.length:0);
  if(pr.done){
    box.innerHTML=`<div class="done-card"><span class="done-fr">${CH.fotograma(this.exId,3)}</span><div><span class="eyebrow">Aprofundou</span><h3 class="h3">Atividade aprofundada</h3><p class="muted">Você fez tudo o que esta atividade propunha. Pode continuar experimentando quando quiser.</p></div></div>`;return}
  pr.reasons.forEach(r=>{
    if(r==="min_valid")items.push("Faça uma segunda versão diferente que também funcione. Tente outro caminho.");
    else if(r==="min_versions")items.push(`Guarde mais versões <b>diferentes</b> (${nv} de ${c.min_versions} por enquanto).`);
    else if(r.startsWith("required_targets"))items.push("Falta experimentar outra relação entre os planos. Veja <b>Quer ir além?</b> na descoberta.");
    else if(r==="min_versions_matching")items.push("Algumas versões precisam seguir a proposta da atividade.");
    else if(r==="distinct_violation")items.push("Duas versões usam a mesma imagem: troque por uma bem diferente.");
    else if(r==="equivalence_violation")items.push("Duas versões dizem quase a mesma coisa. Tente uma imagem bem diferente.");
  });
  if(pr.complete&&!pr.refl.ok)items.push(pr.refl.scope==="per_exercise"?"Falta <b>anotar uma frase</b> sobre a atividade.":"Falta <b>anotar uma frase</b> em cada versão (use “Anotar” nas versões abaixo).");
  if(!pr.n)items.unshift(`Monte, assista e guarde ${c.min_versions>1?"pelo menos "+c.min_versions+" versões":"uma versão"}.`);
  const exRefl=!pr.refl.ok&&pr.refl.scope==="per_exercise"&&pr.complete;
  box.innerHTML=`<div class="prog-card"><span class="eyebrow">Para aprofundar esta atividade</span><ul>${items.map(i=>`<li>${i}</li>`).join("")||"<li>Continue experimentando.</li>"}</ul>
    ${exRefl?`<div class="fld"><label class="fld-l" for="refl-ex">${esc(this.rp().prompt||"O que você percebeu?")}</label><textarea id="refl-ex" rows="2" maxlength="800"></textarea><button class="btn sm ink" type="button" id="b-rex">${icon("check")}Anotar</button></div>`:""}
    ${this.ex.question&&!CH.store.act(this.exId).answer?this.questionHTML(CH.store.act(this.exId)):""}</div>`;
  const b=this.$("#b-rex");if(b)b.onclick=()=>{const t=this.$("#refl-ex").value.trim();if(!t)return CH.toast("Escreva uma frase para anotar.");CH.store.setReflection(this.exId,t);CH.store.addNote({kind:"reflexao",exId:this.exId,vn:null,text:t});const d=this.completionCheck();CH.toast(d?"Você aprofundou esta atividade.":"Anotação guardada.");this.renderProgress();this.renderStepper()};
  $$('input[name="q"]',box).forEach(r=>r.onchange=()=>{CH.store.setAnswer(this.exId,r.value);CH.say("Resposta registrada. Ela não é avaliada.");this.renderProgress()});
};
P.questionHTML=function(a){
  const q=this.ex.question;if(!q)return"";
  const opt=o=>{
    const t=CH.TK[o];const lab=t?CH.cardLabel(this.exId,o):o;
    return `<label class="q-opt${a.answer===o?" on":""}"><input type="radio" name="q" value="${esc(o)}" ${a.answer===o?"checked":""}>${t?`<img src="${t.th}" alt="" width="72" height="54">`:""}<span>${esc(lab)}</span></label>`};
  return `<fieldset class="q-card"><legend class="eyebrow">Pergunta para observar, sem nota</legend><p class="q-p">${esc(q.prompt)}</p><div class="q-opts">${q.options.map(opt).join("")}</div></fieldset>`;
};
P.renderVersionList=function(){
  const a=CH.store.act(this.exId),ul=this.$("#vlist");if(!ul)return;
  this.cnt();
  this.$("#b-cmp").disabled=!(a.versions.length+(this.seq.length?1:0)>=2)&&!CH.referenceSeq(this.exId);
  if(!a.versions.length){ul.innerHTML=`<li class="v-empty muted">Nenhuma versão guardada ainda. Monte e assista: versões que realizam a proposta são guardadas sozinhas.</li>`;return}
  ul.innerHTML=[...a.versions].reverse().map(v=>`<li class="vitem" data-vid="${v.id}"><div class="v-top"><b class="v-n">Versão ${v.n}</b><span class="mono muted">${CH.fmt(v.dur)}, ${CH.ago(v.at)}${v.auto?", registrada sozinha":""}</span></div>
    <div class="mstrip">${this.stripHTML(v.seq)}</div>
    ${v.titulo&&!this.free?`<p class="v-t">${esc(v.titulo)}</p>`:""}
    ${v.nome?`<p class="v-name"><span class="tag y">Descoberta</span> ${esc(nomeBonito(v.nome))}</p>`:""}
    ${v.reflection?`<blockquote class="v-r">${esc(v.reflection)}</blockquote>`:`<form class="v-note"><label class="sr" for="vn-${v.id}">Anotar sobre a versão ${v.n}</label><textarea id="vn-${v.id}" rows="1" maxlength="600" placeholder="${PROMPT_N[Math.min(v.n-1,2)]}"></textarea><button class="btn sm" type="submit">Anotar</button></form>`}
    <div class="wrap v-act"><button class="btn sm" type="button" data-vact="open">${icon("copy")}Duplicar e experimentar</button><button class="btn sm ghost" type="button" data-vact="cmp">${icon("compare")}Comparar</button><button class="btn sm ghost icon-only" type="button" data-vact="del" aria-label="Excluir versão ${v.n}">${icon("trash")}</button></div></li>`).join("");
};
P.versionAction=function(act,id){
  const a=CH.store.act(this.exId),v=a.versions.find(x=>x.id===id);if(!v)return;
  if(act==="open"){
    this.push();this.seq=JSON.parse(JSON.stringify(v.seq));this.aud=JSON.parse(JSON.stringify(v.aud||[]));this.sel=-1;this.fromVersion=v.id;this.watched=false;this.read=null;this.t=0;
    this.player.setSeq(this.seq);this.afterChange();this.saveDraft();this.setTab("planos");
    this.sel=0;this.updateSelUI();this.player.seek(0);
    CH.toast("Versão "+v.n+" aberta como nova tentativa. Mude algo e assista.");this.$("#b-play").focus();
    this.el.scrollIntoView({behavior:"auto",block:"start"});
  }else if(act==="cmp"){this.openCompare("v:"+id,"draft")}
  else if(act==="del"){if(confirm("Excluir a versão "+v.n+"? Isso não pode ser desfeito.")){CH.store.delVersion(this.exId,id);this.renderVersionList();this.renderProgress();this.renderStepper();this.renderReadout();CH.toast("Versão excluída.")}}
};
P.noteDiscovery=function(nome){
  CH.store.addNote({kind:"descoberta",exId:this.exId,text:"Descobri o nome: "+nomeBonito(nome)+". "});
  CH.toast("Anotação criada no Caderno. Abra o Caderno para continuar escrevendo.",3400);
};

/* ============ COMPARAR A/B — dois vídeos reais ao mesmo tempo ============ */
P.cmpOptions=function(){
  const a=CH.store.act(this.exId),o=[];
  if(this.seq.length)o.push({k:"draft",l:"Sua montagem agora",seq:this.seq});
  [...a.versions].reverse().forEach(v=>o.push({k:"v:"+v.id,l:"Versão "+v.n,seq:v.seq,v}));
  const r=CH.referenceSeq(this.exId);if(r)o.push({k:"ref",l:"Referência (uma forma de realizar a proposta)",seq:r,ref:true});
  return o;
};
P.openCompare=function(ka,kb){
  const opts=this.cmpOptions();
  if(opts.length<2)return CH.toast("Guarde ou monte pelo menos duas montagens para comparar.");
  this.player.pause();
  let A=opts.find(o=>o.k===ka)||opts[0],B=opts.find(o=>o.k===kb&&o!==A)||opts.find(o=>o!==A);
  const dlg=h("dialog.cmp",{"aria-labelledby":"cmp-t"});
  const optHTML=cur=>opts.map(o=>`<option value="${o.k}" ${o===cur?"selected":""}>${esc(o.l)}</option>`).join("");
  dlg.innerHTML=`<div class="cmp-in">
   <div class="cmp-head"><div><span class="eyebrow">${esc(this.act.t)}</span><h2 class="h2" id="cmp-t">Comparar</h2></div><button class="btn ghost sm icon-only" type="button" data-x aria-label="Fechar comparação">${icon("x")}</button></div>
   <p class="lead cmp-lead">Assista às duas ao mesmo tempo. Olhe o momento do corte: o que muda de uma para a outra?</p>
   <div class="cmp-grid">
     ${["A","B"].map((s,i)=>`<section class="cmp-col" data-s="${s}"><div class="cmp-top"><span class="cmp-l">${s}</span><label class="sr" for="sel-${s}">Montagem ${s}</label><select id="sel-${s}" data-sel="${s}">${optHTML(i?B:A)}</select></div>${CH.monitorHTML(this.ar)}<div class="mstrip" data-strip></div><p class="cmp-info mono tnum" data-info></p><blockquote class="v-r" data-refl hidden></blockquote></section>`).join("")}
   </div>
   <div class="cmp-ctl"><button class="btn ink lg" type="button" data-play>${icon("play")}<span>Assistir as duas</span></button><button class="btn ghost lg" type="button" data-stop>${icon("stop")}Parar</button></div>
   <div class="fld cmp-note"><label for="cmp-txt" class="fld-l">O que mudou entre A e B?</label><p class="fld-p">Se quiser, escreva com suas palavras. Fica guardado no Caderno.</p><textarea id="cmp-txt" rows="2" maxlength="600"></textarea><button class="btn sm" type="button" data-save>${icon("pencil")}Guardar no Caderno</button></div>
  </div>`;
  document.body.append(dlg);(this.overlays=this.overlays||[]).push(dlg);
  const pl={};let played=0;
  const setCol=(s,o)=>{
    const col=$(`[data-s="${s}"]`,dlg);
    if(pl[s])pl[s].destroy();
    pl[s]=new CH.SeqPlayer($(".monitor",col),{onTime:t=>{$(".mv-tc",col).textContent=fmt(t)+" / "+fmt(pl[s].total)},onEnd:()=>{played++;if(played>=2){const a=CH.store.act(this.exId);a.compared=true;CH.store.save()}}});
    pl[s].setSeq(o.seq);
    $("[data-strip]",col).innerHTML=this.stripHTML(o.seq);
    $("[data-info]",col).textContent=o.seq.length+" planos, "+CH.total(o.seq).toFixed(1)+" s";
    const bq=$("[data-refl]",col);bq.hidden=!(o.v&&o.v.reflection);bq.textContent=o.v?o.v.reflection:"";
  };
  setCol("A",A);setCol("B",B);
  dlg.addEventListener("change",e=>{const s=e.target.dataset&&e.target.dataset.sel;if(!s)return;const o=opts.find(x=>x.k===e.target.value);if(s==="A")A=o;else B=o;setCol(s,o);played=0});
  dlg.addEventListener("click",e=>{
    if(e.target===dlg||e.target.closest("[data-x]")){Object.values(pl).forEach(p=>p.destroy());dlg.close()}
    if(e.target.closest("[data-play]")){played=0;Object.values(pl).forEach(p=>p.stop(true));const oA=pl.A.o.onEnd;pl.A.o.onEnd=()=>{oA&&oA();pl.B.play(0)};pl.A.play(0)}
    if(e.target.closest("[data-stop]"))Object.values(pl).forEach(p=>p.pause());
    if(e.target.closest("[data-save]")){const t=$("#cmp-txt",dlg).value.trim();if(!t)return CH.toast("Escreva o que você percebeu para guardar.");
      CH.store.addNote({kind:"comparacao",exId:this.exId,text:`${A.l} × ${B.l}: ${t}`});CH.toast("Comparação guardada no Caderno.");$("#cmp-txt",dlg).value=""}
  });
  dlg.addEventListener("close",()=>{Object.values(pl).forEach(p=>p.destroy());dlg.remove()});
  dlg.showModal();
};
/* ============ proximidade do efeito (0–100%) ============ */
CH.proximidade=function(exId,seq,aud){
  if(!seq||!seq.length)return 0;
  try{
    const N=CH.NOVAS[exId];
    if(N){
      const {r}=CH.readSeq(exId,seq);const c=r.class;
      if(c==="valid")return 100;
      if(N.tipo==="direto"){return new Set(seq.map(x=>x.id)).size>=2?100:(seq.length?45:0)}
      return c==="known_weak"?70:c==="unmapped"?40:Math.min(30,10+seq.length*10);
    }
    const ex=CH.EXF[exId],clips=CH.clipsOf(seq),r=Engine.classifyVersion(ex,clips);
    if(r.class==="valid"&&r.matched_targets&&r.matched_targets.length)return 100;
    const ids=seq.map(x=>x.id),S=new Set(ids);let best=0;
    (ex.evaluation.pair_catalog||[]).filter(p=>p.class==="valid"||p.class==="alternative_valid").forEach(p=>{
      let sc=(S.has(p.a)?1:0)+(S.has(p.b)?1:0);
      for(let i=0;i<ids.length-1;i++)if(ids[i]===p.a&&ids[i+1]===p.b)sc+=1;
      best=Math.max(best,sc/3)});
    const need=ex.required_take_count||2,fill=Math.min(1,ids.length/need);
    return Math.round(Math.min(90,10+best*60+fill*20));
  }catch(e){return 0}
};
P.paintProx=function(){
  const el=this.$("#prox");if(!el)return;
  if(this.free||!this.seq.length){el.hidden=true;return}
  const v=CH.proximidade(this.exId,this.seq),dd=CH.didatica(this.exId);
  el.hidden=false;el.dataset.v=v;
  this.$(".prox-n",el).textContent=v+"%";
  this.$(".prox-bar i",el).style.width=v+"%";
  this.$(".prox-l",el).textContent=v>=100?"Você chegou ao efeito.":v>=70?"Está muito perto.":v>=40?"Está no caminho.":"Ainda está longe.";
  const dica=this.$(".prox-dica",el),tries=(this._tries||0);
  if(v<100&&tries>=2&&dd.dica){dica.hidden=false;dica.textContent=dd.dica}
  else if(v<100&&tries>=2){const r=CH.referenceSeq(this.exId);dica.hidden=!r;if(r)dica.textContent="Receita: "+r.map(x=>CH.cardLabel(this.exId,x.id)).join(" → ")}
  else dica.hidden=true;
};

})();
