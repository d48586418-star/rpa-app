/* views-learn.js — Biblioteca de descobertas, conceitos, "O que é edição?" — a teoria como extensão da prática */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,icon}=CH;
CH.views=CH.views||{};

const found=()=>CH.store.discoveries();
function conceptOpen(c){const d=found();return c.aliases.some(a=>Object.keys(d).some(k=>k.toLowerCase()===a.toLowerCase()))}
CH.conceptOpen=conceptOpen;
function thumb(id,duo,alt){const t=CH.TK[id];return t?`<img class="${duo||""}" src="${t.th}" alt="${esc(alt||"")}" loading="lazy" width="320" height="240">`:""}
function veja(ids,autoplay){
  return `<div class="veja">${ids.filter(i=>CH.TK[i]).slice(0,2).map(id=>{const t=CH.TK[id];
    return `<figure class="veja-f"><div class="veja-m" style="--ar:${CH.ratioCss(t.ar)}">${CH.webm&&t.vid?`<video ${autoplay?"data-auto":""} muted loop playsinline preload="metadata" poster="${t.th}" src="${CH.vurl(t)}" aria-label="${esc(t.s)}"></video>`:`<img src="${t.th}" alt="${esc(t.s)}">`}</div><figcaption class="mono">${esc(t.s)}</figcaption></figure>`}).join("")}</div>`;
}
function cartilhaLine(kind,id){
  const c=CH.naCartilha(kind,id);
  return `<p class="na-cart">${icon("book")}<span><b>Na cartilha</b>, ${esc(c.texto)}</span>${c.href?`<a class="btn sm ghost" href="${esc(c.href)}" target="_blank" rel="noopener">Abrir a cartilha</a>`:""}</p>`;
}
CH.cartilhaLine=()=>"";

/* ---------------- Biblioteca de descobertas ---------------- */
CH.views.discoveries=function(root){
  const C=CH.data.conceitos,open=C.conceitos.filter(conceptOpen),n=C.conceitos.length;
  root.innerHTML=`
<div class="page libpg">
  ${CH.subnav("descobertas")}
  <header class="page-head"><span class="eyebrow">Biblioteca de descobertas</span><h1 class="h2" id="page-title" tabindex="-1">${open.length?`${open.length} de ${n} ${n===1?"descoberta":"descobertas"}`:"O que você vai descobrir"}</h1>
  <p class="lead">Cada técnica só ganha nome depois que você a experimenta. Até lá, ela aparece como uma pista.</p></header>
  <ul class="cgrid">
    ${C.conceitos.map(c=>{const on=conceptOpen(c),ex=CH.ACT[c.exp[0]],t=CH.TK[ex.pool[0]],ato=D_ato(c.ato);
      return on?`<li><a class="ccard on" href="#/conceito/${c.id}" style="--ac:${ato.cor}"><span class="cc-img ${ato.duo}">${thumb(ex.pool[0],"",t.s)}</span><span class="eyebrow">Etapa ${c.ato}: ${esc(ato.verbo)}</span><b class="display cc-t">${esc(c.t)}</b><span class="cc-i">${esc(c.ideia)}</span></a></li>`
      :`<li><a class="ccard off" href="#/conceito/${c.id}" style="--ac:${ato.cor}"><span class="cc-img duo-k">${thumb(ex.pool[0],"","")}</span><span class="eyebrow">Etapa ${c.ato}: ${esc(ato.verbo)}</span><b class="display cc-t" aria-label="Descoberta ainda escondida">?</b><span class="cc-i">Experimente <b>${esc(ex.t)}</b> para revelar.</span></a></li>`}).join("")}
  </ul>
  <section class="quem-wrap" aria-labelledby="qm-h"><h2 class="h3" id="qm-h">Quem foi?</h2>
    <p class="muted">Pessoas por trás do que você acabou de fazer.</p>
    <div class="quem-grid">${Object.entries(C.quem).map(([k,q])=>quemCard(k,q)).join("")}</div></section>
</div>`;
  return{title:"Descobertas",destroy(){}};
};
function D_ato(n){return CH.data.atos.atos.find(a=>a.n===n)}
/* fonte visível, em fonte pequena: nome do site + link; o que não tem origem verificada é marcado como "texto do projeto" */
function fonteLn(keys,txt){const f=(CH.data.museu&&CH.data.museu.fontes)||{};const li=(keys||[]).map(k=>f[k]).filter(Boolean).map(x=>`<a class="link" href="${x[1]}" target="_blank" rel="noopener">${esc(x[0])}</a>`);return `<p class="fonte-ln">Fonte: ${li.join("; ")}${li.length&&txt?" · ":""}${txt?esc(txt):""}</p>`}
CH.fonteLn=fonteLn;
const FQ={kuleshov:["klass","sstripe"],murch:["murch"]};
function quemCard(k,q){
  const cc=CH.data.conceitos.conceitos.find(c=>c.quem===k),on=cc&&conceptOpen(cc),ini=q.nome.split(" ").map(x=>x[0]).join("").slice(0,2);
  return `<article class="quem"><div class="quem-plate" aria-hidden="true"><b class="display">${esc(ini)}</b><span class="mono">${esc(q.anos)}</span></div>
    <div class="quem-tx"><b class="h4">${esc(q.nome)}</b><span class="eyebrow">${esc(q.papel)}</span><p>${esc(q.frase)}</p><p class="quem-rel"><b>E você?</b> ${esc(q.relacao)}</p>${fonteLn(FQ[k],"resumo escrito pelo projeto")}
    ${cc?`<a class="btn sm" href="#/lab/${cc.exp[0]}">${on?"Experimentar de novo":"Experimentar"}${icon("next")}</a>`:""}</div></article>`;
}

/* ---------------- Conceito ---------------- */
CH.views.concept=function(root,id){
  const c=CH.CONC[id];
  if(!c){root.innerHTML=`<div class="page"><h1 class="h2" id="page-title">Descoberta não encontrada</h1><p class="lead"><a class="link" href="#/descobertas">Voltar à biblioteca</a></p></div>`;return{title:"Não encontrada"}}
  const on=conceptOpen(c),ato=D_ato(c.ato),peek=sessionStorage.getItem("ch:peek:"+id)==="1";
  const ex=c.exp.map(i=>CH.ACT[i]).filter(Boolean);
  if(!on&&!peek){
    root.innerHTML=`<div class="page concept locked"><a class="back" href="#/descobertas">${icon("back")}Descobertas</a>
      <header class="page-head"><span class="eyebrow">Etapa ${c.ato}: ${esc(ato.verbo)}</span><h1 class="h2" id="page-title" tabindex="-1">Ainda escondida.</h1>
      <p class="lead">Esta técnica ganha nome depois que você a experimenta. Que tal começar por <b>${esc(ex[0].t)}</b>?</p></header>
      <div class="wrap"><a class="btn ink lg" href="#/lab/${ex[0].id}">Experimentar${icon("next")}</a><button class="btn ghost lg" type="button" id="peek">Ver mesmo assim</button></div></div>`;
    $("#peek",root).onclick=()=>{sessionStorage.setItem("ch:peek:"+id,"1");CH.views.concept(clearEl(root),id);CH.scroll&&CH.scroll.init(root)};
    return{title:"Descoberta escondida"};
  }
  const q=c.quem&&CH.data.conceitos.quem[c.quem];
  root.innerHTML=`
<div class="page concept" style="--ac:${ato.cor}">
  <a class="back" href="#/descobertas">${icon("back")}Descobertas</a>
  <header class="page-head"><span class="eyebrow">Etapa ${c.ato}: ${esc(ato.verbo)}${on?"":", prévia"}</span><h1 class="display concept-t" id="page-title" tabindex="-1">${esc(c.t)}</h1>
    <p class="concept-i">${esc(c.ideia)}</p></header>
  <section class="cblock"><span class="eyebrow">Veja</span>${veja(ex[0].pool,true)}</section>
  <section class="cblock"><span class="eyebrow">Entenda</span><p class="c-ent">${esc(c.entenda)}</p>
    ${c.criterios?`<ol class="crit">${c.criterios.map((k,i)=>`<li><span class="mono">${i+1}</span>${esc(k)}</li>`).join("")}</ol><p class="muted crit-n">Uma ordem de perguntas para decidir o corte. Não é uma regra para obedecer.</p>`:""}</section>
  ${fonteLn(c.quem?FQ[c.quem]:[],"texto do projeto, escrito para o laboratório")}<section class="cblock"><span class="eyebrow">Experimente</span><div class="wrap">${ex.map(a=>`<a class="btn ink" href="#/lab/${a.id}">${esc(a.t)}${icon("next")}</a>`).join("")}</div></section>
    ${CH.museuLink(CH.museuPorConceito(c.id))?`<section class="cblock">${CH.museuLink(CH.museuPorConceito(c.id))}</section>`:""}
  ${q?`<section class="cblock"><span class="eyebrow">Quem foi?</span>${quemCard(c.quem,q)}</section>`:""}
</div>`;
  CH.scroll.init(root);
  return{title:c.t,destroy(){CH.scroll.teardown()}};
};
function clearEl(el){el.innerHTML="";return el}

/* ---------------- O que é edição? ---------------- */
CH.views.edicao=function(root){
  const F=CH.data.conceitos.fundamentos,first=CH.allActs()[0];
  root.innerHTML=`
<div class="page edicao">
  ${CH.subnav("edicao")}
  <header class="page-head"><span class="eyebrow">O que é edição?</span><h1 class="h2" id="page-title" tabindex="-1">Antes de montar</h1>
  <p class="lead">Quatro ideias para começar. Um filme é feito de muitas imagens, e editar é decidir o que fazer com elas.</p></header>
  <div class="fund">${F.map((f,i)=>`<section class="fund-i" aria-labelledby="f-${f.id}"><span class="fund-n mono">0${i+1}</span>
    <div class="fund-tx"><h2 class="h3" id="f-${f.id}">${esc(f.t)}</h2><p class="fund-ideia display">${esc(f.ideia)}</p><p class="c-ent">${esc(f.entenda)}</p></div>${veja(f.veja,true)}</section>`).join("")}</div>
  <div class="wrap fund-cta"><a class="btn ink lg" href="#/lab/${first}">Experimentar agora${icon("next")}</a><a class="btn ghost lg" href="#/descobertas">Ver descobertas</a></div>
  ${fonteLn([],"texto do projeto, escrito para o laboratório")}
</div>`;
  CH.scroll.init(root);
  return{title:"O que é edição?",destroy(){CH.scroll.teardown()}};
};
})();
