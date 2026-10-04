/* abertura.js — três cenas, com os lados invertidos (esquerda → direita):
   (1) navalha na borda esquerda; (2) o aluno a arrasta para a direita: a cunha se abre atrás dela e as folhas saem;
   (3) o título nasce letra por letra e a bolinha da pílula, arrastada para a direita, faz a câmera entrar nela até a escolha de perfil.
   Toda a geometria das folhas/navalha é calculada num espaço espelhado (u = W − x). Só transform/opacity/clip-path. */
(function(){
"use strict";
var D=document,R=D.documentElement,LAB="lab.html#/boas-vindas";
var stage=D.getElementById("stage"),sheets=D.getElementById("sheets"),blade=D.getElementById("blade"),hint=D.getElementById("hint"),base=D.getElementById("base"),
    ttl=D.getElementById("ttl"),ln1=D.getElementById("ln1"),ln2=D.getElementById("ln2"),cutline=D.getElementById("cutline"),pill=D.getElementById("pill"),knob=D.getElementById("knob"),pillT=D.querySelector(".pill-t");
if(!stage||!blade||!sheets)return;
var reduzido=false;try{reduzido=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(reduzido)R.classList.add("redmo");
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},lerp=function(a,b,t){return a+(b-a)*t};
var outQ=function(t){return 1-Math.pow(1-t,3)},inQ=function(t){return t*t*t},io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var W=0,H=0,L=105,bx0=0,by=0,yc=0,bx=0,rot=20,vel=0,tilt=0,exitT=0,phase="enter",interagiu=false,entrouEm=performance.now(),tw=null,drag=null,fin=null,pillState={d:0,drag:false,done:false,travel:1};
/* bx = x da navalha na tela; as folhas vivem num espaço espelhado (s = W − x) */
/* ---------- título em letras ---------- */
function letras(el,txt,d0){el.innerHTML="";var i=0;txt.split("").forEach(function(ch){var m=D.createElement("span"),c=D.createElement("span");m.className="m";c.className="c";c.textContent=ch;c.style.setProperty("--i",i++);c.style.setProperty("--d",d0+"ms");m.appendChild(c);el.appendChild(m)})}
letras(ln1,"Cortando",0);letras(ln2,"Histórias",330);
var probe=D.createElement("span");probe.setAttribute("aria-hidden","true");probe.style.cssText="position:absolute;left:-9999px;top:0;white-space:nowrap;font:700 100px/1 "+getComputedStyle(D.body).fontFamily+";letter-spacing:-7px;visibility:hidden";probe.textContent="Histórias";D.body.appendChild(probe);
function layout(){
  W=innerWidth;H=innerHeight;
  L=clamp(W*.0547,76,140);stage.style.setProperty("--bw",(L*50/105).toFixed(1)+"px");stage.style.setProperty("--bh",L.toFixed(1)+"px");
  bx0=L*.38;by=H*.484+L*.45;yc=H*.484;
  stage.style.setProperty("--yc",yc.toFixed(1)+"px");stage.style.setProperty("--W",W+"px");stage.style.setProperty("--H",H+"px");
  var wH=probe.getBoundingClientRect().width/100,alvo=W<700?.78:W<1100?.56:.359;
  stage.style.setProperty("--fsH",(alvo*W/wH).toFixed(1)+"px");stage.style.setProperty("--ty","45.2%");
  var pw=pill.offsetWidth||250,kh=pill.offsetHeight*.8;pillState.travel=Math.max(1,pw-kh-pill.offsetHeight*.2);
  if(phase==="enter"||phase==="idle")bx=bx0;
}
/* ---------- renderização por quadro (espaço espelhado) ---------- */
function render(){
  var q=clamp((bx-bx0)/(W*.70-bx0),0,1.3),k=reduzido?0:Math.min(1,q/.56)+Math.max(0,q-.56)*.9,ax=W-(bx-L*.1),tht=11.4*k,thb=8*k,oy=0;
  if(phase==="finish"){
    var e=exitT,g=io(clamp(e/.8,0,1)),kk=Math.min(1,q/.56);
    ax=lerp(W-(fin.bx-L*.1),-L*2,g);tht=lerp(11.4*kk,96,inQ(clamp(e/.9,0,1)));thb=lerp(8*kk,96,inQ(clamp(e/.9,0,1)));oy=inQ(clamp((e-.15)/.85,0,1))*H*.62;
    if(reduzido){tht=thb=0;oy=0}
  }
  stage.style.setProperty("--ax",ax.toFixed(1)+"px");stage.style.setProperty("--tht",(-tht).toFixed(2)+"deg");stage.style.setProperty("--thb",thb.toFixed(2)+"deg");stage.style.setProperty("--oy",oy.toFixed(1)+"px");
  /* a navalha vive fora das folhas espelhadas: converte u → x da tela e espelha a inclinação */
  blade.style.transform="translate3d("+bx.toFixed(1)+"px,"+by.toFixed(1)+"px,0) rotate("+(-(rot+tilt)).toFixed(2)+"deg)";
  blade.setAttribute("aria-valuenow",Math.round(clamp(q,0,1)*100));
}
var last=performance.now();
function frame(now){
  var dt=Math.min(40,now-last);last=now;
  if(phase==="enter"){
    var t=clamp((now-entrouEm-250)/750,0,1),e=outQ(t);bx=lerp(-L,bx0,e);rot=lerp(38,20,e);blade.style.opacity=t>0?1:0;
    if(t>=1){phase="idle";hint.classList.add("show")}
  }else if(phase==="idle"||phase==="back"){
    if(tw){var u=clamp((now-tw.t0)/tw.dur,0,1),x=tw.ease(u);bx=lerp(tw.from,tw.to,x);if(u>=1){var cb=tw.done;tw=null;if(phase==="back")phase="idle";cb&&cb()}}
    tilt*=.85;
    if(phase==="idle"&&!interagiu&&!tw&&now-entrouEm>3600&&((now-entrouEm)%4200)<dt+16)puxao();
  }else if(phase==="drag"){
    var prev=bx;bx+=(drag.tx-bx)*Math.min(1,dt/36*.9);bx=clamp(bx,bx0,W*.96);vel=(bx-prev)/Math.max(1,dt);tilt=clamp(vel*-3,-7,7);
    if(bx>=W*.70)terminar();
  }else if(phase==="finish"){
    exitT=clamp((now-fin.t0)/fin.dur,0,1);
    bx=lerp(fin.bx,W+L*2.2,outQ(clamp(exitT/.8,0,1)));blade.style.opacity=String(1-clamp((exitT-.1)/.5,0,1));
    if(!fin.lit&&exitT>=.5){fin.lit=true;base.classList.add("lit");stage.classList.add("title")}
    if(!fin.pill&&exitT>=.5){fin.pill=true;setTimeout(function(){pill.classList.add("show");pill.tabIndex=0},reduzido?100:1500)}
    if(exitT>=1&&!fin.end){fin.end=true;sheets.style.display="none";blade.style.display="none"}
  }
  render();requestAnimationFrame(frame);
}
function puxao(){tw={from:bx,to:bx0+W*.045,t0:performance.now(),dur:330,ease:outQ,done:function(){tw={from:bx,to:bx0,t0:performance.now(),dur:420,ease:io}}}}
function terminar(porTeclado){
  if(phase==="finish")return;
  interagiu=true;phase="finish";drag=null;stage.classList.remove("drag");stage.classList.add("exit");hint.classList.add("off");
  fin={t0:performance.now(),dur:reduzido?260:1000,bx:bx,lit:false,pill:false,end:false,kb:!!porTeclado};
  base.classList.add("on");
  if(reduzido){base.classList.add("lit");stage.classList.add("title")}
  if(porTeclado)setTimeout(function(){try{pill.focus({preventScroll:true})}catch(e){}},1800);
}
function cancelar(){phase="back";tw={from:bx,to:bx0,t0:performance.now(),dur:420,ease:outQ,done:function(){interagiu=false}}}
/* ---------- gesto: arrastar a navalha da esquerda para a direita ---------- */
blade.addEventListener("pointerdown",function(e){
  if(phase!=="idle"&&phase!=="enter")return;
  e.preventDefault();phase="drag";interagiu=true;tw=null;hint.classList.add("off");base.classList.add("on");stage.classList.add("drag");
  drag={id:e.pointerId,dx:e.clientX-bx,tx:bx};try{blade.setPointerCapture(e.pointerId)}catch(x){}
});
stage.addEventListener("pointermove",function(e){if(phase==="drag"&&drag&&e.pointerId===drag.id)drag.tx=e.clientX-drag.dx});
function soltou(e){
  if(phase!=="drag"||!drag||(e&&e.pointerId!==drag.id))return;
  var q=(bx-bx0)/(W*.70-bx0);stage.classList.remove("drag");
  if(q>=.55)terminar();else cancelar();
}
stage.addEventListener("pointerup",soltou);stage.addEventListener("pointercancel",soltou);
/* teclado: a navalha é um controle deslizante */
blade.addEventListener("keydown",function(e){
  if(phase!=="idle")return;
  if(e.key==="Enter"||e.key===" "){e.preventDefault();base.classList.add("on");terminar(true)}
  else if(e.key==="ArrowRight"){e.preventDefault();interagiu=true;base.classList.add("on");hint.classList.add("off");var to=bx+W*.12;if(to>=W*.70){terminar(true)}else{tw={from:bx,to:to,t0:performance.now(),dur:260,ease:outQ}}}
  else if(e.key==="ArrowLeft"){e.preventDefault();tw={from:bx,to:Math.max(bx0,bx-W*.12),t0:performance.now(),dur:260,ease:outQ}}
});
/* ---------- cena 3: pílula arrastável (da esquerda para a direita) e zoom para dentro da bolinha ---------- */
function setPill(d){pillState.d=clamp(d,0,pillState.travel);knob.style.transform="translate3d("+pillState.d.toFixed(1)+"px,0,0)";pillT.style.opacity=String(1-clamp(pillState.d/(pillState.travel*.5),0,1));pill.setAttribute("aria-valuenow",Math.round(pillState.d/pillState.travel*100))}
function entrar(){
  if(pillState.done)return;pillState.done=true;setPill(pillState.travel);
  try{sessionStorage.setItem("ch:cap","1");sessionStorage.setItem("ch:go3","1")}catch(e){}
  var r=knob.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,S=Math.max(W,H)*2.4/Math.max(1,r.width);
  base.style.transformOrigin=cx+"px "+cy+"px";base.classList.add("zoom");
  requestAnimationFrame(function(){if(!reduzido)base.style.transform="scale("+S.toFixed(1)+")"});
  setTimeout(function(){location.replace(LAB)},reduzido?280:600);
}
var px0=0;
pill.addEventListener("pointerdown",function(e){if(pillState.done||!pill.classList.contains("show"))return;pillState.drag=true;px0=e.clientX-pillState.d;try{pill.setPointerCapture(e.pointerId)}catch(x){}knob.style.transition="none"});
pill.addEventListener("pointermove",function(e){if(pillState.drag)setPill(e.clientX-px0)});
function pillSolta(){if(!pillState.drag)return;pillState.drag=false;if(pillState.d>=pillState.travel*.85)entrar();else{knob.style.transition="transform .35s cubic-bezier(.22,1,.36,1)";setPill(0)}}
pill.addEventListener("pointerup",pillSolta);pill.addEventListener("pointercancel",pillSolta);
pill.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "||e.key==="ArrowRight"){e.preventDefault();entrar()}});
layout();addEventListener("resize",layout);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(layout);
requestAnimationFrame(frame);
})();
