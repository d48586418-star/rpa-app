/* views-lab.js — rota do Laboratório + tela "Sinta a diferença" */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,fmt,icon}=CH;
CH.views=CH.views||{};

CH.views.lab=function(root,exId){
  if(!CH.ACT[exId]){root.innerHTML=`<div class="page"><h1 class="h2" id="page-title">Atividade não encontrada</h1><p class="lead"><a class="link" href="#/percurso">Voltar ao percurso</a></p></div>`;return{title:"Não encontrada"}}
  const lab=new CH.Lab(root,exId);
  CH.labInstance=lab;
  return{title:CH.ACT[exId].t,destroy(){lab.destroy();CH.labInstance=null}};
};

/* ---------------- Sinta a diferença (jump cut × elipse — sem dar o nome antes) ---------------- */
CH.views.contraste=function(root){
  const SA=CH.referenceSeq("EX_JUMPCUT_NL01"),SB=CH.referenceSeq("EX_ELIPSE_NL01");
  const tA=CH.TK.NL_047,tB=CH.TK.NL_006;
  const saved=(CH.store.state.contraste)||{};
  root.innerHTML=`
<div class="page contrast-pg">
  <a class="back" href="#/percurso">${icon("back")}Jornada</a>
  <header class="page-head">
    <span class="eyebrow">Etapa 3: Manipular o tempo</span>
    <h1 class="h2" id="page-title" tabindex="-1">Dois cortes, dois efeitos</h1>
    <p class="lead">Nas duas montagens abaixo, o mesmo gesto: um trecho do meio de um plano foi removido. Assista às duas e compare o que cada uma faz com você.</p>
  </header>
  <div class="cmp-grid ct-grid">
    ${[["A",tA,"O salto"],["B",tB,"O tempo que sumiu"]].map(([s,t,n])=>`<section class="cmp-col" data-s="${s}"><div class="cmp-top"><span class="cmp-l">${s}</span><span class="ct-src">de <b>${n}</b></span></div>${CH.monitorHTML(t.ar)}<p class="cmp-info mono tnum" data-info></p><p class="muted ct-desc">Plano original: ${esc(t.s)}. ${s==="B"?"Alguém entra na água e caminha pelo rio.":""}</p></section>`).join("")}
  </div>
  <div class="cmp-ctl"><button class="btn ink" type="button" id="c-play">${icon("play")}<span>Assistir as duas</span></button><button class="btn ghost" type="button" id="c-stop">${icon("stop")}Parar</button></div>

  <section class="ct-q" aria-labelledby="ctq-h">
    <h2 class="h3" id="ctq-h">Em qual delas você sentiu o corte na própria imagem?</h2>
    <p class="muted">Não existe resposta certa. Importa o que você sentiu.</p>
    <div class="ct-opts" role="radiogroup" aria-labelledby="ctq-h">
      ${[["A","Na A"],["B","Na B"],["AB","Nas duas"],["N","Em nenhuma"]].map(([v,l])=>`<label class="q-opt${saved.q===v?" on":""}"><input type="radio" name="ctq" value="${v}" ${saved.q===v?"checked":""}><span>${l}</span></label>`).join("")}
    </div>
  </section>

  <section class="ct-reveal" id="ct-reveal" ${saved.q?"":"hidden"} aria-live="polite">
    <p class="lead">O mesmo gesto técnico, duas perguntas diferentes.</p>
    <div class="ct-def">
      <article style="--dc:var(--laranja)"><span class="eyebrow">Pergunta da imagem</span><h3 class="display">Jump cut</h3><p><b>O que aconteceu com a imagem quando o trecho saiu?</b> Ela deu um salto: a continuidade do quadro se quebrou e o corte apareceu.</p></article>
      <article style="--dc:var(--lilas)"><span class="eyebrow">Pergunta do tempo</span><h3 class="display">Elipse</h3><p><b>Quanto tempo da ação desapareceu?</b> Você não viu esse tempo passar, mas entendeu que ele passou. O que fica é a passagem do tempo.</p></article>
    </div>
    <div class="fld"><label class="fld-l" for="ct-txt">Com suas palavras: quando um pedaço removido vira salto na imagem, e quando vira passagem de tempo?</label><textarea id="ct-txt" rows="3" maxlength="600">${esc(saved.txt||"")}</textarea><button class="btn sm" type="button" id="ct-save">${icon("pencil")}Guardar no Caderno</button></div>
    <p class="ct-next"><b>Agora volte e experimente:</b></p>
    <div class="wrap">${["EX_JUMPCUT_NL01","EX_ELIPSE_NL01","EX_CORTE_002"].map(id=>`<a class="btn sm" href="#/lab/${id}">${esc(CH.ACT[id].t)}${icon("next")}</a>`).join("")}</div>
  </section>
</div>`;
  const pl={};
  ["A","B"].forEach(s=>{
    const col=$(`[data-s="${s}"]`,root);
    const p=new CH.SeqPlayer($(".monitor",col),{onTime:t=>{$(".mv-tc",col).textContent=fmt(t)+" / "+fmt(p.total)}});
    p.setSeq(s==="A"?SA:SB);pl[s]=p;$("[data-info]",col).textContent=(s==="A"?SA:SB).length+" trechos, "+CH.total(s==="A"?SA:SB).toFixed(1)+" s";
  });
  const orA=pl.A.o.onEnd;pl.A.o.onEnd=()=>{orA&&orA();pl.B.play(0)};
  $("#c-play",root).onclick=()=>{pl.A.stop(true);pl.B.stop(true);pl.A.play(0)};
  $("#c-stop",root).onclick=()=>{pl.A.pause();pl.B.pause()};
  root.addEventListener("change",e=>{
    if(e.target.name!=="ctq")return;
    CH.store.state.contraste=Object.assign(CH.store.state.contraste||{},{q:e.target.value});CH.store.save();
    $$(".ct-opts .q-opt",root).forEach(l=>l.classList.toggle("on",l.querySelector("input").checked));
    $("#ct-reveal",root).hidden=false;
  });
  $("#ct-save",root).onclick=()=>{
    const t=$("#ct-txt",root).value.trim();if(!t)return CH.toast("Escreva pelo menos uma frase para guardar.");
    CH.store.state.contraste=Object.assign(CH.store.state.contraste||{},{txt:t});CH.store.save();
    CH.store.addNote({kind:"comparacao",exId:"EX_ELIPSE_NL01",text:"Jump cut × elipse — "+t});CH.toast("Guardado no Caderno.");
  };
  return{title:"Tirar um pedaço do meio",destroy(){Object.values(pl).forEach(p=>p.destroy())}};
};
})();
