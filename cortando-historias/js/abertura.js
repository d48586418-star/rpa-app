/* abertura.js — o leque abre do centro; o personagem do meio se move; o botão leva às boas-vindas. */
(function(){
"use strict";
var D=document,R=D.documentElement,go=D.getElementById("entrar"),fan=D.getElementById("fan");
if(!go||!fan)return;
var reduzido=false;try{reduzido=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
go.addEventListener("click",function(){try{sessionStorage.setItem("ch:cap","1")}catch(e){}});
if(reduzido)return;
R.classList.add("js-pre");
function abre(){requestAnimationFrame(function(){requestAnimationFrame(function(){R.classList.remove("js-pre")})})}
var v=fan.querySelector("video"),imgs=[].slice.call(fan.querySelectorAll("img")),pend=imgs.length,done=false;
function pronto(){if(done)return;done=true;abre();
  if(v){var f=function(){v.classList.add("on")};v.addEventListener("playing",f,{once:true});var p=v.play();if(p&&p.catch)p.catch(function(){})}}
imgs.forEach(function(im){var f=function(){if(--pend<=0)pronto()};if(im.complete)f();else{im.addEventListener("load",f,{once:true});im.addEventListener("error",f,{once:true})}});
setTimeout(pronto,1500);
D.addEventListener("visibilitychange",function(){if(v){if(D.hidden)v.pause();else if(v.classList.contains("on"))v.play().catch(function(){})}});
})();
