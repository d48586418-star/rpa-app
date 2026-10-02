/* Abertura: leque de personagens visível e completo em repouso; botão "Iniciar jornada" leva às boas-vindas.
   360/390/414 × (normal, Reduzir Movimento) + sem JS. */
const {chromium}=require('playwright');
const URL=process.env.CAPA||'http://localhost:8766/index.html';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{});let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  for(const reduzido of [false,true])for(const [w,h,ua] of [[360,740,'Android'],[390,844,'iPhone'],[414,896,'iPhone']]){
    const rot=`${w}px ${ua}${reduzido?' (Reduzir Movimento)':''}`;
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:reduzido?'reduce':'no-preference'});
    const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.waitForTimeout(1800);
    ok(await p.evaluate(()=>[...document.querySelectorAll('#fan li')].every(l=>+getComputedStyle(l).opacity>.95)&&document.querySelectorAll('#fan li').length===5),`${rot}: leque aberto, 5 cartões visíveis`);
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),`${rot}: sem rolagem horizontal`);
    ok(await p.evaluate(()=>{const g=document.querySelector('#entrar'),r=g.getBoundingClientRect();return r.height>=48&&r.bottom<=innerHeight+400&&/Iniciar jornada/.test(g.textContent)}),`${rot}: botão "Iniciar jornada" com alvo ≥ 48 px`);
    await p.tap('#entrar');await p.waitForTimeout(1500);
    ok(/lab\.html/.test(p.url())&&/boas-vindas/.test(p.url()),`${rot}: botão leva às boas-vindas`);
    ok(!errs.length,`${rot}: sem erros ${errs}`);await c.close();
  }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true});const p=await c.newPage();await p.route('**/abertura.js',r=>r.abort());await p.goto(URL);await p.waitForTimeout(600);
    ok(await p.evaluate(()=>{const a=document.querySelector('#entrar'),r=a.getBoundingClientRect();return a.href&&r.height>=44&&getComputedStyle(a).visibility==='visible'&&[...document.querySelectorAll('#fan li')].every(l=>+getComputedStyle(l).opacity>.95)}),'sem JS: leque e "Iniciar jornada" visíveis');await c.close() }
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
