/* Capa: "Corte para iniciar"; arrastar para baixo (toque CDP) abre o papel, surgem texto e botão "Iniciar jornada".
   360/390/414 × (normal, Reduzir Movimento). */
const {chromium}=require('playwright');
const URL=process.env.CAPA||'http://localhost:8766/index.html';
(async()=>{
  const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  for(const reduzido of [false,true])for(const [w,h,ua] of [[360,740,'Android'],[390,844,'iPhone'],[414,896,'iPhone']]){
    const rot=`${w}px ${ua}${reduzido?' (Reduzir Movimento)':''}`;
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:reduzido?'reduce':'no-preference'});
    const p=await c.newPage();const cdp=await c.newCDPSession(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.waitForTimeout(800);
    ok(await p.evaluate(()=>/Corte para iniciar/.test(document.querySelector('#instr').textContent)&&!/Desenvolvido|Claude/.test(document.body.innerText)),`${rot}: instrução e nenhum crédito`);
    ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#entrar')).visibility==='hidden'),`${rot}: botão ainda escondido`);
    const t=()=>p.evaluate(()=>+getComputedStyle(document.documentElement).getPropertyValue('--t')||0);
    const sy=(type,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:60,y}]});
    const arrasta=async(de,ate,n=20)=>{await sy('touchStart',de);for(let i=1;i<=n;i++){await sy('touchMove',de+(ate-de)*i/n);await p.waitForTimeout(16)}await sy('touchEnd',0)};
    await arrasta(h*.2,h*.28,6);await p.waitForTimeout(900);
    ok(await t()<.02,`${rot}: arrasto curto volta ao início`);
    await arrasta(h*.2,h*.45,12);await p.waitForTimeout(120);
    ok(await t()>.1,`${rot}: arrastar para baixo abre o papel (--t ${(await t()).toFixed(2)})`);
    await p.waitForTimeout(1200);
    ok(await t()>.95,`${rot}: soltando depois de 35% conclui`);
    ok(await p.evaluate(()=>{const g=document.querySelector('#entrar'),r=g.getBoundingClientRect();return getComputedStyle(g).visibility==='visible'&&+getComputedStyle(g).opacity>.95&&r.height>=48&&/Iniciar jornada/.test(g.textContent)}),`${rot}: botão "Iniciar jornada" visível`);
    if(reduzido)ok(await p.evaluate(()=>!document.querySelector('#cam').style.transform),`${rot}: sem zoom`);
    await p.tap('#entrar');await p.waitForTimeout(1500);
    ok(/lab\.html/.test(p.url())&&/boas-vindas/.test(p.url()),`${rot}: botão leva às boas-vindas`);
    ok(!errs.length,`${rot}: sem erros ${errs}`);await c.close();
    const c2=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:reduzido?'reduce':'no-preference'});const q=await c2.newPage();await q.goto(URL);await q.waitForTimeout(600);
    await q.tap('#instr');await q.waitForTimeout(1800);
    ok(await q.evaluate(()=>document.documentElement.classList.contains('aberta')),`${rot}: tocar na instrução abre sozinho`);await c2.close();
  }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true});const p=await c.newPage();await p.route('**/abertura.js',r=>r.abort());await p.goto(URL);await p.waitForTimeout(600);
    ok(await p.evaluate(()=>{const a=document.querySelector('#entrar'),r=a.getBoundingClientRect();return a.href&&r.height>=44&&getComputedStyle(a).visibility==='visible'}),'sem JS: "Iniciar jornada" visível');await c.close() }
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
