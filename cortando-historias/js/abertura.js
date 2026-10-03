/* abertura.js — o primeiro corte. A camada de vidro cobre o laboratório; a lâmina (Razor) atravessa o título;
   a camada se divide no x do corte e, no vão, aparece o laboratório de verdade. Só então surge "Iniciar jornada". */
(function(){
"use strict";
var D=document,NS="http://www.w3.org/2000/svg";
var stage=D.getElementById("stage"),lab=D.getElementById("lab"),defs=D.getElementById("defs"),egL=D.getElementById("eg-l"),egR=D.getElementById("eg-r"),
    band=D.getElementById("band"),blade=D.getElementById("blade"),hint=D.getElementById("hint"),go=D.getElementById("entrar"),
    bf=D.getElementById("bf"),bs=D.getElementById("bs"),bt=D.getElementById("bt"),bb=D.getElementById("bb"),razor=D.getElementById("razor"),
    glL=D.querySelector(".gl-l"),glR=D.querySelector(".gl-r");
if(!stage||!defs||!band)return;
var reduzido=false;try{reduzido=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
var FAMILY='"Helvetica Neue",Helvetica,"DM Sans",Arial,sans-serif',LAB="lab.html#/boas-vindas";
var rec=.9,W=0,H=0,fs=0,x1=0,y1=0,y2=0,bandTop=0,bandBot=0,cx=0,gap=0;
var state={drag:false,cut:false,leaving:false,y0:0,min:0,max:0,type:"mouse"};
function el(n,a,p){var e=D.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
/* recortes: texto do título (linha 1 e 2), cada metade interseccionada com um retângulo no x do corte */
var rectL=el("rect",{x:0,y:0,height:4000},el("clipPath",{id:"r-l"},defs)),rectR=el("rect",{y:0,height:4000},el("clipPath",{id:"r-r"},defs));
var cA=el("clipPath",{id:"c-a"},defs),cL=el("clipPath",{id:"c-l"},defs),cR=el("clipPath",{id:"c-r"},defs),texts=[],egA=D.getElementById("eg-a");
function mk(parent,clip,line,stroke){var t=el("text",clip?{"clip-path":"url(#"+clip+")"}:{},parent);t.textContent=line;texts.push({t:t,l:line==="Cortando"?0:1});return t}
mk(cA,"","Cortando");mk(cA,"","Histórias");mk(egA,"","Cortando");mk(egA,"","Histórias");
mk(cL,"r-l","Cortando");mk(cL,"r-l","Histórias");mk(cR,"r-r","Cortando");mk(cR,"r-r","Histórias");
var gl1=el("g",{"clip-path":"url(#r-l)"},egL),gr1=el("g",{"clip-path":"url(#r-r)"},egR);
mk(gl1,"",null||"Cortando");mk(gl1,"","Histórias");mk(gr1,"","Cortando");mk(gr1,"","Histórias");
[egA,gl1,gr1].forEach(function(g){[].forEach.call(g.querySelectorAll("text"),function(t){t.removeAttribute("clip-path")})});
var seamL=el("line",{},egL),seamR=el("line",{},egR);
/* medir o texto numa sonda para encaixar o título na largura, com o recuo da 2ª linha (.9em) da capa do app */
var probe=el("text",{x:-9999,y:-9999,"font-family":FAMILY,"font-weight":700,"font-size":100,"letter-spacing":-6},el("svg",{width:0,height:0,style:"position:absolute"},D.body));
function largura(s){probe.textContent=s;return probe.getComputedTextLength()}
function layout(){
  W=innerWidth;H=innerHeight;
  var gut=Math.max(20,W*.05);rec=W<700?.3:.9;var w1=largura("Cortando")/100,w2=largura("Histórias")/100+rec;
  fs=Math.min((W-gut*2)/Math.max(w1,w2),H*.3,210);
  x1=gut;var lh=fs*.84;y1=H*.47-lh/2+fs*.27;y2=y1+lh;
  bandTop=y1-fs*.74;bandBot=y2+fs*.22;
  texts.forEach(function(o){var t=o.t;t.setAttribute("font-family",FAMILY);t.setAttribute("font-weight",700);t.setAttribute("font-size",fs.toFixed(1));
    t.setAttribute("letter-spacing",(-fs*.06).toFixed(2));t.setAttribute("x",(o.l?x1+fs*rec:x1).toFixed(1));t.setAttribute("y",(o.l?y2:y1).toFixed(1))});
  band.style.top=bandTop+"px";band.style.height=(bandBot-bandTop)+"px";
  hint.style.left=x1+"px";hint.style.top=(bandBot+22)+"px";
  go.style.left=x1+"px";go.style.top=(bandBot+20)+"px";
  gap=Math.min(W*.09,120);
  setCx(state.cut?cx:(cx||W/2));
}
function setCx(x){
  cx=clamp(x,16,W-16);
  stage.style.setProperty("--cx",cx+"px");
  rectL.setAttribute("width",cx+1);rectR.setAttribute("x",cx);rectR.setAttribute("width",Math.max(0,W-cx));
  seamL.setAttribute("x1",cx);seamL.setAttribute("x2",cx);seamL.setAttribute("y1",0);seamL.setAttribute("y2",H);
  seamR.setAttribute("x1",cx);seamR.setAttribute("x2",cx);seamR.setAttribute("y1",0);seamR.setAttribute("y2",H);
  band.setAttribute("aria-valuenow",Math.round(cx/W*100));
}
/* lâmina: guia tracejada na faixa do título; trecho sólido = o que já foi cortado */
function draw(){
  var top=bandTop-14,bot=bandBot+14;
  bf.setAttribute("x1",cx);bf.setAttribute("x2",cx);bf.setAttribute("y1",top);bf.setAttribute("y2",bot);
  var a=clamp(state.min,top,bot),b=clamp(state.max,top,bot);
  bs.setAttribute("x1",cx);bs.setAttribute("x2",cx);bs.setAttribute("y1",state.drag?a:top);bs.setAttribute("y2",state.drag?b:top);
  bt.setAttribute("d","M"+(cx-6)+" "+top+"H"+(cx+6));bb.setAttribute("d","M"+(cx-6)+" "+bot+"H"+(cx+6));
}
function ponteiro(x,y){var dy=state.type==="touch"?-34:0;razor.setAttribute("transform","translate("+x+" "+(clamp(y,bandTop-14,bandBot+14)+dy)+")")}
function mostra(on){blade.classList.toggle("on",on);void 0}
function toca(){stage.classList.add("touched");carrega()}
var carregado=false;
function carrega(){
  if(carregado)return;carregado=true;
  lab.addEventListener("load",function(){stage.classList.add("lab-on")});
  lab.src=LAB;
}
function dur(ms){stage.style.setProperty("--dur",(reduzido?1:ms)+"ms")}
/* o corte: as metades se afastam alguns pixels com precisão e abrem o vão; só então surge a micro-ação */
function corta(porTeclado){
  if(state.cut)return;state.cut=true;state.drag=false;
  blade.classList.remove("on");stage.classList.remove("aim");stage.classList.add("cut");
  dur(130);stage.style.setProperty("--dxl","-3px");stage.style.setProperty("--dxr","3px");
  setTimeout(function(){dur(560);var s=Math.min(gap/2,Math.max(10,x1-8));stage.style.setProperty("--dxl",-s+"px");stage.style.setProperty("--dxr",s+"px")},reduzido?0:150);
  go.hidden=false;setTimeout(function(){go.classList.add("show");if(porTeclado){try{go.focus({preventScroll:true})}catch(e){}}},reduzido?60:520);
  carrega();
}
function sai(e){
  if(state.leaving)return;e.preventDefault();state.leaving=true;stage.classList.add("leave");dur(480);
  stage.style.setProperty("--dxl",-(cx+60)+"px");stage.style.setProperty("--dxr",(W-cx+60)+"px");
  setTimeout(function(){location.replace(LAB)},reduzido?160:470);
}
go.addEventListener("click",sai);
/* gesto: arrastar na vertical atravessando a faixa do título; o x acompanha o ponteiro */
function cobertura(){var a=clamp(state.min,bandTop,bandBot),b=clamp(state.max,bandTop,bandBot);return (b-a)/(bandBot-bandTop)}
stage.addEventListener("pointerdown",function(e){
  if(state.cut||(e.target.closest&&e.target.closest(".go")))return;
  state.type=e.pointerType||"mouse";state.drag=true;state.y0=state.min=state.max=e.clientY;
  try{stage.setPointerCapture(e.pointerId)}catch(x){}
  setCx(e.clientX);toca();mostra(true);ponteiro(cx,e.clientY);draw();
});
stage.addEventListener("pointermove",function(e){
  if(state.cut)return;
  state.type=e.pointerType||"mouse";
  if(!state.drag){
    if(state.type==="touch")return;
    var dentro=e.clientY>bandTop-24&&e.clientY<bandBot+24;
    stage.classList.toggle("aim",dentro);
    if(dentro){setCx(e.clientX);toca();mostra(true);ponteiro(cx,e.clientY);draw()}else mostra(false);
    return;
  }
  setCx(e.clientX);state.min=Math.min(state.min,e.clientY);state.max=Math.max(state.max,e.clientY);
  ponteiro(cx,e.clientY);draw();
  if(cobertura()>=.9)corta();
});
function solta(){
  if(!state.drag)return;state.drag=false;
  if(!state.cut){state.min=state.max=state.y0;draw();mostra(state.type!=="touch"&&stage.classList.contains("aim"))}
}
stage.addEventListener("pointerup",solta);stage.addEventListener("pointercancel",solta);
stage.addEventListener("pointerleave",function(){if(!state.drag&&!state.cut){mostra(false);stage.classList.remove("aim")}});
/* teclado: a faixa é um controle deslizante da posição do corte; Enter/Espaço/↓ cortam */
band.addEventListener("focus",function(){if(state.cut)return;state.type="mouse";toca();setCx(cx);state.min=state.max=bandTop;mostra(true);ponteiro(cx,(bandTop+bandBot)/2);draw()});
band.addEventListener("blur",function(){if(!state.cut)mostra(false)});
band.addEventListener("keydown",function(e){
  if(state.cut)return;
  var k=e.key;
  if(k==="ArrowLeft"||k==="ArrowRight"){e.preventDefault();setCx(cx+(k==="ArrowLeft"?-1:1)*W*.03);ponteiro(cx,(bandTop+bandBot)/2);draw()}
  else if(k==="Enter"||k===" "||k==="ArrowDown"){e.preventDefault();corta(true)}
});
layout();addEventListener("resize",layout);
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(layout);
/* o laboratório carrega logo depois da primeira pintura, para o vidro já ter o que refratar */
if("requestIdleCallback" in window)requestIdleCallback(carrega,{timeout:1500});else setTimeout(carrega,900);
})();
