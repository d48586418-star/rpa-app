/* passaporte.js — "Salvar minha jornada": gera um PDF (Passaporte da Jornada do Editor) no próprio aparelho.
   Sem servidor. O aluno não vê JSON, IDs nem dados técnicos. jsPDF (MIT) fica em vendor/ e só é carregado quando o botão é usado. */
(function(){
"use strict";
const CH=window.CH;
let loading=null;
function loadPdf(){
  if(window.jspdf)return Promise.resolve();
  return loading||(loading=new Promise((ok,no)=>{const s=document.createElement("script");s.src="vendor/jspdf.umd.min.js";s.onload=ok;s.onerror=()=>no(new Error("pdf"));document.head.append(s)}));
}
function img(src){return new Promise(res=>{const i=new Image();i.onload=()=>{try{const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext("2d").drawImage(i,0,0);res({url:c.toDataURL("image/jpeg",.86),w:i.naturalWidth,h:i.naturalHeight})}catch(e){res(null)}};i.onerror=()=>res(null);i.src=src})}
const hex=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]};
const cut=(t,n)=>t.length>n?t.slice(0,n-1).trimEnd()+"…":t;
const LV=["a revelar","experimentou","descobriu","aprofundou"];

CH.passaporte=async function(){
  CH.toast("Preparando o seu passaporte…",2000);
  try{await loadPdf()}catch(e){return CH.toast("Não foi possível preparar o PDF agora.")}
  const {jsPDF}=window.jspdf,doc=new jsPDF({unit:"mm",format:"a4"}),W=210,H=297,M=16;
  const nome=CH.store.name()||"Editor(a) sem nome",p=CH.persona(),RED=hex("#a81020"),INK=[11,11,11];
  const all=CH.allActs(),prog=Object.fromEntries(all.map(i=>[i,CH.progress(i)]));
  const conc=CH.data.conceitos.conceitos.filter(c=>CH.conceptOpen(c));
  const nver=Object.values(CH.store.state.act).reduce((a,x)=>a+x.versions.length,0);
  const hoje=new Date().toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"});
  /* ---- página 1: a capa ---- */
  doc.setFillColor(...RED);doc.rect(0,0,W,168,"F");
  doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");
  const grid=(txt,y0)=>{const L=[...txt],rows=[L.slice(0,3),L.slice(3,6),L.slice(6)];doc.setFontSize(54);rows.forEach((r,ri)=>r.forEach((ch,ci)=>{const x=ci===0?M:ci===1?W/2:W-M;doc.text(ch,x,y0+ri*19,{align:ci===0?"left":ci===1?"center":"right"})}))};
  grid("CORTANDO",34);grid("HISTÓRIAS",96);
  doc.setFontSize(9);doc.text("PASSAPORTE DA JORNADA DO EDITOR",M,14);
  doc.setTextColor(...INK);doc.setFontSize(11);doc.setFont("helvetica","normal");
  doc.text("Introdução à edição e montagem audiovisual",M,180);
  doc.setFont("helvetica","bold");doc.setFontSize(30);doc.text(cut(nome,22),M,200);
  doc.setFont("helvetica","normal");doc.setFontSize(11);doc.setTextColor(90,90,85);doc.text("começou a Jornada do Editor e registrou aqui o que descobriu.",M,208);
  doc.text(hoje,M,215);
  if(p){
    const im=await img(p.busto);
    if(im){doc.addImage(im.url,"JPEG",W-M-52,176,52,65)}
    else{doc.setFillColor(...hex(p.cor));doc.rect(W-M-52,176,52,65,"F")}
    doc.setFillColor(...hex(p.cor));doc.rect(W-M-52,241,52,10,"F");
    doc.setTextColor(...hex(p.fg));doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text((CH.personaNome()+", "+p.curto).slice(0,28),W-M-26,247.4,{align:"center"});
    doc.setTextColor(...INK);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("Seu olhar de editor",M,232);
    doc.setFont("helvetica","normal");doc.setFontSize(11);doc.text(doc.splitTextToSize("“"+p.pergunta+"”",100),M,239);
    doc.setFontSize(9);doc.setTextColor(90,90,85);doc.text(doc.splitTextToSize("Valoriza: "+p.valoriza.slice(0,4).join(", ")+".",100),M,254);
  }
  doc.setDrawColor(...INK);doc.setLineWidth(.4);doc.line(M,H-16,W-M,H-16);
  doc.setFontSize(8);doc.setTextColor(90,90,85);doc.text("Cortando Histórias, Cinema na Comunidade, Débora Augusta Alves Santos",M,H-11);
  /* ---- página 2: o que você descobriu ---- */
  doc.addPage();doc.setFillColor(...RED);doc.rect(0,0,W,22,"F");
  doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(13);doc.text("O QUE VOCÊ DESCOBRIU",M,14);
  doc.setTextColor(...INK);doc.setFontSize(10);doc.setFont("helvetica","normal");
  let y=34;
  doc.text(`${conc.length} ${conc.length===1?"descoberta":"descobertas"}, ${nver} ${nver===1?"experimento":"experimentos"}, ${all.filter(i=>prog[i].nivel>=1).length} de ${all.length} atividades vividas`,M,y);y+=9;
  if(conc.length){
    conc.forEach(c=>{
      if(y>96)return;
      doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text(c.t,M,y);
      doc.setFont("helvetica","normal");doc.setFontSize(9.5);doc.setTextColor(90,90,85);const t=doc.splitTextToSize(c.ideia,W-2*M-4);doc.text(t,M,y+5);doc.setTextColor(...INK);y+=6+t.length*4.4+3;
    });
  }else{doc.setTextColor(90,90,85);doc.text("Nenhuma técnica ganhou nome ainda. A primeira está a um plano de distância.",M,y);y+=10;doc.setTextColor(...INK)}
  /* fotogramas */
  y=y+4;doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("FOLHA DE CONTATO",M,y);y+=4;
  const cols=6,gw=(W-2*M-(cols-1)*3)/cols,gh=gw*.75;
  const imgs=await Promise.all(all.map(i=>img(CH.capaDe(i))));
  all.forEach((id,k)=>{
    const col=k%cols,row=Math.floor(k/cols),x=M+col*(gw+3),yy=y+row*(gh+9),lv=prog[id].nivel;
    if(lv&&imgs[k]){doc.addImage(imgs[k].url,"JPEG",x,yy,gw,gh)}
    else{doc.setDrawColor(190,190,185);doc.setLineWidth(.3);doc.rect(x,yy,gw,gh)}
    if(lv===1){doc.setFillColor(255,255,255);doc.setGState&&doc.setGState(new doc.GState({opacity:.55}));doc.rect(x,yy,gw,gh,"F");doc.setGState&&doc.setGState(new doc.GState({opacity:1}))}
    doc.setFont("helvetica","normal");doc.setFontSize(6.6);doc.setTextColor(lv>=2?0:130,lv>=2?0:130,lv>=2?0:125);
    doc.text(cut(CH.ACT[id].t,22),x,yy+gh+3.6);doc.setFontSize(6);doc.text(LV[lv],x,yy+gh+6.6);
  });
  const rows=Math.ceil(all.length/cols);y+=rows*(gh+9)+6;
  /* anotações */
  const notes=CH.store.notes().filter(n=>n.kind==="reflexao"||n.kind==="nota"||n.kind==="comparacao").slice(0,3);
  if(notes.length&&y<250){doc.setTextColor(...INK);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("O QUE VOCÊ PERCEBEU",M,y);y+=5;doc.setFont("helvetica","italic");doc.setFontSize(9.5);
    notes.forEach(n=>{if(y>262)return;const t=doc.splitTextToSize("“"+cut(n.text,150)+"”",W-2*M);doc.text(t,M,y);y+=t.length*4.4+2.5})}
  /* mensagem final */
  doc.setFillColor(...RED);doc.rect(0,H-34,W,34,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(11);
  doc.text("Você não aprendeu uma receita.",M,H-22);doc.setFont("helvetica","normal");doc.setFontSize(10);
  doc.text("Aprendeu a perceber o que muda quando você corta. Agora, as escolhas são suas.",M,H-15);
  doc.save("passaporte-da-jornada-do-editor.pdf");
};
})();

/* resumo curto da jornada, em texto, para virar QR Code (cabe em um quadrado legível) */
CH.resumoParaProfessor=function(){
  const all=CH.allActs(),prog=Object.fromEntries(all.map(i=>[i,CH.progress(i)]));
  const nome=CH.store.name()||"Aluno",p=CH.persona();
  const desc=all.filter(i=>prog[i].nivel>=2).map(i=>prog[i].disc[0]||CH.ACT[i].t);
  const ver=Object.values(CH.store.state.act).reduce((a,x)=>a+x.versions.length,0);
  return ("Cortando Histórias\n"+nome+(p?" ("+p.curto+")":"")+"\n"+new Date().toLocaleDateString("pt-BR")+"\n"+desc.length+" de "+all.length+" descobertas, "+ver+" montagens\n"+(desc.length?"Descobertas: "+[...new Set(desc)].slice(0,12).join(", "):"")).slice(0,520);
};
