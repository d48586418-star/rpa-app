/* abertura.js — arrastar para baixo corta o papel; a câmera entra, surgem o texto e o botão "Iniciar jornada". */
(function(){
"use strict";
var D=document,R=D.documentElement;
var rip=D.getElementById("rip"),stage=D.getElementById("stage"),cam=D.getElementById("cam"),go=D.getElementById("entrar"),ins=D.getElementById("instr");
if(!rip||!stage||!go)return;
var reduzido=false;try{reduzido=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
R.classList.add("anim");if(reduzido)R.classList.add("redmo");
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
var rnd=[],seed=7,n=34;function r(){seed=(seed*9301+49297)%233280;return seed/233280}
for(var i=0;i<=n;i++)rnd.push((r()-.5)*5.2+(i%2?1.1:-1.1));
(function(){var pts=[];for(var i=0;i<=n;i++)pts.push([(i/n*100).toFixed(2),(50+rnd[i]).toFixed(2)]);
  var line=pts.map(function(q){return q[0]+"% "+q[1]+"%"}).join(","),back=pts.slice().reverse().map(function(q){return q[0]+"% "+q[1]+"%"}).join(",");
  rip.style.setProperty("--cp-top","0 0,100% 0,"+back);rip.style.setProperty("--cp-bot",line+",100% 100%,0 100%")})();
var alvo=0,p=0,drag=false,y0=0,p0=0,anim=null;
function ir(a,dur){anim={de:alvo,para:a,t0:performance.now(),dur:dur}}
function curso(now){
  if(anim){var k=clamp((now-anim.t0)/anim.dur,0,1);k=k*k*(3-2*k);alvo=anim.de+(anim.para-anim.de)*k;if(k>=1)anim=null}
  p+=(alvo-p)*.25;if(Math.abs(alvo-p)<.0005)p=alvo;
  var t=p*p*(3-2*p);
  R.style.setProperty("--t",t.toFixed(4));rip.style.setProperty("--t",t.toFixed(4));
  rip.classList.toggle("split",t>.004);
  R.classList.toggle("aberta",t>.7);
  if(!reduzido){var z=.4*clamp(t/.6,0,1)+Math.pow(clamp((t-.6)/.4,0,1),2)*.15;cam.style.transform=z>0?"scale("+(1.0+z).toFixed(3)+")":"";}
  requestAnimationFrame(curso);
}
requestAnimationFrame(curso);
function altura(){return Math.max(300,innerHeight*.6)}
stage.addEventListener("pointerdown",function(e){if(e.target.closest&&e.target.closest(".go"))return;drag=true;anim=null;y0=e.clientY;p0=alvo;try{stage.setPointerCapture(e.pointerId)}catch(x){}});
stage.addEventListener("pointermove",function(e){if(!drag)return;alvo=clamp(p0+(e.clientY-y0)/altura(),0,1)});
function soltar(){if(!drag)return;drag=false;if(alvo>.35)ir(1,500);else ir(0,350)}
stage.addEventListener("pointerup",soltar);stage.addEventListener("pointercancel",soltar);
stage.addEventListener("wheel",function(e){if(e.deltaY>0){anim=null;alvo=clamp(alvo+e.deltaY/600,0,1);clearTimeout(stage._w);stage._w=setTimeout(function(){if(!drag)ir(alvo>.35?1:0,400)},160)}},{passive:true});
D.addEventListener("keydown",function(e){if(e.key==="ArrowDown"||((e.key==="Enter"||e.key===" ")&&D.activeElement===ins)){if(alvo<1){e.preventDefault();ir(1,1100)}}});
if(ins)ins.addEventListener("click",function(){ir(1,1100)});
go.addEventListener("click",function(){try{sessionStorage.setItem("ch:cap","1")}catch(e){}});
})();
