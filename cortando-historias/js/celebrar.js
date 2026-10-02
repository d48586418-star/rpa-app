/* celebrar.js — "Você acertou": estrela no centro da tela, por cima de tudo, dizendo qual efeito o aluno realizou. */
(function(){
"use strict";
const CH=window.CH,esc=CH.esc;
let ov=null,back=null;
function close(){
  if(!ov)return;const o=ov;ov=null;
  document.removeEventListener("keydown",onKey,true);
  o.classList.add("out");setTimeout(()=>o.remove(),CH.reduced&&CH.reduced()?0:320);
  if(back&&back.focus)try{back.focus({preventScroll:true})}catch(e){}
}
function onKey(e){
  if(e.key==="Escape"){e.preventDefault();close()}
  else if(e.key==="Tab"&&ov){const b=ov.querySelectorAll("button");if(!b.length)return;e.preventDefault();b[0].focus()}
}
const STAR="M60 8l14.6 31.4 34.4 4.2-25.4 23.5 6.7 34L60 84.4 29.7 101.1l6.7-34L11 43.6l34.4-4.2z";
/* opts: {nome, novo, frase, sub, onClose} */
CH.celebrate=function(o){
  if(window.CH_NO_CEL)return;
  close();
  back=document.activeElement;
  const bits=Array.from({length:18},(_,i)=>{const a=i/18*360,d=120+(i*37)%90,c=["#c8a020","#a81020","#161618","#e8c84a"][i%4];
    return `<i style="--a:${a}deg;--d:${d}px;--c:${c};--t:${(i%6)*.04}s"></i>`}).join("");
  ov=document.createElement("div");ov.className="celebra";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","ce-t");
  ov.innerHTML=`<div class="ce-card">
    <div class="ce-star" aria-hidden="true"><div class="ce-burst">${bits}</div>
      <svg viewBox="0 0 120 112"><path class="ce-fill" d="${STAR}"/><path class="ce-line" d="${STAR}" pathLength="1"/></svg></div>
    <p class="ce-k">${o.novo?"Parabéns!":"Muito bem!"}</p>
    <h2 class="ce-t display" id="ce-t">${o.novo?"Você conseguiu realizar o efeito":"Você refez o efeito"}<br><em>${esc(o.nome)}</em></h2>
    ${o.frase?`<p class="ce-p">${esc(o.frase)}</p>`:""}
    <button class="btn pri lg ce-b" type="button">${o.novo?"Ver o que descobri":"Continuar"}</button>
  </div>`;
  document.body.append(ov);
  const b=ov.querySelector("button");
  b.addEventListener("click",()=>{close();o.onClose&&o.onClose()});
  ov.addEventListener("click",e=>{if(e.target===ov)close()});
  document.addEventListener("keydown",onKey,true);
  requestAnimationFrame(()=>{ov&&ov.classList.add("in");b.focus({preventScroll:true})});
  if(CH.say)CH.say((o.novo?"Parabéns! Você conseguiu realizar o efeito ":"Você refez o efeito ")+o.nome);
};
CH.celebrateClose=close;
})();
