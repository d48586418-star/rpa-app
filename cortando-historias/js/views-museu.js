/* views-museu.js — Museu da Edição: filmstrip de seleção (início e fim), salas por categoria, entradas em 3 profundidades */
(function(){
"use strict";
const CH=window.CH,{$,$$,esc,icon}=CH;
const M=()=>CH.data.museu;
CH.museuPorConceito=id=>M().linha.filter(e=>e.conc.includes(id));
CH.museuPorAtividade=id=>M().linha.filter(e=>e.ex.includes(id));
const fshort=e=>{const f=M().fontes[(e.fontes||[])[0]];return f?f[0].split(",")[0]:""};
const src=keys=>`<ul class="mu-src">${keys.map(k=>{const f=M().fontes[k];return f?(f[1]?`<li><a class="link" href="${f[1]}" target="_blank" rel="noopener">${esc(f[0])}</a></li>`:`<li>${esc(f[0])}</li>`):""}).join("")}</ul>`;
const chip=e=>`<a class="mu-chip" href="#/museu/${e.id}"><b>${esc(e.ano)}</b>${esc(e.t)}</a>`;
CH.museuLink=(ents,rot)=>ents&&ents.length?`<p class="mu-link"><span class="eyebrow">${rot||"No Museu da Edição"}</span>${ents.map(chip).join("")}</p>`:"";
/* imagem da entrada: arquivo da autora em assets/museu/<id>.jpg se existir; senão um plano do próprio laboratório; sempre em duotone */
/* Ilustrações próprias em duotone (sem plano algum das atividades). Para usar uma foto de domínio público no lugar,
   salve assets/museu/<id>.jpg e acrescente o id em "imgs" no data/museu.json (script em scripts/baixar-imagens-museu.js). */
const PAL={"duo-t":["#04201f","#6ee0d6"],"duo-a":["#2a1204","#ff9a3c"],"duo-b":["#0a1438","#7fb2f5"],"duo-g":["#07200f","#9be3b0"],"duo-m":["#2a0f2e","#e0a0d8"],"duo-y":["#161618","#e0b83a"],"duo-l":["#2a1208","#d9772b"],"duo-o":["#2a0a0c","#e0394a"],"duo-v":["#161618","#f0e3c8"],"duo-p":["#2a1214","#d98a8a"],"duo-k":["#121212","#eeeeee"]};
const frames=(x,y,n,w,h,g,fg,op)=>Array.from({length:n},(_,i)=>`<rect x="${x+i*(w+g)}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fg}" opacity="${op&&op[i]!=null?op[i]:1}"/>`).join("");
const MOTIF={
 tesouras:(f,c)=>`<g fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"><path d="M40 210 L360 90"/><path d="M40 90 L360 210"/><circle cx="62" cy="76" r="26"/><circle cx="62" cy="224" r="26"/></g><rect x="150" y="136" width="160" height="28" fill="${c}" opacity=".9"/>`,
 melies:(f,c)=>frames(36,100,3,96,100,16,f,[1,.55,.25])+`<path d="M60 230h280" stroke="${c}" stroke-width="6"/><circle cx="330" cy="70" r="26" fill="${c}"/>`,
 porter:(f,c)=>frames(30,70,4,78,70,12,f)+frames(30,170,4,78,70,12,c,[1,.6,1,.6]),
 griffith:(f,c)=>`<path d="M30 80 L370 150 M30 220 L370 150" stroke="${f}" stroke-width="9" fill="none"/><circle cx="370" cy="150" r="22" fill="${c}"/><rect x="30" y="64" width="54" height="34" fill="${c}"/><rect x="30" y="204" width="54" height="34" fill="${f}"/>`,
 kuleshov:(f,c)=>`<circle cx="105" cy="150" r="64" fill="${f}"/><circle cx="85" cy="138" r="7" fill="#121212"/><circle cx="125" cy="138" r="7" fill="#121212"/><path d="M82 176h46" stroke="#121212" stroke-width="6" stroke-linecap="round"/><g fill="none" stroke="${c}" stroke-width="7"><path d="M220 100q40 60 80 0z"/><rect x="226" y="164" width="76" height="30" rx="4"/><circle cx="262" cy="244" r="22"/></g>`,
 eisenstein:(f,c)=>`<rect x="30" y="90" width="120" height="120" fill="${f}"/><rect x="250" y="90" width="120" height="120" fill="${f}" opacity=".6"/><path d="M200 60l18 62 62 4-48 40 16 62-48-36-48 36 16-62-48-40 62-4z" fill="${c}"/>`,
 pudovkin:(f,c)=>`<g fill="${f}">${[0,1,2].map(i=>`<rect x="${40+i*104}" y="${200}" width="92" height="44" rx="3" fill="${i==1?c:f}"/>`).join("")}${[0,1].map(i=>`<rect x="${92+i*104}" y="150" width="92" height="44" rx="3"/>`).join("")}<rect x="144" y="100" width="92" height="44" rx="3" fill="${c}"/></g>`,
 vertov:(f,c)=>`<ellipse cx="200" cy="150" rx="150" ry="82" fill="none" stroke="${f}" stroke-width="8"/><circle cx="200" cy="150" r="50" fill="${c}"/><circle cx="200" cy="150" r="22" fill="#121212"/><circle cx="214" cy="136" r="7" fill="${f}"/>`,
 godard:(f,c)=>`<path d="M30 160h90l20-60 20 120 20-120 20 120 20-60h160" fill="none" stroke="${f}" stroke-width="8" stroke-linejoin="round"/><rect x="190" y="80" width="14" height="140" fill="${c}"/>`,
 lean:(f,c)=>`<rect x="40" y="130" width="120" height="14" fill="${f}"/><circle cx="160" cy="137" r="12" fill="${c}"/><path d="M200 150h30" stroke="${c}" stroke-width="5"/><circle cx="300" cy="150" r="58" fill="${c}"/><path d="M20 230h360" stroke="${f}" stroke-width="5"/>`,
 murch:(f,c)=>[51,23,10,7,5,4].map((v,i)=>`<rect x="40" y="${40+i*38}" width="${v*6}" height="24" rx="3" fill="${i==0?c:f}"/>`).join(""),
 jl:(f,c)=>frames(30,70,2,150,60,10,f,[1,.5])+`<path d="M30 190q20-40 40 0t40 0t40 0t40 0t40 0" fill="none" stroke="${c}" stroke-width="6"/><path d="M200 230q20-40 40 0t40 0t40 0t40 0" fill="none" stroke="${c}" stroke-width="6" opacity=".6"/>`
};
const art=e=>{const [bg,fg]=PAL[e.duo]||PAL["duo-k"],m=MOTIF[e.id];
  return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true"><rect width="400" height="300" fill="${bg}"/>${m?m("#f1f1f3",fg):""}</svg>`};
const img=(e,full)=>full&&(M().imgs||[]).includes(e.id)?`<img class="${e.duo}" src="assets/museu/${e.id}.jpg" alt="">`:art(e);
const yr=e=>e.y0;
const yrs=n=>n===1?"1 ano":n+" anos";


/* anatomia de uma timeline: ilustração própria com partes numeradas */
const PARTES=[
 ["Régua de tempo","Marca os segundos e quadros. É por ela que você sabe onde cada coisa acontece."],
 ["Cabeça de reprodução","A linha vermelha. Mostra o instante que aparece no monitor e é onde a tesoura corta."],
 ["Faixa de vídeo principal","Onde ficam os planos da cena, um depois do outro. A ordem aqui é a ordem que o público vê."],
 ["B-roll","Imagens de cobertura em uma faixa acima: mostram o que está sendo dito ou cobrem um corte sem tirar o som principal."],
 ["Clipe","Cada bloco é um pedaço de material. Seu comprimento é a duração do plano."],
 ["Corte","Onde um clipe termina e o seguinte começa. Cortar com a tesoura divide um clipe em dois, fatias que você pode mover ou apagar."],
 ["Faixa de áudio: voz","O som direto ou a fala. Pode ser separado da imagem, como no J-cut e no L-cut."],
 ["Faixa de áudio: ambiente e música","Sons de fundo e trilha. Dão clima e costuram um corte ao outro."]
];
const PCOR=["#2f5f9f","#a81020","#2c9460","#6b3f5f","#0f8b8d","#161618","#3b6fd0","#c0541a"];
const anatomia=()=>{
  const pt=(n,x,y)=>`<g data-p="${n}"><circle cx="${x}" cy="${y}" r="15" fill="${PCOR[n-1]}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${n}</text></g>`;
  const wave=(x,w,y,amp,c)=>{let p=`M${x} ${y}`;for(let i=0;i<w/6;i++)p+=`l3 ${(i%2?-1:1)*amp*(0.35+((i*37)%10)/14)}l3 ${(i%2?1:-1)*amp*(0.35+((i*37)%10)/14)}`;return `<path d="${p}" fill="none" stroke="${c}" stroke-width="2" opacity=".75"/>`};
  const lane=(y,h)=>`<rect x="0" y="${y}" width="820" height="${h}" rx="8" fill="#fff" fill-opacity=".34" stroke="#fff" stroke-opacity=".75"/>`;
  return `<svg class="an-svg" viewBox="0 0 900 380" role="img" aria-label="Ilustração de uma timeline com régua, cabeça de reprodução, faixa de vídeo, B-roll e duas faixas de áudio">
  
  <g transform="translate(40 24)">
   <g data-p="1"><rect width="820" height="30" rx="8" fill="#fff" fill-opacity=".34" stroke="#fff" stroke-opacity=".75"/><g stroke="#2f5f9f" stroke-width="1.5">${Array.from({length:42},(_,i)=>`<path d="M${i*20} ${i%5?20:12}V30"/>`).join("")}</g>
   <text x="6" y="14" font-size="11" fill="#1d3f70">00:00</text><text x="206" y="14" font-size="11" fill="#1d3f70">00:05</text><text x="406" y="14" font-size="11" fill="#1d3f70">00:10</text><text x="606" y="14" font-size="11" fill="#1d3f70">00:15</text></g>
   <g data-p="4"><text x="-34" y="86" font-size="12" font-weight="700" fill="#161618">V2</text>${lane(62,40)}<rect x="190" y="66" width="130" height="32" rx="5" fill="#6b3f5f"/><rect x="520" y="66" width="110" height="32" rx="5" fill="#0f8b8d"/></g>
   <g data-p="3"><text x="-34" y="146" font-size="12" font-weight="700" fill="#161618">V1</text>${lane(112,52)}<rect x="238" y="116" width="170" height="44" rx="5" fill="#a81020"/><rect x="412" y="116" width="200" height="44" rx="5" fill="#2c9460"/><rect x="616" y="116" width="200" height="44" rx="5" fill="#c0541a"/></g>
   <g data-p="5"><rect x="4" y="116" width="230" height="44" rx="5" fill="#2f5f9f"/></g>
   <g data-p="7"><text x="-34" y="206" font-size="12" font-weight="700" fill="#161618">A1</text>${lane(174,46)}<rect x="4" y="178" width="404" height="38" rx="5" fill="#cfe0f7"/>${wave(10,392,197,13,"#1d3f70")}<rect x="412" y="178" width="404" height="38" rx="5" fill="#f7d3c2"/>${wave(418,392,197,10,"#7a3410")}</g>
   <g data-p="8"><text x="-34" y="256" font-size="12" font-weight="700" fill="#161618">A2</text>${lane(230,40)}<rect x="4" y="234" width="812" height="32" rx="5" fill="#cfe9d6"/>${wave(10,800,250,7,"#1c5e3a")}</g>
   <g data-p="2"><path d="M408 30V282" stroke="#a81020" stroke-width="3"/><path d="M398 24h20l-10 14z" fill="#a81020"/></g>
   <g data-p="6" transform="translate(408 138)" fill="none" stroke="#161618" stroke-width="2.6" stroke-linecap="round"><circle cx="-9" cy="-9" r="4"/><circle cx="-9" cy="9" r="4"/><path d="M-6 -7 12 8M-6 7 12 -8"/></g>
  </g>
  ${pt(1,420,42)}${pt(2,470,54)}${pt(3,62,148)}${pt(4,330,100)}${pt(5,350,148)}${pt(6,278,200)}${pt(7,130,242)}${pt(8,130,300)}
  </svg>`};

CH.views.museu=function(root){
  const m=M(),L=m.linha,n=L.length;
  let a=0,b=n-1,cur=0,cat="todas";
  root.innerHTML=`
<div class="page museu">
  <header class="page-head"><h1 class="display mu-t" id="page-title" tabindex="-1">Museu da <b>Edição</b></h1>
  <p class="lead">Quem já cortou assim antes de você, e o que cada um descobriu.</p></header>

  <section class="anat" id="anatomia" aria-labelledby="an-h">
    <div class="an-head"><h2 class="h2" id="an-h">Antes da história: o que é <b>editar</b></h2>
      <div class="an-def">${CH.data.conceitos.fundamentos.filter(f=>f.id==="edicao"||f.id==="montagem").map(f=>`<article><h3 class="h4">${esc(f.t)}</h3><p class="an-i">${esc(f.ideia)}</p><p>${esc(f.entenda)}</p></article>`).join("")}</div></div>
    <figure class="an-fig">${anatomia()}<figcaption>Uma timeline de edição. As faixas de cima ficam sobre as de baixo; o tempo corre da esquerda para a direita.</figcaption></figure>
    <ol class="an-list">${PARTES.map((p,i)=>`<li data-p="${i+1}" tabindex="0" role="button" aria-label="Destacar na ilustração: ${esc(p[0])}"><span class="an-n" style="background:${PCOR[i]};color:#fff">${i+1}</span><div><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div></li>`).join("")}</ol>
  </section>

  <section class="clip" aria-labelledby="cl-h"><div class="cl-bg" id="cl-bg" aria-hidden="true"></div>
    <h2 class="sr" id="cl-h">Linha do tempo</h2>
    <div class="cl-view" id="cl-view" aria-live="polite"></div>
    <div class="cl-ctl">
      <div class="cl-read"><span class="cl-r in"><i></i>Início <b id="cl-a"></b></span><span class="cl-r dur" id="cl-d"></span><span class="cl-r out"><i></i>Até <b id="cl-b"></b></span></div>
      <div class="cl-strip" id="cl-strip" style="--n:${n}">
        <ol class="cl-frames">${L.map((e,i)=>`<li><button type="button" class="cl-f" data-i="${i}" aria-label="${esc(e.ano)}: ${esc(e.t)}">${img(e)}<span class="cl-y">${esc(e.ano)}</span></button></li>`).join("")}</ol>
        <div class="cl-dim l" id="cl-dl"></div><div class="cl-dim r" id="cl-dr"></div>
        <div class="cl-win" id="cl-win"></div>
        <button type="button" class="cl-h in" id="cl-hi" role="slider" aria-label="Início do período" aria-valuemin="0" aria-valuemax="${n-1}"><i></i></button>
        <button type="button" class="cl-h out" id="cl-ho" role="slider" aria-label="Até quando (o período vai até hoje no fim da linha)" aria-valuemin="0" aria-valuemax="${n-1}"><i></i></button>
      </div>
    </div>
  </section>

  <nav class="mu-cats seg" aria-label="Salas do museu"><button type="button" aria-pressed="true" data-c="todas">Todas</button>${m.cats.map(c=>`<button type="button" aria-pressed="false" data-c="${c.id}">${esc(c.t)}</button>`).join("")}</nav>
  <div id="mu-rooms"></div>

  <section class="mu-murch" aria-labelledby="mu-m"><h2 class="h2" id="mu-m">Seis perguntas de <b>Walter Murch</b></h2>
  <p class="lead">${esc(m.murch_intro)}</p>
  <ol class="mm">${m.murch.map(k=>`<li style="--w:${parseInt(k.p)}"><span class="mm-n">${k.n}</span><span class="mm-b"><i></i></span><b>${esc(k.t)}</b><em>${k.p}</em><span class="mm-q">${esc(k.q)}</span><span class="mm-e">${esc(k.e)}</span><span class="mm-x"><b>Na prática.</b> ${esc(k.x)}</span></li>`).join("")}</ol>
  <p class="mu-note muted">Obra original: Walter Murch, <i>In the Blink of an Eye</i> (2ª ed., Silman-James Press, 2001); em português, <i>Num piscar de olhos</i> (Jorge Zahar, 2004). <a class="link" href="${m.murch_link[1]}" target="_blank" rel="noopener">Sumário na Biblioteca do Congresso</a>.</p>
  <div class="wrap"><a class="btn ink" href="#/lab/EX_MURCH_001">Experimentar com Murch${icon("next")}</a></div></section>

  <section class="mu-ppl-s" aria-labelledby="mu-p"><h2 class="h2" id="mu-p">Montadoras e montadores</h2>
  <ul class="mu-ppl">${m.montadoras.map(p=>`<li><b>${esc(p.nome)}</b><span class="mu-o">${esc(p.obra)}</span><span>${esc(p.nota)}</span>${p.link?`<a class="link" href="${p.link[1]}" target="_blank" rel="noopener">${esc(p.link[0])}</a>`:""}</li>`).join("")}</ul></section>
  ${m.paraver?`<section aria-labelledby="mu-v"><h2 class="h3" id="mu-v">${esc(m.paraver.titulo)}</h2><p class="muted">${esc(m.paraver.nota)} <a class="link" href="${m.paraver.link[1]}" target="_blank" rel="noopener">${esc(m.paraver.link[0])}</a></p><ul class="mu-ppl">${m.paraver.filmes.map(f=>`<li><b>${esc(f)}</b></li>`).join("")}</ul></section>`:""}
  <p class="mu-note muted">${esc(m.fonte)}</p>
</div>`;

  if(CH.irPara){const id=CH.irPara;CH.irPara=null;setTimeout(()=>{const t=$("#"+id,root);t&&t.scrollIntoView({behavior:"smooth",block:"start"})},120)}
  const svg=$(".an-svg",root);
  function destaca(n){$$("[data-p]",root).forEach(x=>x.classList.remove("on"));svg.classList.remove("foco");void svg.getBoundingClientRect();
    $$(`[data-p="${n}"]`,root).forEach(x=>x.classList.add("on"));svg.classList.add("foco")}
  $(".an-list",root).addEventListener("click",e=>{const li=e.target.closest("li[data-p]");if(li)destaca(li.dataset.p)});
  $(".an-list",root).addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const li=e.target.closest("li[data-p]");if(li){e.preventDefault();destaca(li.dataset.p)}}});
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-p]");if(g)destaca(g.dataset.p)});
  const strip=$("#cl-strip",root),fr=$$(".cl-f",root),view=$("#cl-view",root),rooms=$("#mu-rooms",root);
  const pos=i=>i/n*100;
  function paintView(){
    const e=L[cur],c=m.cats.find(x=>x.id===e.cat);
    view.innerHTML=`<a class="cl-card" href="#/museu/${e.id}"><span class="cl-img">${img(e)}</span>
      <span class="cl-tx"><span class="cl-ano">${esc(e.ano)}</span><b class="display cl-tt">${esc(e.t)}</b><span class="cl-qm">${esc(e.quem)}</span><span class="cl-n1">${esc(e.n1)}</span>${fshort(e)?`<span class="cl-fonte">Fonte: ${esc(fshort(e))}</span>`:""}<span class="cl-go btn ink sm">Abrir a parada${icon("next")}</span></span></a>`;
    const bg=$("#cl-bg",root);if(bg)bg.innerHTML=art(e);
    fr.forEach((f,i)=>f.classList.toggle("cur",i===cur));
  }
  function paintRange(){
    $("#cl-win",root).style.cssText=`left:${pos(a)}%;width:${pos(b-a+1)}%`;
    $("#cl-dl",root).style.width=pos(a)+"%";$("#cl-dr",root).style.width=(100-pos(b+1))+"%";
    $("#cl-hi",root).style.left=pos(a)+"%";$("#cl-ho",root).style.left=pos(b+1)+"%";
    $("#cl-hi",root).setAttribute("aria-valuenow",a);$("#cl-ho",root).setAttribute("aria-valuenow",b);
    $("#cl-hi",root).setAttribute("aria-valuetext",L[a].ano+": "+L[a].t);$("#cl-ho",root).setAttribute("aria-valuetext",L[b].ano+": "+L[b].t);
    $("#cl-a",root).textContent=L[a].ano;$("#cl-b",root).textContent=b===n-1?"hoje":L[b].ano;
    const span=yr(L[b])-yr(L[a]);$("#cl-d",root).textContent=a===b?"1 parada":(b-a+1)+" paradas, "+yrs(span);
    fr.forEach((f,i)=>f.classList.toggle("off",i<a||i>b));
    if(cur<a||cur>b){cur=Math.min(Math.max(cur,a),b);paintView()}
    paintRooms();
  }
  function paintRooms(){
    const vis=L.map((e,i)=>({e,i})).filter(x=>x.i>=a&&x.i<=b&&(cat==="todas"||x.e.cat===cat));
    rooms.innerHTML=m.cats.map((c,ci)=>{
      const es=vis.filter(x=>x.e.cat===c.id);if(!es.length)return"";
      return `<section class="room rm${ci+1}" aria-labelledby="rm-${c.id}"><header><span class="rm-n">${ci+1}</span><div><h2 class="h2" id="rm-${c.id}">${esc(c.t)}</h2><p>${esc(c.d)}</p></div></header>
      <ul class="rm-l">${es.map(({e})=>`<li><a href="#/museu/${e.id}"><span class="rm-i">${img(e)}</span><span class="rm-y">${esc(e.ano)}</span><b>${esc(e.t)}</b><span class="rm-q">${esc(e.quem)}</span><span class="rm-t">${esc(e.n1)}</span>${fshort(e)?`<span class="rm-f">Fonte: ${esc(fshort(e))}</span>`:""}</a></li>`).join("")}</ul></section>`}).join("")||`<p class="empty">Nenhuma parada neste recorte. Alargue o período ou escolha outra sala.</p>`;
  }
  /* arrastar as pontas */
  const idxAt=(x,round)=>{const r=strip.getBoundingClientRect(),t=Math.min(1,Math.max(0,(x-r.left)/r.width))*n;return t};
  [["#cl-hi","a"],["#cl-ho","b"]].forEach(([sel,k])=>{
    const el=$(sel,root);
    el.addEventListener("pointerdown",ev=>{
      ev.preventDefault();el.setPointerCapture(ev.pointerId);el.classList.add("drag");
      const mv=e2=>{const t=idxAt(e2.clientX);
        if(k==="a")a=Math.max(0,Math.min(b,Math.round(t)));else b=Math.min(n-1,Math.max(a,Math.round(t)-1));paintRange()};
      const up=()=>{el.classList.remove("drag");el.removeEventListener("pointermove",mv);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up)};
      el.addEventListener("pointermove",mv);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
    });
    el.addEventListener("keydown",ev=>{
      const d=ev.key==="ArrowLeft"||ev.key==="ArrowDown"?-1:ev.key==="ArrowRight"||ev.key==="ArrowUp"?1:0;if(!d)return;ev.preventDefault();
      if(k==="a")a=Math.max(0,Math.min(b,a+d));else b=Math.min(n-1,Math.max(a,b+d));paintRange();el.focus()});
  });
  fr.forEach(f=>f.addEventListener("click",()=>{const i=+f.dataset.i;if(i<a)a=i;if(i>b)b=i;cur=i;paintView();paintRange()}));
  $$(".mu-cats button",root).forEach(btn=>btn.addEventListener("click",()=>{cat=btn.dataset.c;$$(".mu-cats button",root).forEach(x=>x.setAttribute("aria-pressed",x===btn));paintRooms()}));
  paintView();paintRange();
  return{title:"Museu da Edição"};
};

CH.views.museuItem=function(root,id){
  const m=M(),i=m.linha.findIndex(e=>e.id===id),e=m.linha[i];
  if(!e){root.innerHTML=`<div class="page"><h1 class="h2" id="page-title">Não encontrado</h1><a class="link" href="#/museu">Voltar ao Museu</a></div>`;return{title:"Museu"}}
  const pv=m.linha[i-1],nx=m.linha[i+1],c=m.cats.find(x=>x.id===e.cat);
  root.innerHTML=`
<div class="page museu-i">
  <a class="back" href="#/museu">${icon("back")}Museu da Edição</a>
  <article class="mi">
    <figure class="mi-fig">${img(e,true)}<figcaption class="glass-dk"><b>${esc(e.ano)}</b>${esc(c?c.t:"")}${(M().imgs||[]).includes(e.id)?`<small class="mu-foto">Foto: imagem da internet</small>`:""}</figcaption></figure>
    <div class="mi-tx">
      <header class="page-head"><span class="eyebrow">${esc(e.quem)}</span><h1 class="display mi-t" id="page-title" tabindex="-1">${esc(e.t)}</h1><p class="lead">${esc(e.n1)}</p></header>
      <section class="cblock"><h2 class="h4">Em um parágrafo</h2><p class="c-ent">${esc(e.n2)}</p></section>
      <section class="cblock"><details class="mu-deep"><summary>Aprofundar</summary><p class="c-ent">${esc(e.n3)}</p>
        ${e.div?`<p class="mu-div"><b>Vale saber.</b> ${esc(e.div)}</p>`:""}</details></section>
      <section class="cblock mu-fonte" aria-labelledby="mf-h"><h2 class="h4" id="mf-h">De onde vem esta parada</h2>
        <h3 class="mu-fh">Obras originais</h3><ul class="mu-src">${(e.orig||[]).map(o=>`<li>${esc(o)}</li>`).join("")}</ul>
        <h3 class="mu-fh">Leituras de apoio</h3>${src(e.fontes)}</section>
      <section class="cblock"><h2 class="h4">Experimente</h2><div class="wrap">${e.ex.filter(x=>CH.ACT[x]).map(x=>`<a class="btn ink" href="#/lab/${x}">${esc(CH.ACT[x].t)}${icon("next")}</a>`).join("")}</div></section>
      ${e.conc.length?`<section class="cblock"><h2 class="h4">Conceitos ligados</h2><div class="wrap">${e.conc.filter(x=>CH.CONC[x]).map(x=>`<a class="btn" href="#/conceito/${x}">${esc(CH.CONC[x].t)}</a>`).join("")}</div></section>`:""}
    </div>
  </article>
  <nav class="mu-pn" aria-label="Outras paradas">${pv?`<a class="btn ghost" href="#/museu/${pv.id}">${icon("back")}${esc(pv.ano)}</a>`:"<span></span>"}${nx?`<a class="btn ghost" href="#/museu/${nx.id}">${esc(nx.ano)}${icon("next")}</a>`:""}</nav>
</div>`;
  return{title:e.t};
};
})();
