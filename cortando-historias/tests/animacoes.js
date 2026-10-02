/* Animações e som: amostra valores computados ao longo do tempo (entrada das páginas, ritual de conquista) e espiona o WebAudio. */
const {chromium}=require('playwright');
const URL=process.env.URL||'http://localhost:8766/lab.html';
(async()=>{
  const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  const mk=async(rm,fx)=>{const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:rm?'reduce':'no-preference'});
    await c.addInitScript(fx=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'M',persona:'ritmo',onboarded:true},seen:{tour:1,lvl:1},prefs:{motion:'auto',fx:fx,fxSet:1}}));
      window.__osc=0;window.__rv=[];new MutationObserver((m,o)=>{const e=document.querySelector('.rv');if(e){o.disconnect();const t0=performance.now();(function f(){const x=[...document.querySelectorAll('.rv')].map(y=>+getComputedStyle(y).opacity);window.__rv.push(Math.min(...x));if(performance.now()-t0<900)requestAnimationFrame(f)})()}}).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});const A=window.AudioContext||window.webkitAudioContext;if(A){const o=A.prototype.createOscillator;A.prototype.createOscillator=function(){window.__osc++;return o.call(this)}}},fx);
    return c};
  console.log('Entrada das páginas');
  { const c=await mk(false,true);const p=await c.newPage();await p.goto(URL+'#/guia');
    await p.waitForTimeout(1800);
    const a=await p.evaluate(()=>({n:document.querySelectorAll('.rv').length,min:Math.min(...window.__rv),fim:window.__rv[window.__rv.length-1],amostras:window.__rv.length}));
    ok(a.n>=3,`blocos animados (${a.n})`);ok(a.min<.2,`no começo os blocos estão quase invisíveis (mín ${a.min.toFixed(2)})`);ok(a.fim>.95,`e terminam opacos (${a.fim.toFixed(2)}) em ${a.amostras} quadros`);
    const z=await p.evaluate(()=>[...document.querySelectorAll('.rv')].filter(e=>e.getBoundingClientRect().top<innerHeight).map(x=>+getComputedStyle(x).opacity));
    ok(z.length&&z.every(v=>v>.99),'depois de 1,8 s os blocos visíveis estão opacos');await c.close()}
  { const c=await mk(true,true);const p=await c.newPage();await p.goto(URL+'#/guia');
    const a=await p.evaluate(()=>[...document.querySelectorAll('.rv')].length);ok(a===0,'movimento reduzido: nada é escondido para animar');await c.close()}
  console.log('Ritual de conquista e som');
  { const c=await mk(false,true);const p=await c.newPage();await p.goto(URL+'#/inicio');await p.waitForTimeout(600);
    await p.evaluate(()=>CH.ritual({tipo:'Conquista',titulo:'Teste',sub:'x',ic:'cut',cor:'var(--y)'}));await p.waitForTimeout(80);
    const t1=await p.evaluate(()=>getComputedStyle(document.querySelector('.rit-ic')).transform);await p.waitForTimeout(1300);
    const t2=await p.evaluate(()=>getComputedStyle(document.querySelector('.rit-ic')).transform);
    ok(t1!==t2,'medalha anima (transform muda: '+t1.slice(0,22)+' → '+t2.slice(0,22)+')');
    ok(await p.evaluate(()=>document.querySelectorAll('.rit-burst i').length===14&&+getComputedStyle(document.querySelector('.rit-in')).opacity===1),'raios e cartão presentes e opacos no fim');
    ok(await p.evaluate(()=>window.__osc)===4,'som ligado: 4 notas (osciladores) tocadas = '+await p.evaluate(()=>window.__osc));await c.close()}
  { const c=await mk(false,false);const p=await c.newPage();await p.goto(URL+'#/inicio');await p.waitForTimeout(600);
    await p.evaluate(()=>CH.ritual({tipo:'Conquista',titulo:'Teste',sub:'x',ic:'cut'}));await p.waitForTimeout(500);
    ok(await p.evaluate(()=>window.__osc)===0,'som desligado: nenhuma nota');
    ok(!!(await p.$('dialog.rit[open]')),'o ritual aparece mesmo sem som');await c.close()}
  { const c=await mk(true,true);const p=await c.newPage();await p.goto(URL+'#/inicio');await p.waitForTimeout(500);
    await p.evaluate(()=>CH.ritual({tipo:'Conquista',titulo:'Teste',sub:'x',ic:'cut'}));await p.waitForTimeout(300);
    ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.rit-burst')).display)==='none','movimento reduzido: sem raios');await c.close()}
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
