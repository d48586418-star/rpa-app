/* views-home.js — Início do laboratório: retomar de onde parou, as cinco etapas e atalhos para cada aba */
(function(){
"use strict";
const CH=window.CH,{esc,icon}=CH;
CH.views=CH.views||{};

CH.views.home=function(root){
  const acts=CH.allActs(),prog=Object.fromEntries(acts.map(i=>[i,CH.progress(i)]));
  const revel=acts.filter(i=>prog[i].nivel>=2).length;
  const last=CH.store.state.last,next=CH.nextActivity();
  const lastOk=last&&CH.ACT[last.exId];
  const cont=lastOk?last.exId:(next||acts[0]);
  const href=cont===CH.LIVRE?"#/livre":"#/lab/"+cont;
  const nome=CH.store.name(),p=CH.persona();
  const retorno=!!(lastOk||revel);
  root.innerHTML=`
<div class="page ini">
  <header class="ini-h">
    <p class="eyebrow">${retorno?"Bom ter você de volta":"Bem-vindo ao simulador"}</p>
    <h1 class="display ini-t" id="page-title" tabindex="-1">${nome?`Oi, <em><b>${esc(nome)}</b></em>.`:"Vamos cortar."}<br>${revel?"Falta pouco para a próxima descoberta.":lastOk?"Continue de onde parou.":"Seu primeiro corte está a um plano de distância."}</h1>
    <div class="ini-act">
      <a class="btn red lg" href="${href}">${retorno?"Continuar":"Começar"}: ${esc(CH.ACT[cont].t)}${icon("next")}</a>
      <a class="btn ghost lg" href="#/guia">Como tudo funciona</a>
    </div>
    <p class="ini-meta">${CH.data.conceitos.conceitos.filter(c=>CH.conceptOpen(c)).length} de ${CH.data.conceitos.conceitos.length} descobertas${p?`, você olha como <b>${esc(p.curto)}</b>`:""}</p>
  </header>

  ${CH.evoCard(false)}
  ${CH.metaCard()}
  <section aria-labelledby="et-h" class="ini-et">
    <h2 class="h3" id="et-h">As etapas da jornada</h2>
    <ol class="et-grid">
      ${(()=>{const usados=new Set(),usadoT=new Set();return CH.data.atos.atos.map((a,k)=>{
        const ids=CH.atividadesDoAto(a),n=ids.filter(i=>prog[i].nivel>=2).length,goto=ids.find(i=>prog[i].nivel<2)||ids[0];
        const cand=ids.flatMap(i=>CH.ACT[i].pool).map(id=>CH.TK[id]).filter(x=>x&&x.th);
        const t=cand.find(x=>!usados.has(x.f))||cand.find(x=>!usadoT.has(x.id))||cand[0];usados.add(t.f);usadoT.add(t.id);
        return `<li class="et et${k+1}"><a href="#/lab/${goto}" style="--ac:${a.cor}">
          <span class="et-img ${a.duo}"><img src="${t.th}" alt="" loading="lazy" width="320" height="240"></span>
          <span class="et-tx"><span class="et-n">Etapa ${a.n}</span><b class="display et-v">${esc(a.verbo)}</b><span class="et-p">${esc(a.pergunta)}</span><span class="et-c"><i style="--f:${ids.length?n/ids.length:0}"></i>${n} de ${ids.length}</span></span></a></li>`}).join("")})()}
    </ol>
  </section>

  <section aria-labelledby="ab-h" class="ini-ab">
    <h2 class="h3" id="ab-h">Cada aba, em uma linha</h2>
    <ul class="ab-list">
      <li><a href="#/percurso"><b>Jornada</b><span>As etapas, as atividades e as descobertas que você já fez.</span></a></li>
      <li><a href="#/museu"><b>Museu</b><span>Quem inventou cada ideia de corte, numa linha do tempo.</span></a></li>
      <li><a href="#/livre"><b>Livre</b><span>Qualquer plano, qualquer ordem, sem meta.</span></a></li>
      <li><a href="#/caderno"><b>Caderno</b><span>O que você percebeu, guardado neste aparelho.</span></a></li>
      <li><a href="#/guia"><b>Guia</b><span>Para que serve cada aba e cada ferramenta.</span></a></li>
      <li><a href="#/eu"><b>Meu espaço</b><span>Perfil, ajustes de leitura e passaporte em PDF.</span></a></li>
    </ul>
  </section>
  <p class="ini-cr muted">Desenvolvido por Débora Augusta Alves Santos e Claude (Anthropic). <a class="link" href="#/creditos">Créditos e origem das imagens</a></p>
</div>`;
  return{title:"Início"};
};
})();
