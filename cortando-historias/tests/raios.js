/* Auditoria de raios: todo botão/aba/etiqueta deve ser pílula (raio >= metade da altura) ou círculo. uso: NODE_PATH=... node tests/raios.js */
const {chromium}=require('playwright');
const URL=process.env.URL||'http://localhost:8766/lab.html';
const ROTAS=['#/inicio','#/percurso','#/descobertas','#/guia','#/museu','#/museu/kuleshov','#/caderno','#/eu','#/livre','#/lab/EX_BROLL_001','#/lab/EX_JCUT_001','#/lab/EX_CORTE_004C','#/creditos','#/boas-vindas'];
(async()=>{
  const b=await chromium.launch();let total=0;const todos={};
  for(const [w,h] of [[390,844],[1280,800]]){
    const c=await b.newContext({viewport:{width:w,height:h},isMobile:w<700,hasTouch:w<700});
    await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'Marina',persona:'ritmo',onboarded:true},seen:{tour:1}}))});
    const p=await c.newPage();
    for(const r of ROTAS){
      await p.goto(URL+r);await p.waitForTimeout(600);
      const bad=await p.evaluate(()=>{const out=[];
        document.querySelectorAll('button,a.btn,.btn,[role=tab],[role=radio],.tag,.seg a,.subnav a,.chip,.chips li,summary,select,input[type=text],textarea').forEach(e=>{
          const s=getComputedStyle(e),r=e.getBoundingClientRect();if(!r.width||!r.height||s.display==='none'||s.visibility==='hidden')return;
          if(e.matches('textarea')||e.closest('.cl-h,.trim-h,.tl-scroll,.cp,.take,.sw-dots,.mm,.cl-f,.take-add,.tk-play,.play-fab,.dialog,dialog'))return;
          const rad=parseFloat(s.borderTopLeftRadius)||0,br=parseFloat(s.borderBottomRightRadius)||0,m=Math.min(rad,br);
          if(r.height>=28&&m<r.height/2-1&&!e.matches('summary'))out.push((e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' r='+Math.round(m));
        });return[...new Set(out)]});
      bad.forEach(x=>{todos[x]=(todos[x]||0)+1});total+=bad.length;
    }
    await c.close();
  }
  await b.close();
  Object.entries(todos).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log('✗',k,'×'+v));
  console.log(total?`\n${Object.keys(todos).length} tipos fora do padrão`:'\nTODOS OS CONTROLES SÃO PÍLULA');process.exit(total?1:0);
})();
