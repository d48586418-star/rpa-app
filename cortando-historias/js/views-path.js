/* views-path.js — Sua jornada: folha de contato, etapas (atos), subnavegação Jornada, Descobertas, O que é edição? */
(function(){
"use strict";
const CH=window.CH,{h,$,$$,esc,icon}=CH;
CH.views=CH.views||{};

CH.subnav=active=>`<nav class="subnav" aria-label="Seções da jornada">
  ${[["percurso","#/percurso","Jornada"],["descobertas","#/descobertas","Descobertas"]].map(([k,href,l])=>`<a href="${href}"${k===active?' aria-current="page"':""}>${l}</a>`).join("")}</nav>`;

CH.allActs=()=>{const a=[];CH.data.atos.atos.forEach(x=>CH.atividadesDoAto(x).forEach(i=>a.push(i)));return a};

CH.views.path=function(root){
  const all=CH.allActs();
  const prog=Object.fromEntries(all.map(i=>[i,CH.progress(i)]));
  const n2=all.filter(i=>prog[i].nivel>=2).length,n3=all.filter(i=>prog[i].nivel>=3).length,n1=all.filter(i=>prog[i].nivel>=1).length;
  const last=CH.store.state.last,lastOk=last&&CH.ACT[last.exId]&&last.exId!==CH.LIVRE;
  const cont=lastOk?last.exId:CH.nextActivity();
  const frase=n2===0?"Você ainda não descobriu nenhuma técnica. A primeira está a um plano de distância."
    :n2===all.length?"Você reconheceu todas as decisões de montagem deste percurso. Agora, as escolhas são suas."
    :`Você já reconhece ${n2} de ${all.length} decisões de montagem.`;
  root.innerHTML=`
<div class="page path">
  ${CH.subnav("percurso")}
  <header class="page-head">
    <span class="eyebrow">Sua jornada</span>
    <h1 class="h2" id="page-title" tabindex="-1">Você está aprendendo a olhar como editor.</h1>
    <p class="lead">${esc(frase)}</p>
    ${cont?`<div class="wrap"><a class="btn ink lg" href="#/lab/${cont}">${lastOk?"Continuar":"Começar"}: ${esc(CH.ACT[cont].t)}${icon("next")}</a></div>`:`<div class="wrap"><a class="btn ink lg" href="#/livre">Ir para o laboratório livre${icon("next")}</a></div>`}
  </header>

  <section class="contact" aria-labelledby="ct-h">
    <div class="contact-top"><h2 class="h4" id="ct-h">Folha de contato</h2><span class="mono">${n1} experimentadas, ${n2} descobertas, ${n3} aprofundadas</span></div>
    <ol class="contact-strip" aria-label="Fotogramas por atividade">
      ${all.map(id=>`<li><a href="#/lab/${id}" title="${esc(CH.ACT[id].t)}">${CH.fotograma(id,prog[id].nivel)}</a></li>`).join("")}
    </ol>
    <p class="legend mono"><span><i class="lg0"></i>a revelar</span><span><i class="lg1"></i>experimentou</span><span><i class="lg2"></i>descobriu</span><span><i class="lg3"></i>aprofundou</span></p>
  </section>

  <div id="atos" class="stages">
  ${CH.data.atos.atos.map(a=>{
    const ids=CH.atividadesDoAto(a),dn=ids.filter(i=>prog[i].nivel>=2).length;
    return `<section class="stage" style="--ac:${a.cor}" aria-labelledby="ato-${a.n}">
      <div class="stage-node" aria-hidden="true"><i></i></div>
      <header class="stage-h"><span class="eyebrow">Etapa ${a.n}, ${dn} de ${ids.length}</span><h2 class="display stage-v" id="ato-${a.n}">${esc(a.verbo)}</h2><p class="stage-q">${esc(a.pergunta)}</p></header>
      <ol class="acts">
        ${ids.map((id,k)=>{const ex=CH.ACT[id],pr=prog[id],c=pr.disc[0],cu=(CH.didatica(id)||{}).curto||"",NV=["Nova","Experimentou","Descobriu","Aprofundou"];
          return `<li class="act${id===cont?" next":""}"><a href="#/lab/${id}" aria-label="${esc(ex.t)}. ${esc(cu)} ${NV[pr.nivel]}${id===cont?", próxima":""}"><span class="act-fr">${CH.fotograma(id,pr.nivel)}</span>
            <span class="act-tx"><span class="act-top"><span class="act-lv">${esc(CH.EXF[id].difficulty)}</span>${id===cont?`<span class="act-nx">Próxima</span>`:""}</span><b>${esc(ex.t)}</b>${cu?`<span class="act-obj">${esc(cu)}</span>`:""}
            <span class="act-bar" aria-hidden="true" style="--f:${pr.nivel/3}"><i></i></span><span class="act-st" data-n="${pr.nivel}">${c?esc(c):NV[pr.nivel]}</span></span></a></li>`}).join("")}
      </ol>
      ${a.n===3?`<a class="note-link" href="#/contraste"><span class="eyebrow">Para sentir a diferença</span><b>Dois cortes, dois efeitos</b><span>Veja duas montagens lado a lado e diga o que percebeu.</span></a>`:""}
    </section>`}).join("")}
    <section class="stage stage-livre" style="--ac:#0b0b0b">
      <div class="stage-node" aria-hidden="true"><i></i></div>
      <header class="stage-h"><span class="eyebrow">Por último</span><h2 class="display stage-v">Criar</h2><p class="stage-q">Agora é o seu laboratório.</p></header>
      <a class="note-link" href="#/livre"><span class="eyebrow">Sem meta, sem prova</span><b>Laboratório livre</b><span>Escolha planos de qualquer filme e monte o que quiser.</span></a>
    </section>
  </div>
</div>`;
  return{title:"Sua jornada"};
};
})();
