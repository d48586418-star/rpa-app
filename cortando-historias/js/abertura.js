/* abertura.js — três cenas, com os lados invertidos (esquerda → direita):
   (1) navalha na borda esquerda; (2) o aluno a arrasta para a direita: a cunha se abre atrás dela e as folhas saem;
   (3) o título nasce letra por letra e a bolinha da pílula, arrastada para a direita, faz a câmera entrar nela até a escolha de perfil.
   Toda a geometria das folhas/navalha é calculada num espaço espelhado (u = W − x). Só transform/opacity/clip-path. */
(function(){
"use strict";
var D=document,R=D.documentElement,LAB="lab.html#/escolher",LINK=D.getElementById("entrar-link");
var stage=D.getElementById("stage"),sheets=D.getElementById("sheets"),blade=D.getElementById("blade"),hint=D.getElementById("hint"),base=D.getElementById("base"),
    ttl=D.getElementById("ttl"),ln1=D.getElementById("ln1"),ln2=D.getElementById("ln2"),pill=D.getElementById("pill"),knob=D.getElementById("knob"),pillT=D.querySelector(".pill-t");
if(!stage||!blade||!sheets)return;
/* movimento: só a preferência explícita do site (Meu espaço → Movimento = Reduzido) desliga os efeitos. Se apenas o aparelho pede "reduzir movimento",
   os efeitos continuam em versão suave (sem giros, zoom curto): o gesto é do próprio aluno e é a cara da abertura. */
var reduzido=false,suave=false;
try{var _p=JSON.parse(localStorage.getItem("ch:v1")||"{}");reduzido=!!(_p.prefs&&_p.prefs.motion==="off")}catch(e){}
try{suave=!reduzido&&matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(reduzido)R.classList.add("redmo");if(suave)R.classList.add("suave");
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},lerp=function(a,b,t){return a+(b-a)*t};
var outQ=function(t){return 1-Math.pow(1-t,3)},inQ=function(t){return t*t*t},io=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var W=0,H=0,L=105,bx0=0,by=0,yc=0,bx=0,rot=20,vel=0,tilt=0,exitT=0,phase="enter",interagiu=false,entrouEm=performance.now(),tw=null,drag=null,fin=null,pillState={d:0,drag:false,done:false,travel:1};
/* bx = x da navalha na tela; as folhas vivem num espaço espelhado (s = W − x) */
/* ---------- título em letras ---------- */
function letras(el,txt,d0){el.innerHTML="";var i=0;txt.split("").forEach(function(ch){var m=D.createElement("span"),c=D.createElement("span");m.className="m";c.className="c";c.textContent=ch;c.style.setProperty("--i",i++);c.style.setProperty("--d",d0+"ms");m.appendChild(c);el.appendChild(m)})}
letras(ln1,"Cortando",0);letras(ln2,"Histórias",330);
(function(){var s=D.getElementById("sub");if(!s)return;var t=s.textContent;s.setAttribute("aria-label",t);s.innerHTML="";t.split(" ").forEach(function(w,i){var e=D.createElement("span");e.className="w";e.setAttribute("aria-hidden","true");e.style.setProperty("--i",i);e.textContent=w;s.appendChild(e);if(i<t.split(" ").length-1)s.appendChild(D.createTextNode(" "))})})();
var probe=D.createElement("span");probe.setAttribute("aria-hidden","true");probe.style.cssText="position:absolute;left:-9999px;top:0;white-space:nowrap;font:800 100px/1 "+getComputedStyle(D.body).fontFamily+";letter-spacing:-7px;visibility:hidden";probe.textContent="Histórias";D.body.appendChild(probe);
var medido=false,fonteOk=false;
function layout(){
  var vv=window.visualViewport,nw=Math.round(vv&&vv.width||innerWidth),nh=Math.round(vv&&vv.height||innerHeight);
  /* a barra do navegador do celular muda a altura aos poucos: só relayout se a largura mudou ou a altura mudou muito (evita o título "pular") */
  if(medido&&W&&Math.abs(nw-W)<2&&Math.abs(nh-H)<H*.12)return;
  W=nw;H=nh;
  L=clamp(W*.0547,76,140);stage.style.setProperty("--bw",(L*50/105).toFixed(1)+"px");stage.style.setProperty("--bh",L.toFixed(1)+"px");
  bx0=L*.38;by=H*.484+L*.45;yc=H*.484;
  stage.style.setProperty("--yc",yc.toFixed(1)+"px");stage.style.setProperty("--W",W+"px");stage.style.setProperty("--H",H+"px");
  var wH=probe.getBoundingClientRect().width/100,alvo=W<700?.86:W<1100?.66:.44;
  stage.style.setProperty("--fsH",Math.min(alvo*W/wH,H*.24).toFixed(1)+"px");stage.style.setProperty("--ty","45.2%");
  var pw=pill.offsetWidth||250,kh=pill.offsetHeight*.8;pillState.travel=Math.max(1,pw-kh-pill.offsetHeight*.2);
  if(phase==="enter"||phase==="idle")bx=bx0;
  if(fonteOk&&!medido){medido=true;stage.classList.add("medido")}
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
    var t=clamp((now-entrouEm-250)/750,0,1),e=outQ(t);bx=lerp(-L,bx0,e);rot=suave?20:lerp(38,20,e);blade.style.opacity=t>0?1:0;
    if(t>=1){phase="idle";hint.classList.add("show")}
  }else if(phase==="idle"||phase==="back"){
    if(tw){var u=clamp((now-tw.t0)/tw.dur,0,1),x=tw.ease(u);bx=lerp(tw.from,tw.to,x);if(u>=1){var cb=tw.done;tw=null;if(phase==="back")phase="idle";cb&&cb()}}
    tilt*=.85;
    if(phase==="idle"&&!interagiu&&!tw&&now-entrouEm>3600&&((now-entrouEm)%4200)<dt+16)puxao();
  }else if(phase==="drag"){
    var prev=bx;bx+=(drag.tx-bx)*Math.min(1,dt/36*.9);bx=clamp(bx,bx0,W*.96);vel=(bx-prev)/Math.max(1,dt);tilt=suave?0:clamp(vel*-3,-7,7);
    if(bx>=W*.70)terminar();
  }else if(phase==="finish"){
    exitT=clamp((now-fin.t0)/fin.dur,0,1);
    bx=lerp(fin.bx,W+L*2.2,outQ(clamp(exitT/.8,0,1)));blade.style.opacity=String(1-clamp((exitT-.1)/.5,0,1));
    if(!fin.lit&&exitT>=.5){fin.lit=true;base.classList.add("lit");stage.classList.add("title")}
    if(!fin.pill&&exitT>=.5){fin.pill=true;setTimeout(function(){pill.classList.add("show");pill.tabIndex=0;aquece();preparaLab()},reduzido?100:1500)}
    if(exitT>=1&&!fin.end){fin.end=true;sheets.style.display="none";blade.style.display="none"}
  }
  render();requestAnimationFrame(frame);
}
function puxao(){tw={from:bx,to:bx0+W*.045,t0:performance.now(),dur:330,ease:outQ,done:function(){tw={from:bx,to:bx0,t0:performance.now(),dur:420,ease:io}}}}
function terminar(porTeclado){
  if(phase==="finish")return;
  interagiu=true;phase="finish";drag=null;stage.classList.remove("drag");stage.classList.add("exit");hint.classList.add("off");
  fin={t0:performance.now(),dur:reduzido?260:1000,bx:bx,lit:false,pill:false,end:false,kb:!!porTeclado};
  base.classList.add("on");aquece();
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
/* a escolha de perfil real é carregada em segundo plano (invisível) para a câmera "entrar" nela sem trocar de documento no meio do movimento */
var labFrame=null,labPronto=false;
var fino=false;try{fino=matchMedia("(hover:hover) and (pointer:fine)").matches&&!(navigator.connection&&navigator.connection.saveData)}catch(e){}
function preparaLab(){
  if(labFrame||reduzido||!fino||innerWidth<=900)return;   /* a cópia invisível da escolha só em computador; no toque é pesada e frágil */
  try{
    labFrame=D.createElement("iframe");labFrame.className="lab-frame";labFrame.name="ch-peek";labFrame.src=LAB;labFrame.setAttribute("aria-hidden","true");labFrame.setAttribute("tabindex","-1");labFrame.setAttribute("title","");labFrame.setAttribute("inert","");labFrame.setAttribute("scrolling","no");
    window.addEventListener("message",function(e){if(e.data==="ch-peek-ok")labPronto=true});
    stage.insertBefore(labFrame,base);
  }catch(e){labFrame=null}
}
function entrar(){
  if(pillState.done)return;pillState.done=true;setPill(pillState.travel);
  var r=knob.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,d=Math.max(1,r.width);
  var viaFrame=!!(labFrame&&labPronto);
  stage.classList.add("go");if(viaFrame)stage.classList.add("go-frame");
  if(reduzido){requestAnimationFrame(function(){if(viaFrame)labFrame.classList.add("on")});setTimeout(function(){seguir(viaFrame)},280);return}
  /* câmera entrando na bolinha: um círculo branco cresce a partir dela (GPU, só transform) enquanto o resto da cena dá um empurrão de câmera */
  var portal=D.createElement("i");portal.className="portal";portal.style.cssText="left:"+(cx-d/2)+"px;top:"+(cy-d/2)+"px;width:"+d+"px;height:"+d+"px";stage.appendChild(portal);
  var S=Math.hypot(W,H)*2/d;base.style.transformOrigin=cx+"px "+cy+"px";base.classList.add("zoom");
  void portal.offsetWidth;
  requestAnimationFrame(function(){portal.style.transform="scale("+S.toFixed(1)+")";base.style.transform="scale(2.6)"});
  setTimeout(function(){if(viaFrame)labFrame.classList.add("on");portal.classList.add("fade")},420);
  setTimeout(function(){seguir(viaFrame)},viaFrame?1150:900);
}
/* aquece o cache: a escolha de perfil abre quase instantânea e nunca mostra uma página em branco esperando arquivos */
var ARQ=["lab.html","data/data.js","css/tokens.css","css/base.css","css/shell.css","css/home.css","css/screens.css","css/learn.css","css/lab.css","css/welcome.css","css/museu.css","css/guia.css","css/celebrar.css","css/ds.css","css/compat.css","fonts/dm-sans-latin-wght-normal.woff2","js/engine.js","js/leituras.js","js/core.js","js/store.js","js/novas.js","js/scroll.js","js/player.js","js/lab.js","js/lab-panels.js","js/lab-av.js","js/lab-tools.js","js/evolucao.js","js/views-home.js","js/views-path.js","js/views-learn.js","js/views-welcome.js","js/views-museu.js","js/views-guia.js","js/passaporte.js","js/celebrar.js","js/views-lab.js","js/views-me.js","js/app.js","assets/personas/full/historias.jpg","assets/personas/full/ritmo.jpg","assets/personas/full/olhar.jpg","assets/personas/full/som.jpg","assets/personas/full/experimental.jpg"],quente=null;
function aquece(){
  if(quente)return quente;
  try{quente=Promise.all(ARQ.map(function(u){return fetch(u,{cache:"force-cache"}).then(function(r){return r.blob()}).catch(function(){})}))}catch(e){quente=Promise.resolve()}
  return quente;
}
var espera=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var indo=false;
function mostraLink(){try{LINK&&(LINK.hidden=false)}catch(e){}}
/* só troca de página quando o próximo documento já está em cache (no máximo +2,2 s) */
function seguir(v){Promise.race([aquece(),espera(2200)]).then(function(){irLab(v)})}
function irLab(viaFrame){
  if(indo)return;indo=true;
  try{sessionStorage.setItem("ch:cap",viaFrame?"2":"1");sessionStorage.setItem("ch:go3","1")}catch(e){}
  try{location.replace(LAB)}catch(e){try{location.assign(LAB)}catch(x){location.href=LAB}}
  /* se a troca de página não acontecer (visualizador, rede, suspensão), tenta de novo por outro caminho e mostra a saída manual */
  setTimeout(function(){mostraLink();setTimeout(function(){try{location.href=LAB}catch(e){}},1500)},2200);
}
/* volta (bfcache) ou retorno ao app: nunca deixar a tela congelada no zoom branco */
function reinicia(){
  indo=false;pillState.done=false;pillState.drag=false;
  var p=D.querySelector(".portal");if(p&&p.parentNode)p.parentNode.removeChild(p);
  if(labFrame&&labFrame.parentNode){labFrame.parentNode.removeChild(labFrame)}labFrame=null;labPronto=false;
  stage.classList.remove("go","go-frame");base.classList.remove("zoom");base.style.transform="";base.style.transformOrigin="";
  knob.style.transition="none";setPill(0);knob.style.opacity="";if(LINK)LINK.hidden=true;
}
addEventListener("pageshow",function(e){if(e.persisted||pillState.done)reinicia()});
D.addEventListener("visibilitychange",function(){if(!D.hidden&&pillState.done&&!indo)reinicia()});
/* qualquer erro de script na abertura: oferece a saída manual em vez de uma tela parada */
addEventListener("error",function(){mostraLink()});addEventListener("unhandledrejection",function(){mostraLink()});
var px0=0;
pill.addEventListener("pointerdown",function(e){if(pillState.done||!pill.classList.contains("show"))return;pillState.drag=true;px0=e.clientX-pillState.d;try{pill.setPointerCapture(e.pointerId)}catch(x){}knob.style.transition="none"});
pill.addEventListener("pointermove",function(e){if(pillState.drag)setPill(e.clientX-px0)});
function pillSolta(){if(!pillState.drag)return;pillState.drag=false;if(pillState.d>=pillState.travel*.7)entrar();else{knob.style.transition="transform .35s cubic-bezier(.22,1,.36,1)";setPill(0)}}
pill.addEventListener("pointerup",pillSolta);pill.addEventListener("pointercancel",pillSolta);
pill.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "||e.key==="ArrowRight"){e.preventDefault();entrar()}});
layout();
/* só mostra o título depois de medir com a fonte já carregada; se a fonte demorar, mede com o que houver depois de 1,2 s */
function fontePronta(){if(fonteOk)return;fonteOk=true;medido=false;layout()}
try{if(D.fonts&&D.fonts.load){Promise.race([D.fonts.load("800 100px "+getComputedStyle(D.body).fontFamily.split(",")[0]),D.fonts.ready]).then(fontePronta,fontePronta)}else fontePronta()}catch(e){fontePronta()}
setTimeout(fontePronta,1200);
addEventListener("resize",layout);if(window.visualViewport)window.visualViewport.addEventListener("resize",layout);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){if(!medido)fontePronta()});
requestAnimationFrame(frame);
})();
