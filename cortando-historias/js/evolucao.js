/* evolucao.js — Jornada do editor: níveis, pontos e conquistas, tudo DERIVADO do que a pessoa fez (nada é guardado à mão).
   Também o tutorial de primeira vez (CH.tour). */
(function(){
"use strict";
const CH=window.CH,{esc,icon}=CH;

/* seis níveis: nome neutro quanto ao gênero, e o que a pessoa "passa a enxergar" ao chegar nele */
const NIV=[
  {n:1,nome:"Primeiros cortes",xp:0,   frase:"Você acabou de entrar na ilha de edição."},
  {n:2,nome:"Ritmo de ilha",    xp:40,  frase:"Você já sente a diferença entre ver e montar."},
  {n:3,nome:"Olhar de montagem",xp:120, frase:"Você começa a prever o efeito antes de assistir."},
  {n:4,nome:"Mão firme",        xp:240, frase:"Seus cortes têm motivo, e você sabe explicar."},
  {n:5,nome:"Voz própria",      xp:400, frase:"Você escolhe o corte pela história, não pela ferramenta."},
  {n:6,nome:"Mestria",          xp:560, frase:"Você montou, descobriu e aprofundou o percurso inteiro."}
];
/* conquistas: cada uma com uma cor de apoio do sistema visual */
const CONQ=[
  {id:"c1",t:"Primeiro corte",d:"Monte e assista a sua primeira sequência.",ic:"cut",cor:"var(--y)",ok:c=>c.exp>=1},
  {id:"c2",t:"Olho clínico",d:"Faça a primeira descoberta: uma técnica ganha nome.",ic:"spark",cor:"var(--b)",ok:c=>c.disc>=1},
  {id:"c3",t:"Colecionador de técnicas",d:"Descubra 5 técnicas.",ic:"book",cor:"var(--p)",ok:c=>c.disc>=5},
  {id:"c4",t:"Insistente",d:"Guarde 3 versões da mesma atividade.",ic:"compare",cor:"var(--gr)",ok:c=>c.maxVer>=3},
  {id:"c5",t:"Caderno vivo",d:"Escreva 3 anotações.",ic:"pencil",cor:"var(--y)",ok:c=>c.notes>=3},
  {id:"c6",t:"Etapa completa",d:"Conclua todas as atividades de uma etapa.",ic:"check",cor:"var(--b)",ok:c=>c.atoFull>=1},
  {id:"c7",t:"Meio caminho",d:"Conclua 3 etapas.",ic:"path",cor:"var(--p)",ok:c=>c.atoFull>=3},
  {id:"c8",t:"Percurso inteiro",d:"Conclua as cinco etapas.",ic:"film",cor:"var(--gr)",ok:c=>c.atoFull>=5},
  {id:"c9",t:"Semana cumprida",d:"Cumpra a sua meta de dias de prática em uma semana.",ic:"calendar",cor:"var(--y)",ok:c=>c.semanaOk},
  {id:"c10",t:"Três dias seguidos",d:"Pratique por três dias seguidos.",ic:"spark",cor:"var(--b)",ok:c=>c.streak>=3}
];
function ctx(){
  const all=CH.allActs(),st=CH.store.state,P=Object.fromEntries(all.map(i=>[i,CH.progress(i)]));
  const exp=all.filter(i=>P[i].nivel>=1).length,done=all.filter(i=>P[i].done).length;
  const disc=Object.keys(CH.store.discoveries()).length,ver=Object.values(st.act).reduce((a,x)=>a+x.versions.length,0);
  const maxVer=Math.max(0,...Object.values(st.act).map(x=>x.versions.length));
  const atoFull=CH.data.atos.atos.filter(a=>{const ids=CH.atividadesDoAto(a);return ids.length&&ids.every(i=>P[i].done)}).length;
  const m=CH.meta();
  return{exp,done,disc,ver,maxVer,notes:st.notes.length,atoFull,total:all.length,P,dias:m.dias.length,streak:m.streak,semanaOk:m.semanaOk};
}
CH.evo=function(){
  const c=ctx();
  const xp=c.exp*10+c.disc*20+c.done*40+Math.min(c.ver,10)*4+Math.min(c.notes,10)*3+Math.min(c.dias,30)*3;
  let k=0;NIV.forEach((v,i)=>{if(xp>=v.xp)k=i});
  const cur=NIV[k],nx=NIV[k+1]||null;
  const pct=nx?Math.round((xp-cur.xp)/(nx.xp-cur.xp)*100):100;
  /* o que fazer agora para pontuar: o caminho mais curto */
  let dica="";
  if(!c.exp)dica="Monte e assista a sua primeira sequência: +10.";
  else if(c.exp<c.total&&c.disc<=c.exp)dica="Experimente uma atividade nova: +10, e +20 se achar o efeito.";
  else if(c.done<c.total)dica="Conclua uma atividade (acerte e escreva o que percebeu): +40.";
  else dica="Guarde novas versões e anotações para aprofundar.";
  return{xp,nivel:cur,prox:nx,pct,falta:nx?nx.xp-xp:0,dica,niveis:NIV,conquistas:CONQ.map(q=>({...q,ganha:q.ok(c)})),c}
};
/* avisa uma única vez quando sobe de nível ou ganha conquista */
CH.evoCheck=function(){
  if(!CH.store.onboarded())return;
  const e=CH.evo(),S=CH.store.state;S.seen=S.seen||{};
  const antes=S.seen.lvl||0;
  if(!antes){S.seen.lvl=e.nivel.n;e.conquistas.forEach(q=>{if(q.ganha)S.seen["b_"+q.id]=1});CH.store.save();return}
  if(e.nivel.n>antes){S.seen.lvl=e.nivel.n;CH.store.save();CH.ritual({tipo:"Novo nível",titulo:"Nível "+e.nivel.n+": "+e.nivel.nome,sub:e.nivel.frase,ic:"spark",cor:"var(--y)"});return}
  const nova=e.conquistas.find(q=>q.ganha&&!S.seen["b_"+q.id]);
  if(nova){S.seen["b_"+nova.id]=1;CH.store.save();CH.ritual({tipo:"Conquista",titulo:nova.t,sub:nova.d,ic:nova.ic,cor:nova.cor})}
};
/* cartão reutilizável: Início e Meu espaço */
CH.evoCard=function(full){
  const e=CH.evo(),n=e.nivel;
  const ring=`<svg class="ev-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="ev-r0"/><circle cx="22" cy="22" r="19" class="ev-r1" style="stroke-dasharray:${(e.pct*1.194).toFixed(1)} 200"/></svg>`;
  return `<section class="ev${full?" ev-full":""}" aria-labelledby="ev-h">
    <div class="ev-top"><div class="ev-n">${ring}<b>${n.n}</b></div>
      <div class="ev-tx"><p class="eyebrow">Nível ${n.n} de ${NIV.length}</p><h2 class="h3" id="ev-h">${esc(n.nome)}</h2><p class="muted">${esc(n.frase)}</p></div></div>
    <div class="ev-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${e.pct}" aria-label="Progresso para o próximo nível"><i style="width:${e.pct}%"></i></div>
    <p class="ev-meta"><span class="tnum">${e.xp} pontos</span><span>${e.prox?`faltam ${e.falta} para “${esc(e.prox.nome)}”`:"nível máximo"}</span></p>
    <p class="ev-dica">${icon("spark","tiny")} ${esc(e.dica)}</p>
    ${full?`<ol class="ev-path" aria-label="Todos os níveis">${NIV.map(v=>`<li class="${v.n<n.n?"ok":v.n===n.n?"now":""}"><b>${v.n}</b><span>${esc(v.nome)}</span><small class="tnum">${v.xp}</small></li>`).join("")}</ol>
    <h3 class="h4 ev-bh">Conquistas <span class="muted tnum">${e.conquistas.filter(q=>q.ganha).length} de ${e.conquistas.length}</span></h3>
    <ul class="ev-badges">${e.conquistas.map(q=>`<li class="${q.ganha?"on":""}" style="--bc:${q.cor}"><span class="ev-bi">${icon(q.ic)}</span><b>${esc(q.t)}</b><small>${esc(q.d)}</small></li>`).join("")}</ul>`:`<a class="link ev-more" href="#/eu">Ver conquistas e níveis</a>`}
  </section>`;
};


/* ---------- meta semanal: dias de prática (guardado neste aparelho) ---------- */
const dia=d=>{const x=d||new Date();return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
const segunda=d=>{const x=new Date(d);const k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);x.setHours(12,0,0,0);return x};
CH.meta=function(){
  const S=CH.store.state;S.days=S.days||[];S.meta=S.meta||{dias:3};
  const set=new Set(S.days),hoje=new Date(),ini=segunda(hoje);
  const semana=[...Array(7)].map((_,i)=>{const d=new Date(ini);d.setDate(ini.getDate()+i);const k=dia(d);return{k,feito:set.has(k),hoje:k===dia(hoje),futuro:d>hoje&&k!==dia(hoje)}});
  const fe=semana.filter(x=>x.feito).length;
  /* dias seguidos: conta para trás a partir de hoje (ou de ontem, se hoje ainda não praticou) */
  let streak=0;const d=new Date(hoje);if(!set.has(dia(d)))d.setDate(d.getDate()-1);while(set.has(dia(d))){streak++;d.setDate(d.getDate()-1)}
  /* alguma semana já cumpriu a meta? */
  const porSemana={};S.days.forEach(k=>{const [y,m,dd]=k.split("-").map(Number);const w=dia(segunda(new Date(y,m-1,dd,12)));porSemana[w]=(porSemana[w]||0)+1});
  const semanaOk=Object.values(porSemana).some(n=>n>=S.meta.dias);
  return{semana,feitos:fe,alvo:S.meta.dias,streak,semanaOk,dias:S.days}
};
CH.praticou=function(){
  const S=CH.store.state;S.days=S.days||[];const k=dia();
  if(!S.days.includes(k)){S.days.push(k);S.days=S.days.slice(-180);CH.store.save();return true}
  return false
};
CH.metaCard=function(){
  const m=CH.meta(),ok=m.feitos>=m.alvo;
  return `<section class="mt" aria-labelledby="mt-h">
    <p class="eyebrow">Meta da semana</p>
    <h2 class="h3" id="mt-h"><span class="tnum">${m.feitos}</span> de <span class="tnum">${m.alvo}</span> ${m.alvo===1?"dia":"dias"} de prática${ok?" ✓":""}</h2>
    <ol class="mt-dias" aria-label="Dias desta semana">${m.semana.map((x,i)=>`<li class="${x.feito?"on":""}${x.hoje?" hoje":""}"><i aria-hidden="true">${x.feito?icon("check","tiny"):""}</i><span>${"STQQSSD"[i]}</span><span class="sr">${["segunda","terça","quarta","quinta","sexta","sábado","domingo"][i]}${x.feito?", praticou":""}${x.hoje?", hoje":""}</span></li>`).join("")}</ol>
    <p class="mt-s muted">${m.streak>=2?`${m.streak} dias seguidos. `:""}Um dia conta quando você monta e assiste uma sequência.</p>
    <div class="mt-set" role="group" aria-label="Quantos dias por semana você quer praticar"><span>Minha meta:</span>${[1,2,3,4,5].map(n=>`<button type="button" data-meta="${n}" aria-pressed="${n===m.alvo}">${n}</button>`).join("")}<span>dias</span></div>
    <p class="mt-n muted">Fica guardado só neste aparelho. Se limpar os dados do navegador, a contagem recomeça.</p>
  </section>`;
};
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-meta]");if(!b)return;
  const S=CH.store.state;S.meta=S.meta||{dias:3};S.meta.dias=+b.dataset.meta;CH.store.save();
  const sec=b.closest(".mt");if(sec){const t=document.createElement("div");t.innerHTML=CH.metaCard();sec.replaceWith(t.firstElementChild);const nb=document.querySelector(`.mt [data-meta="${S.meta.dias}"]`);nb&&nb.focus()}
  CH.evoCheck&&CH.evoCheck();
});

/* ---------- ritual de conquista: animação + som (se ligado) ---------- */
function chime(){
  const pf=CH.store.prefs();if(!pf.fx)return;
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  try{const ctx=CH._ac||(CH._ac=new A());if(ctx.state==="suspended")ctx.resume();const t0=ctx.currentTime;
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=t0+i*.1;o.type="triangle";o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.8);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.85)});
    if(navigator.vibrate)navigator.vibrate([20,40,20])}catch(e){}
}
const fila=[];let aberto=false;
CH.ritual=function(r){if(window.CH_NO_CEL)return;fila.push(r);if(!aberto)proximo()};
function proximo(){
  const r=fila.shift();if(!r){aberto=false;return}
  aberto=true;chime();
  const d=document.createElement("dialog");d.className="rit";d.setAttribute("aria-labelledby","rit-t");
  d.innerHTML=`<div class="rit-in" style="--bc:${r.cor||"var(--y)"}"><div class="rit-burst" aria-hidden="true">${[...Array(14)].map((_,i)=>`<i style="--a:${i*360/14}deg;--d:${(i%3)*40}ms"></i>`).join("")}</div>
    <span class="rit-ic">${icon(r.ic||"spark")}</span><p class="eyebrow">${esc(r.tipo)}</p><h2 class="h2" id="rit-t">${esc(r.titulo)}</h2><p>${esc(r.sub||"")}</p>
    <button type="button" class="btn red" data-ok>Continuar${icon("next")}</button></div>`;
  const fim=()=>{try{d.close()}catch(e){}d.remove();proximo()};
  d.addEventListener("click",e=>{if(e.target.closest("[data-ok]"))fim()});d.addEventListener("cancel",e=>{e.preventDefault();fim()});
  document.body.append(d);try{d.showModal()}catch(e){d.setAttribute("open","")}
  const b=d.querySelector("[data-ok]");b&&b.focus();CH.say(r.tipo+": "+r.titulo,true);
}

/* ---------- tutorial de primeira vez ---------- */
const PASSOS=[
  {t:"Um filme é feito de muitos planos",d:"Cada plano é um pedaço filmado. Editar é decidir quais usar, em que ordem e por quanto tempo.",ic:"film"},
  {t:"Toque no + para montar",d:"O plano vai para a timeline, embaixo do vídeo. A ordem em que você coloca é a ordem em que a pessoa vê.",ic:"plus"},
  {t:"Assista, de verdade",d:"Toque no vídeo ou em Assistir. Só vendo a montagem inteira dá para sentir o que o corte faz.",ic:"play"},
  {t:"Aparar e cortar",d:"Toque num plano na timeline e arraste a barra verde (começo) ou a vermelha (fim) para encurtá-lo, como num app de vídeo.",ic:"scissors"},
  {t:"Veja o quanto falta",d:"A barra de porcentagem mostra o quanto você está perto do efeito. Quando chegar a 100%, a técnica ganha nome e você sobe de nível.",ic:"spark"}
];
CH.tour=function(){
  let i=0;const d=document.createElement("dialog");d.className="tour";d.setAttribute("aria-labelledby","tour-t");
  const draw=()=>{const p=PASSOS[i];d.innerHTML=`<div class="tour-in"><p class="eyebrow">Como usar · ${i+1} de ${PASSOS.length}</p><span class="tour-ic">${icon(p.ic)}</span><h2 class="h3" id="tour-t">${esc(p.t)}</h2><p>${esc(p.d)}</p>
    <div class="tour-dots" aria-hidden="true">${PASSOS.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
    <div class="tour-act"><button type="button" class="btn ghost" data-skip>Pular</button><button type="button" class="btn red" data-next>${i<PASSOS.length-1?"Próximo":"Começar"}${icon("next")}</button></div></div>`;
    d.querySelector("[data-next]").focus()};
  const close=()=>{CH.store.setSeen("tour");d.close();d.remove()};
  d.addEventListener("click",e=>{if(e.target.closest("[data-skip]"))return close();if(e.target.closest("[data-next]")){if(i<PASSOS.length-1){i++;draw()}else close()}});
  d.addEventListener("cancel",e=>{CH.store.setSeen("tour")});
  document.body.append(d);draw();try{d.showModal()}catch(e){d.setAttribute("open","")}
};
CH.tourSeNovo=function(){if(CH.store.onboarded()&&!CH.store.seen("tour"))setTimeout(()=>CH.tour(),700)};
})();
