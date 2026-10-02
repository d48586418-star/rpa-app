/* lab-av.js — modo "imagem + som": faixa A1 com áudio real, separável da imagem (J-cut, L-cut),
   e os blocos de descoberta das atividades novas (eixo, ordem, diagrama de som). */
(function(){
"use strict";
const CH=window.CH,{$,$$,esc,icon}=CH,P=CH.Lab.prototype;
const s1=x=>Number(x).toFixed(1).replace(".",",");

/* clipes de som ligados à imagem: acompanham o plano como num editor de verdade */
P.syncAud=function(){
  if(!this.av)return;
  const n=this.nv,segs=this.player.segs,keep=[];
  this.aud=this.aud.filter(c=>this.seq.some(s=>s.id===c.link));
  segs.forEach(g=>{
    const aid=n.audios[g.id];if(!aid)return;
    let c=this.aud.find(x=>x.link===g.id);
    const ad=CH.AUD[aid].d;
    if(!c){c={id:aid,link:g.id,start:g.start,a:0,b:Math.min(1,g.dur/ad),linked:true};this.aud.push(c);if(g.id===n.av.alvo)this.selA=this.aud.length-1}
    else if(c.linked){c.start=g.start;c.a=0;c.b=Math.min(1,g.dur/ad)}
  });
  if(this.selA>=this.aud.length)this.selA=-1;
  if(this.selA<0){const k=this.aud.findIndex(c=>c.link===n.av.alvo);if(k>=0)this.selA=k}
};

/* layout em escala uniforme: 1 segundo = mesma largura na imagem e no som */
const baseLayout=P.layout;
P.layout=function(){
  if(!this.av)return baseLayout.call(this);
  const W=this.$("#tl-scroll").clientWidth||320,vt=Math.max(this.player.total,.1);
  const end=Math.max(vt,...this.aud.map(c=>c.start+(c.b-c.a)*CH.AUD[c.id].d),.1);
  const pps=(W-2)/end;let x=0;
  const pos=this.player.segs.map(g=>{const l=g.start*pps;return{l,w:g.dur*pps}});
  return{W,total:W,pos,pps,uniform:true};
};
const baseRender=P.renderTL;
P.renderTL=function(){
  baseRender.call(this);
  if(!this.av||!this.lay)return;
  const row=this.$(".tl-row.aud");if(!row)return;
  row.classList.add("av");
  const pps=this.lay.pps;
  row.innerHTML=this.aud.map((c,i)=>{
    const a=CH.AUD[c.id],len=(c.b-c.a)*a.d,sel=i===this.selA;
    const pk=a.pk||[];let w='<svg preserveAspectRatio="none" viewBox="0 0 96 20" aria-hidden="true">';
    for(let k=0;k<32;k++){const v=(pk[Math.min(pk.length-1,Math.floor((c.a+(c.b-c.a)*k/32)*pk.length))]||6)/100,hh=2+16*v;w+=`<rect x="${k*3}" y="${10-hh/2}" width="1.6" height="${hh}" rx=".8"/>`}
    w+="</svg>";
    return `<button type="button" class="au-clip${sel?" act":""}${c.linked?" linked":""}" data-ai="${i}" style="left:${c.start*pps}px;width:${len*pps}px" aria-label="Som do ${esc(CH.cardLabel(this.exId,c.link))}, ${s1(len)} segundos, começa em ${s1(c.start)}${c.linked?", ligado à imagem":", separado da imagem"}" aria-pressed="${sel}">${w}<span class="au-l">${c.linked?icon("link"):""}Som ${esc(CH.cardLabel(this.exId,c.link).replace("Plano ",""))}</span>${sel&&!c.linked?`<i class="au-h" data-ae="${i}" aria-hidden="true"></i>`:""}</button>`;
  }).join("");
};

/* botões do som */
const baseBind=P.bind;
P.bind=function(){
  baseBind.call(this);
  /* planos do pacote têm som próprio: ligar é opção do aluno (começa desligado) */
  const sb=this.$("#b-sound");
  if(this.nv&&!this.av&&sb){
    const paint=()=>{const on=!!this.player.sound;sb.setAttribute("aria-pressed",on);sb.querySelector("span").textContent=on?"Desligar o som":"Ligar o som";sb.firstElementChild.outerHTML=icon(on?"sound":"mute")};
    sb.hidden=false;this.$("#note-mute").hidden=true;
    this.player.setSound(!!CH.store.state.prefs.sound);paint();
    sb.onclick=()=>{CH.store.setPref("sound",!this.player.sound);this.player.setSound(!this.player.sound);paint()};
  }
  if(this.av){this.$("#note-mute").hidden=true}
  if(!this.av)return;
  const act=f=>()=>{const c=this.aud[this.selA];if(!c)return CH.toast("Toque num bloco de som para selecioná-lo.");f(c)};
  const needSep=f=>c=>{if(c.linked)return CH.toast("Primeiro separe o som da imagem: use Separar áudio.");f(c)};
  const done=m=>{this.mix.stop();this.changed();this.renderTL();this.updateButtons();this.renderVersionsDraft&&this.renderVersionsDraft();if(m)CH.say(m)};
  this.$("#b-sep").onclick=act(c=>{if(!c.linked)return CH.toast("O som já está separado.");c.linked=false;done("Som separado da imagem. Agora ele pode andar sozinho.");CH.toast("Som separado. Arraste o bloco ou use os botões.")});
  this.$("#b-ant").onclick=act(needSep(c=>{c.start=Math.max(0,Math.round((c.start-.5)*10)/10);done("Som 0,5 segundo mais cedo")}));
  this.$("#b-dep").onclick=act(needSep(c=>{c.start=Math.round((c.start+.5)*10)/10;done("Som 0,5 segundo mais tarde")}));
  const ad=c=>CH.AUD[c.id].d;
  this.$("#b-est").onclick=act(needSep(c=>{c.b=Math.min(1,c.b+.5/ad(c));done("Som 0,5 segundo mais longo")}));
  this.$("#b-enc").onclick=act(needSep(c=>{c.b=Math.max(c.a+.3/ad(c),c.b-.5/ad(c));done("Som 0,5 segundo mais curto")}));
  /* arrastar o bloco de som e a alça de fim */
  const inner=this.$("#tl-inner");let drag=null;
  inner.addEventListener("pointerdown",e=>{
    const h=e.target.closest(".au-h"),b=e.target.closest(".au-clip");if(!b)return;
    e.stopPropagation();e.preventDefault();
    const i=+b.dataset.ai,c=this.aud[i];this.player.pause();this.mix.stop();
    if(this.selA!==i){this.selA=i;this.renderTL();this.updateButtons()}
    if(c.linked){CH.toast("Primeiro separe o som da imagem: use Separar áudio.");return}
    drag={i,mode:h?"end":"move",x0:e.clientX,start0:c.start,b0:c.b,moved:false};
    inner.setPointerCapture(e.pointerId);
  });
  inner.addEventListener("pointermove",e=>{
    if(!drag)return;const c=this.aud[drag.i],dx=(e.clientX-drag.x0)/this.lay.pps;
    if(Math.abs(e.clientX-drag.x0)>3)drag.moved=true;if(!drag.moved)return;
    if(drag.mode==="move")c.start=Math.max(0,Math.round((drag.start0+dx)*10)/10);
    else c.b=Math.min(1,Math.max(c.a+.3/CH.AUD[c.id].d,drag.b0+dx/CH.AUD[c.id].d));
    const el=inner.querySelector(`.au-clip[data-ai="${drag.i}"]`);if(el){el.style.left=c.start*this.lay.pps+"px";el.style.width=(c.b-c.a)*CH.AUD[c.id].d*this.lay.pps+"px"}
  });
  const up=()=>{if(!drag)return;const m=drag.moved;drag=null;if(m){this.changed();this.renderTL();this.updateButtons();this.renderVersionsDraft&&this.renderVersionsDraft()}};
  inner.addEventListener("pointerup",up);inner.addEventListener("pointercancel",up);
  inner.addEventListener("keydown",e=>{
    const b=e.target.closest&&e.target.closest(".au-clip");if(!b)return;
    const c=this.aud[+b.dataset.ai];if(!c||c.linked||(e.key!=="ArrowLeft"&&e.key!=="ArrowRight"))return;
    e.preventDefault();c.start=Math.max(0,Math.round((c.start+(e.key==="ArrowRight"?.1:-.1)*(e.shiftKey?5:1))*10)/10);
    this.changed();this.renderTL();const nb=inner.querySelector(`.au-clip[data-ai="${b.dataset.ai}"]`);nb&&nb.focus();
  });
};
const baseButtons=P.updateButtons;
P.updateButtons=function(){
  baseButtons.call(this);
  const f=this.av?this.nv.av.ferramentas:[];
  const map={separar:"#b-sep",antes:"#b-ant",depois:"#b-dep",esticar:"#b-est",encolher:"#b-enc"};
  Object.entries(map).forEach(([k,sel])=>{const b=this.$(sel);if(!b)return;b.hidden=!f.includes(k);if(!b.hidden){const c=this.aud[this.selA];b.disabled=!c||(k==="separar"?!c.linked:c.linked)}});
  if(this.av){this.$("#b-left").hidden=this.$("#b-right").hidden=true;this.$("#b-cut").hidden=true;const sp=this.$(".tools-sep");sp&&(sp.hidden=true)}
  const t=this.$("#tools");if(t&&this.av)t.hidden=!this.seq.length;
};
const baseCmp=P.openCompare;
P.openCompare=function(a,b){
  if(this.av)return CH.toast("Nas atividades de som, ouça uma versão de cada vez. Duplique uma versão em Aprofundar e compare de ouvido.");
  return baseCmp.call(this,a,b);
};

/* ---------- blocos de descoberta ---------- */
P.avBlock=function(){
  const T=CH.novas.timing(this.exId,this.seq,this.aud);if(!T)return"";
  const end=Math.max(...T.vid.map(v=>v.start+v.dur),...T.aud.map(a=>a.start+a.dur)),pc=x=>(x/end*100).toFixed(2)+"%";
  const lab=id=>CH.cardLabel(this.exId,id).replace("Plano ","");
  const cut=T.vid[1]?T.vid[1].start:0;
  return `<div class="avd" role="img" aria-label="Diagrama: imagem em cima, som embaixo. A mudança de imagem acontece em ${s1(cut)} segundos.">
    <p class="eyebrow">O desenho do corte</p>
    <div class="avd-row"><span class="avd-k mono">Imagem</span><div class="avd-lane">${T.vid.map((v,i)=>`<i class="avd-b v${i}" style="left:${pc(v.start)};width:${pc(v.dur)}">${esc(lab(v.id))}</i>`).join("")}<u class="avd-cut" style="left:${pc(cut)}"></u></div></div>
    <div class="avd-row"><span class="avd-k mono">Som</span><div class="avd-lane">${T.aud.map(a=>`<i class="avd-b a" style="left:${pc(a.start)};width:${pc(a.dur)}">${esc(lab(a.link))}</i>`).join("")}<u class="avd-cut" style="left:${pc(cut)}"></u></div></div>
    <p class="avd-cap">A linha marca onde a imagem muda. Repare no som: ${this.nv.tipo==="jcut"?"o de B já está tocando antes dela.":"o de A continua depois dela."}</p></div>`;
};
P.ladoBlock=function(){
  const ids=[...new Set(this.seq.map(s=>s.id))];
  return `<div class="lado"><p class="eyebrow">Onde cada um está, em cada plano</p><ul class="lado-l">${ids.map(id=>{const t=CH.TK[id];return `<li><img src="${t.th}" alt="${esc(CH.cardLabel(this.exId,id))}" width="120" height="68"><span><b>${esc(CH.cardLabel(this.exId,id))}</b>${esc(this.nv.lado[id]||"")}</span></li>`}).join("")}</ul></div>`;
};
P.crossBlock=function(){
  const li=this.seq.map(s=>(CH.TK[s.id]||{}).linha);
  return `<div class="cross"><p class="eyebrow">Suas duas casas, plano a plano</p><ol class="cross-l">${this.seq.map((s,i)=>{const t=CH.TK[s.id];return `<li class="cross-${li[i]}"><img src="${t.th}" alt="${esc(t.s)}" width="120" height="68"><span class="mono">Casa ${li[i]==="A"?"1":"2"}</span><span>${esc(t.s)}</span></li>`}).join("")}</ol></div>`;
};
P.ordemBlock=function(){
  const strip=ids=>`<div class="mstrip">${ids.map(id=>{const t=CH.TK[id];return `<i data-film="${t.f}" style="flex:1;--fc:var(--f-${t.f});background-image:url(${t.th})" title="${esc(CH.cardLabel(this.exId,id))}"></i>`}).join("")}</div>`;
  const mine=this.seq.map(s=>s.id),orig=this.nv.original.filter(id=>mine.includes(id));
  return `<div class="ordem"><p class="eyebrow">A ordem original e a sua</p><p class="ordem-k mono">Original</p>${strip(orig)}<p class="ordem-k mono">A sua</p>${strip(mine)}</div>`;
};
})();
