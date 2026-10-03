/* Abertura: o primeiro corte. Camada de vidro com o título; a lâmina (arrastar na vertical atravessando o título) divide a camada;
   só depois do corte aparece "Iniciar jornada". 360/390/414 × (normal, Reduzir Movimento), teclado e sem JS. */
const {chromium}=require('playwright');
const URL=process.env.CAPA||'http://localhost:8766/index.html';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{});let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  const faixa=p=>p.evaluate(()=>{const r=document.getElementById('band').getBoundingClientRect();return {top:r.top,bot:r.bottom}});
  const arrasta=async(cd,x,y0,y1,n=14)=>{const tp=(t,y)=>cd.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y}]});await tp('touchStart',y0);for(let i=1;i<=n;i++){await tp('touchMove',y0+(y1-y0)*i/n);await new Promise(r=>setTimeout(r,16))}await tp('touchEnd',0)};
  for(const reduzido of [false,true])for(const [w,h,ua] of [[360,740,'Android'],[390,844,'iPhone'],[414,896,'iPhone']]){
    const rot=`${w}px ${ua}${reduzido?' (Reduzir Movimento)':''}`;
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:reduzido?'reduce':'no-preference'});
    const p=await c.newPage();const cd=await c.newCDPSession(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.waitForTimeout(1500);
    ok(await p.evaluate(()=>/Cortando Histórias/.test(document.querySelector('h1').textContent)&&document.querySelectorAll('.gl').length>0),`${rot}: título em vidro presente`);
    ok(await p.evaluate(()=>document.getElementById('entrar').hidden&&!document.querySelector('button')),`${rot}: nenhum botão antes do corte`);
    ok(await p.evaluate(()=>+getComputedStyle(document.getElementById('blade')).opacity===0&&+getComputedStyle(document.getElementById('hint')).opacity>.5),`${rot}: lâmina escondida, só a microinstrução`);
    const g=await faixa(p),x=w*.55;
    await arrasta(cd,x,g.top+4,g.top+(g.bot-g.top)*.4);await p.waitForTimeout(300);
    ok(await p.evaluate(()=>!document.getElementById('stage').classList.contains('cut')),`${rot}: arrasto curto não corta`);
    await arrasta(cd,x,g.top-20,g.bot+20);await p.waitForTimeout(1000);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('cut')),`${rot}: arrastar atravessando o título corta`);
    ok(await p.evaluate(()=>{const a=document.getElementById('entrar'),r=a.getBoundingClientRect(),s=getComputedStyle(a);return !a.hidden&&+s.opacity>.95&&r.height>=44&&r.height<=52&&/Iniciar jornada/.test(a.textContent)}),`${rot}: "Iniciar jornada" só aparece depois, com 44–52 px`);
    ok(await p.evaluate(()=>{const a=document.getElementById('entrar').getBoundingClientRect(),W=innerWidth;return a.right<=W&&a.left>=0}),`${rot}: botão dentro da tela`);
    await p.tap('#entrar');await p.waitForTimeout(1500);
    ok(/lab\.html/.test(p.url())&&/boas-vindas/.test(p.url()),`${rot}: botão leva às boas-vindas`);
    ok(!errs.length,`${rot}: sem erros ${errs}`);await c.close();
  }
  { /* teclado: a linha de corte é um controle deslizante */
    const c=await b.newContext({viewport:{width:1280,height:760}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1200);
    await p.focus('#band');await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');
    const v=await p.getAttribute('#band','aria-valuenow');await p.keyboard.press('Enter');await p.waitForTimeout(1200);
    ok(+v>50&&await p.evaluate(()=>document.getElementById('stage').classList.contains('cut')&&document.activeElement.id==='entrar'),'teclado: setas movem a linha, Enter corta e leva o foco ao botão');
    await c.close() }
  { /* mouse: passar o cursor mostra a lâmina; arrastar corta */
    const c=await b.newContext({viewport:{width:1280,height:760}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1200);
    const g=await faixa(p);await p.mouse.move(640,(g.top+g.bot)/2,{steps:4});await p.waitForTimeout(250);
    ok(await p.evaluate(()=>document.getElementById('blade').classList.contains('on')&&document.getElementById('stage').classList.contains('aim')),'mouse: sobre o título aparece a lâmina');
    await p.mouse.down();await p.mouse.move(650,g.top-20,{steps:6});await p.mouse.move(650,g.bot+20,{steps:12});await p.mouse.up();await p.waitForTimeout(1000);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('cut')&&!document.getElementById('entrar').hidden),'mouse: arrastar corta e mostra o botão');
    await c.close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,javaScriptEnabled:false});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(400);
    ok(await p.evaluate(()=>{const a=document.querySelector('.ns');return !!a&&a.getBoundingClientRect().height>0&&/boas-vindas/.test(a.href)}),'sem JS: link de texto para o laboratório');await c.close() }
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
