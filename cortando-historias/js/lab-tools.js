/* lab-tools.js — a timeline como timeline de edição de verdade:
  , arrastar um clipe muda a ordem (mouse e toque)
  , ferramenta TESOURA: escolher a ferramenta, tocar no ponto do clipe, o clipe se divide em dois
  , tocar num pedaço seleciona; Remover apaga. */
(function(){
"use strict";
const CH=window.CH,{$,esc,icon}=CH,P=CH.Lab.prototype;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const MIN=.6;

P.anyCut=function(){return this.pool().some(id=>this.canSplit(id)||this.canTrim(id))};
P.pool=function(){return this.free?CH.data.takes.map(t=>t.id):this.act.pool};

P.setTool=function(t){
  this.tool=t;const on=t==="scissors";
  this.$("#tl").classList.toggle("scissors",on);
  const b=this.$("#b-scis");if(b)b.setAttribute("aria-pressed",on);
  const h=this.$("#tl-hint");if(h)h.textContent=on?"Tesoura ativa: toque no ponto do plano onde quer cortar":"";
  if(!on)this.clearGuide();
};
P.clearGuide=function(){const g=this.$(".scissor-guide");g&&g.remove()};
P.guideAt=function(x,cp){
  const inner=this.$("#tl-inner");let g=this.$(".scissor-guide");
  if(!g){g=document.createElement("i");g.className="scissor-guide";g.innerHTML=icon("scissors");inner.append(g)}
  g.style.left=x+"px";
};
P.scissorsAt=function(x,cp){
  const i=+cp.dataset.i,s=this.seq[i],pos=this.lay.pos[i];if(!s||!pos)return;
  if(CH.dur(s)<MIN)return CH.toast("Este trecho é curto demais para cortar.");
  const frac=clamp((x-pos.l)/pos.w,.05,.95),m=s.a+(s.b-s.a)*frac;
  if(this.canSplit(s.id)){this.push();this.seq.splice(i,1,{id:s.id,a:s.a,b:m},{id:s.id,a:m,b:s.b});CH.say("Plano dividido em dois. Toque num pedaço para selecioná-lo.")}
  else if(this.canTrim(s.id)){this.push();s.b=m;CH.say("Plano encurtado até o ponto marcado.")}
  else return CH.toast("Nesta atividade este plano não pode ser cortado.");
  this.sel=i;this.cutAt=.5;this.changed();this.reseq(true);this.clearGuide();
  CH.toast("Cortado. Toque num pedaço e use Remover, ou arraste para mudar a ordem.",2600);
};

const baseBind=P.bind;
P.bind=function(){
  baseBind.call(this);
  this.tool="select";
  const sc=this.$("#tl-scroll"),inner=this.$("#tl-inner");
  const sb=this.$("#b-scis");
  if(sb)sb.onclick=()=>this.setTool(this.tool==="scissors"?"select":"scissors");
  const xOf=e=>e.clientX-inner.getBoundingClientRect().left;
  let st=null;
  sc.addEventListener("pointerdown",e=>{
    const cp=e.target.closest(".cp:not(.au)");
    if(!cp||e.target.closest(".trim-h")||!this.seq.length||!this.lay)return;
    e.stopPropagation();e.preventDefault();
    this.player.pause();
    if(this.tool==="scissors"){this.guideAt(xOf(e),cp);st={mode:"cut",cp};sc.setPointerCapture(e.pointerId);return}
    const i=+cp.dataset.i;
    st={mode:"move",i,cp,x0:e.clientX,moved:false,l0:this.lay.pos[i].l};
    sc.setPointerCapture(e.pointerId);
  },true);
  sc.addEventListener("pointermove",e=>{
    if(this.tool==="scissors"&&!st){const cp=document.elementFromPoint(e.clientX,e.clientY);const c=cp&&cp.closest&&cp.closest(".cp:not(.au)");if(c&&c.closest("#tl-inner"))this.guideAt(xOf(e),c);else this.clearGuide();return}
    if(!st)return;
    if(st.mode==="cut"){this.guideAt(xOf(e),st.cp);return}
    const dx=e.clientX-st.x0;
    if(!st.moved){if(Math.abs(dx)<7)return;st.moved=true;st.cp.classList.add("dragging");this.$("#tl").classList.add("reordering")}
    st.cp.style.transform=`translateX(${dx}px)`;
    /* onde o clipe cairia */
    const pos=this.lay.pos,c=st.l0+pos[st.i].w/2+dx;let j=0;
    pos.forEach((p,k)=>{if(k!==st.i&&p.l+p.w/2<c)j++});
    st.j=j;
    let mk=this.$(".drop-mark");if(!mk){mk=document.createElement("i");mk.className="drop-mark";inner.append(mk)}
    const others=pos.filter((_,k)=>k!==st.i);
    const x=j<=0?0:(others[j-1].l+others[j-1].w);mk.style.left=x+"px";
  });
  const finish=e=>{
    if(!st)return;const s=st;st=null;
    this.$("#tl").classList.remove("reordering");const mk=this.$(".drop-mark");mk&&mk.remove();
    if(s.mode==="cut"){this.scissorsAt(xOf(e),s.cp);return}
    s.cp.classList.remove("dragging");s.cp.style.transform="";
    if(s.moved){
      if(s.j!=null&&s.j!==s.i){
        this.push();const [m]=this.seq.splice(s.i,1);this.seq.splice(s.j,0,m);this.sel=s.j;this.changed();this.reseq(true);
        CH.say("Plano movido para a posição "+(s.j+1));
      }else this.renderTL();
    }else{
      /* toque: seleciona o clipe e leva o ponto de leitura até onde tocou */
      const i=s.i,pos=this.lay.pos[i],g=this.player.segs[i];if(!g)return;
      const f=clamp((xOf(e)-pos.l)/pos.w,.02,.98);
      this.sel=i;this.cutAt=clamp(f,.05,.95);this.t=g.start+f*g.dur;this.mix&&this.mix.stop();this.player.seek(this.t);this.paintTime(this.t);this.renderTL();this.updateButtons();this.paintCredit();
    }
  };
  sc.addEventListener("pointerup",finish);
  sc.addEventListener("pointercancel",e=>{if(st){st.cp.classList.remove("dragging");st.cp.style.transform="";st=null;this.$("#tl").classList.remove("reordering");this.renderTL()}});
  sc.addEventListener("pointerleave",()=>{if(this.tool==="scissors"&&!st)this.clearGuide()});
  /* teclado: Alt+setas move o clipe selecionado */
  sc.addEventListener("keydown",e=>{
    const b=e.target.closest&&e.target.closest(".cp:not(.au)");if(!b||!e.altKey||(e.key!=="ArrowLeft"&&e.key!=="ArrowRight"))return;
    e.preventDefault();this.move(e.key==="ArrowLeft"?-1:1);
    const nb=this.$(`.cp[data-i="${this.sel}"]`);nb&&nb.focus();
  },true);
};
const baseButtons=P.updateButtons;
P.updateButtons=function(){
  baseButtons.call(this);
  const b=this.$("#b-scis");if(!b)return;
  const can=!this.av&&this.anyCut()&&this.seq.length;b.hidden=!can;
  if(!can&&this.tool==="scissors")this.setTool("select");
};
const baseDestroyFix=P.destroy;
})();
