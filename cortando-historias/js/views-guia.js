/* views-guia.js — Guia: para que serve cada aba, cada etapa de uma atividade e cada ferramenta; e "O que é edição?" */
(function(){
"use strict";
const CH=window.CH,{esc,icon}=CH;
const ABAS=[
  ["Início","#/inicio","home","Seu ponto de partida. Mostra de onde você parou, as cinco etapas e atalhos para tudo."],
  ["Jornada","#/percurso","path","As cinco etapas, cada uma com suas atividades. Cada atividade vira um fotograma que se revela quando você descobre a técnica. Aqui também ficam as Descobertas: um painel com o nome de cada efeito que você já realizou."],
  ["Museu","#/museu","museum","A história da montagem numa linha do tempo. Arraste as pontas verde e vermelha para escolher um período, toque num quadro para ver a parada e abra para ler com mais profundidade."],
  ["Livre","#/livre","film","O laboratório sem meta. Todos os planos, qualquer ordem, nenhum enunciado. Serve para testar uma ideia sua."],
  ["Caderno","#/caderno","book","Suas anotações, reflexões e as versões que você montou. Fica só neste aparelho."],
  ["Meu espaço","#/eu","user","Seu nome, seu olhar de editor, ajustes de leitura (texto grande, mais contraste, menos movimento) e o passaporte em PDF."]
];
const PASSOS=[
  ["Ver","Assista aos planos disponíveis. Toque numa imagem para ver o plano inteiro."],
  ["Montar","Toque no + para colocar um plano na timeline. A ordem em que você coloca é a ordem em que o espectador vê."],
  ["Assistir","Veja a sua montagem do começo ao fim. Só assim dá para sentir o que o corte faz."],
  ["Descobrir","Quando a sua montagem cria um efeito, ele ganha nome e você recebe a descoberta."],
  ["Aprofundar","Monte outra versão, compare e guarde o que percebeu."]
];
const FERR=[
  ["left","Mover","Empurra o plano selecionado para antes na timeline."],
  ["right","Mover","Empurra o plano selecionado para depois."],
  ["scissors","Tesoura","Liga o modo corte: toque na timeline onde o plano deve ser dividido."],
  ["scissors","Cortar aqui","Divide o plano exatamente onde está o ponto de leitura."],
  ["trash","Remover","Tira da timeline o plano selecionado."],
  ["undo","Desfazer","Volta a última alteração."],
  ["x","Limpar","Esvazia a timeline para recomeçar."],
  ["cut","Separar áudio","Solta o som da imagem para que cada um tenha o seu corte (atividades de J-cut e L-cut)."],
  ["left","Som antes","O som da próxima cena chega antes da imagem."],
  ["right","Som depois","O som da cena anterior continua depois que a imagem já mudou."],
  ["right","Esticar som","Alonga o som da faixa de áudio."],
  ["left","Encolher som","Encurta o som da faixa de áudio."]
];
CH.views.guia=function(root){
  const F=CH.data.conceitos.fundamentos,first=CH.allActs()[0];
  root.innerHTML=`
<div class="page guia">
  <header class="page-head"><h1 class="display g-t" id="page-title" tabindex="-1">Guia para <b>tudo</b></h1>
  <p class="lead">Para que serve cada aba, cada passo de uma atividade e cada ferramenta. Volte aqui sempre que tiver dúvida.</p></header>
  <div class="g-grid">
    <nav class="g-idx glass" aria-label="Neste guia"><a href="#/guia" data-scroll="g-abas">As abas</a><a href="#/guia" data-scroll="g-ativ">Dentro de uma atividade</a><a href="#/guia" data-scroll="g-ferr">Ferramentas</a><a href="#/museu" data-ir="anatomia">O que é edição?</a></nav>
    <div class="g-main">
      <section id="g-abas" aria-labelledby="ga-h"><h2 class="h2" id="ga-h">As abas</h2>
        <ul class="g-abas">${ABAS.map(([t,h,i,d])=>`<li><a href="${h}"><span class="g-ic">${icon(i)}</span><b>${esc(t)}</b><span>${esc(d)}</span></a></li>`).join("")}</ul></section>
      <section id="g-ativ" aria-labelledby="gv-h"><h2 class="h2" id="gv-h">Dentro de uma atividade</h2>
        <p class="lead">Toda atividade segue o mesmo caminho, mostrado no alto da tela.</p>
        <ol class="g-pass">${PASSOS.map(([t,d],k)=>`<li><span class="g-n">${k+1}</span><div><b>${t}</b><p>${esc(d)}</p></div></li>`).join("")}</ol>
        <div class="g-pan"><h3 class="h4">Os três painéis ao lado</h3>
          <dl><div><dt>Planos</dt><dd>Os takes que você pode usar. “Desta atividade” mostra os planos do enunciado; “Mais planos” abre os outros filmes.</dd></div>
          <div><dt>Descoberta</dt><dd>Depois de assistir, aqui aparece o que a sua montagem fez, em linguagem simples, e o nome da técnica quando você a realiza.</dd></div>
          <div><dt>Aprofundar</dt><dd>As versões que você já montou. Compare e guarde uma observação.</dd></div></dl></div>
      </section>
      <section id="g-ferr" aria-labelledby="gf-h"><h2 class="h2" id="gf-h">Ferramentas da timeline</h2>
        <ul class="g-ferr">${FERR.map(([i,t,d])=>`<li><span class="g-fi">${icon(i)}</span><b>${t}</b><span>${esc(d)}</span></li>`).join("")}</ul>
        <p class="muted">Algumas ferramentas só aparecem nas atividades em que fazem sentido.</p></section>
      <section id="g-ed" aria-labelledby="ge-h"><h2 class="h2" id="ge-h">O que é edição?</h2>
        <p class="lead">Um filme é feito de muitas imagens. Editar é decidir o que fazer com elas. Quatro ideias para começar.</p>
        <ol class="g-fund">${F.map((f,i)=>`<li><span class="g-n">${i+1}</span><div><h3 class="h3">${esc(f.t)}</h3><p class="g-idea">${esc(f.ideia)}</p><p>${esc(f.entenda)}</p></div></li>`).join("")}</ol>
        <div class="wrap"><a class="btn ink lg" href="#/lab/${first}">Experimentar agora${icon("next")}</a><a class="btn ghost lg" href="#/descobertas">Ver descobertas</a><button class="btn ghost lg" type="button" data-tour>Rever o tutorial</button></div></section>
    </div>
  </div>
</div>`;
  root.addEventListener("click",e=>{
    const a=e.target.closest("[data-scroll]");
    if(a){e.preventDefault();const t=root.querySelector("#"+a.dataset.scroll);if(t)t.scrollIntoView({behavior:CH.reduced()?"auto":"smooth",block:"start"});return}
    if(e.target.closest("[data-tour]")){CH.tour();return}
    const m=e.target.closest("[data-ir]");
    if(m){e.preventDefault();CH.irPara=m.dataset.ir;location.hash="#/museu"}
  });
  return{title:"Guia"};
};
})();
