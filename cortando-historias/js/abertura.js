/* abertura.js — puxar pelo meio: o dedo entra pelo meio de uma lateral e puxa na horizontal; o rasgo acompanha o dedo,
   as metades se abrem em boca em torno da ponta e surgem o nome e o botão "Iniciar jornada". Arrastar para baixo, roda e teclas também abrem. */
(function(){
"use strict";
var D=document,R=D.documentElement;
var rip=D.getElementById("rip"),stage=D.getElementById("stage"),cam=D.getElementById("cam"),go=D.getElementById("entrar"),ins=D.getElementById("instr");
if(!rip||!stage||!go)return;
var reduzido=false;try{reduzido=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
R.classList.add("anim");if(reduzido)R.classList.add("redmo");
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
/* costura irregular no meio, igual para as duas metades */
var rnd=[],seed=7,n=34;function r(){seed=(seed*9301+49297)%233280;return seed/233280}
for(var i=0;i<=n;i++)rnd.push((r()-.5)*5.2+(i%2?1.1:-1.1));
(function(){var pts=[];for(var i=0;i<=n;i++)pts.push([(i/n*100).toFixed(2),(50+rnd[i]).toFixed(2)]);
  var line=pts.map(function(q){return q[0]+"% "+q[1]+"%"}).join(","),back=pts.slice().reverse().map(function(q){return q[0]+"% "+q[1]+"%"}).join(",");
  rip.style.setProperty("--cp-top","0 0,100% 0,"+back);rip.style.setProperty("--cp-bot",line+",100% 100%,0 100%")})();
var W=innerWidth,H=innerHeight;
addEventListener("resize",function(){W=innerWidth;H=innerHeight});
var alvo=0,p=0,drag=false,x0=0,y0=0,p0=0,fromR=false,anim=null;
function ir(a,dur){anim={de:alvo,para:a,t0:performance.now(),dur:dur}}
function lado(r){if(fromR!==r){fromR=r;rip.classList.toggle("fromR",r)}}
function curso(now){
  if(anim){var k=clamp((now-anim.t0)/anim.dur,0,1);k=k*k*(3-2*k);alvo=anim.de+(anim.para-anim.de)*k;if(k>=1)anim=null}
  p+=(alvo-p)*.25;if(Math.abs(alvo-p)<.0005)p=alvo;
  var t=p*p*(3-2*p);
  R.style.setProperty("--t",t.toFixed(4));rip.style.setProperty("--t",t.toFixed(4));
  rip.classList.toggle("split",t>.004);
  R.classList.toggle("aberta",t>.7);
  if(!reduzido){
    /* ponta do rasgo: acompanha o avanço; atrás dela as duas metades giram em torno da ponta, abrindo uma boca */
    var tip=clamp(t/.8,0,1)*W,A=H*.62*(1-Math.pow(1-clamp(t/.6,0,1),3));
    var th=Math.min(64,Math.atan2(A,Math.max(tip,60))*180/Math.PI);
    var u=clamp((t-.8)/.2,0,1),sai=u*u*H*.9;
    rip.style.setProperty("--tip",tip.toFixed(1)+"px");
    rip.style.setProperty("--rt",th.toFixed(2)+"deg");rip.style.setProperty("--rb",(-th).toFixed(2)+"deg");
    rip.style.setProperty("--oyt",(-sai).toFixed(1)+"px");rip.style.setProperty("--oyb",sai.toFixed(1)+"px");
    var z=.05*clamp(t/.9,0,1);cam.style.transform=z>0?"scale("+(1+z).toFixed(3)+")":"";
  }else{rip.style.setProperty("--tip",(t>0?W:0)+"px")}
  requestAnimationFrame(curso);
}
requestAnimationFrame(curso);
var altura=function(){return Math.max(300,H*.6)};
stage.addEventListener("pointerdown",function(e){
  if(e.target.closest&&e.target.closest(".go"))return;
  drag=true;anim=null;x0=e.clientX;y0=e.clientY;p0=alvo;
  if(alvo<.02)lado(e.clientX>W/2);   /* o lado do toque define de onde o rasgo parte */
  try{stage.setPointerCapture(e.pointerId)}catch(x){}});
stage.addEventListener("pointermove",function(e){
  if(!drag)return;
  var dx=fromR?x0-e.clientX:e.clientX-x0,h=p0+dx/(W*.72),v=p0+(e.clientY-y0)/altura();
  alvo=clamp(Math.max(h,v),0,1)});
function soltar(){if(!drag)return;drag=false;if(alvo>.35)ir(1,500);else ir(0,350)}
stage.addEventListener("pointerup",soltar);stage.addEventListener("pointercancel",soltar);
stage.addEventListener("wheel",function(e){var d=e.deltaY||e.deltaX;if(d>0){anim=null;alvo=clamp(alvo+d/600,0,1);clearTimeout(stage._w);stage._w=setTimeout(function(){if(!drag)ir(alvo>.35?1:0,400)},160)}},{passive:true});
D.addEventListener("keydown",function(e){if(e.key==="ArrowDown"||e.key==="ArrowRight"||((e.key==="Enter"||e.key===" ")&&D.activeElement===ins)){if(alvo<1){e.preventDefault();ir(1,1100)}}});
if(ins)ins.addEventListener("click",function(){ir(1,1100)});
go.addEventListener("click",function(){try{sessionStorage.setItem("ch:cap","1")}catch(e){}});
})();
