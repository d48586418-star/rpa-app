/* Abertura em 3 cenas: (1) navalha na borda direita; (2) o aluno a arrasta para a esquerda e corta; (3) título nasce e a pílula "Arraste para iniciar" leva ao laboratório.
   360/390/430 (toque) × (normal, Reduzir Movimento), mouse 1920, teclado e sem JS. */
const {chromium}=require('playwright');
const URL=process.env.CAPA||'http://localhost:8766/index.html';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{});let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  const centro=(p,id)=>p.evaluate(i=>{const r=document.getElementById(i).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}},id);
  const toque=async(cd,x0,y0,x1,y1,n=16,solta=true)=>{const tp=(t,x,y)=>cd.send('Input.dispatchTouchEvent',{type:t,touchPoints:t==='touchEnd'?[]:[{x,y}]});await tp('touchStart',x0,y0);for(let i=1;i<=n;i++){await tp('touchMove',x0+(x1-x0)*i/n,y0+(y1-y0)*i/n);await new Promise(r=>setTimeout(r,16))}if(solta)await tp('touchEnd',0,0)};
  for(const reduzido of [false,true])for(const [w,h,ua] of [[360,740,'Android'],[390,844,'iPhone'],[430,932,'iPhone']]){
    const rot=`${w}px ${ua}${reduzido?' (Reduzir Movimento)':''}`;
    const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:reduzido?'reduce':'no-preference'});
    const p=await c.newPage();const cd=await c.newCDPSession(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.waitForTimeout(1800);
    const bl=await centro(p,'blade');
    ok(bl.x>w*.8&&bl.x<w&&Math.abs(bl.y/h-.53)<.08&&bl.h>=60,`${rot}: cena 1 — navalha na borda direita, meia altura, ≥ 60 px`);
    ok(await p.evaluate(()=>/cortar e abrir/.test(document.getElementById('hint').textContent)&&+getComputedStyle(document.getElementById('hint')).opacity>.8&&!document.getElementById('stage').classList.contains('exit')),`${rot}: instrução "Arraste para cortar e abrir"`);
    await toque(cd,bl.x,bl.y,w*.8,bl.y);await p.waitForTimeout(700);
    ok(await p.evaluate(()=>!document.getElementById('stage').classList.contains('exit')&&+getComputedStyle(document.getElementById('blade')).opacity>.9),`${rot}: arrasto curto não corta; a navalha volta`);
    const b2=await centro(p,'blade');
    await toque(cd,b2.x,b2.y,w*.12,b2.y);await p.waitForTimeout(2600);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('exit')&&document.getElementById('stage').classList.contains('title')),`${rot}: arrastar até a esquerda corta e o título nasce`);
    ok(await p.evaluate(()=>{const t=document.getElementById('ttl').getBoundingClientRect();return t.width>0&&document.querySelector('#ttl .l2').getBoundingClientRect().width>innerWidth*.45}),`${rot}: "Histórias" ocupa ≥ 45% da largura`);
    ok(await p.evaluate(()=>{const e=document.getElementById('pill'),r=e.getBoundingClientRect();return e.classList.contains('show')&&r.height>=52&&r.left>=0&&r.right<=innerWidth}),`${rot}: pílula "Arraste para iniciar" (≥ 52 px) dentro da tela`);
    const pl=await centro(p,'pill'),kn=await centro(p,'knob');
    await toque(cd,kn.x,kn.y,pl.x-pl.w/2+10,kn.y);await p.waitForTimeout(1500);
    ok(/lab\.html/.test(p.url())&&/boas-vindas/.test(p.url()),`${rot}: arrastar a bolinha leva às boas-vindas`);
    ok(!errs.length,`${rot}: sem erros ${errs}`);await c.close();
  }
  { /* mouse em tela larga + soltar no meio volta */
    const c=await b.newContext({viewport:{width:1920,height:1080}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1800);
    const bl=await centro(p,'blade');
    ok(Math.abs(bl.x/1920-.979)<.012&&Math.abs(bl.y/1080-.528)<.01,`1920: navalha em ${(bl.x/1920*100).toFixed(1)}% × ${(bl.y/1080*100).toFixed(1)}% (referência 97,9% × 52,8%)`);
    await p.mouse.move(bl.x,bl.y);await p.mouse.down();await p.mouse.move(1150,bl.y,{steps:18});await p.waitForTimeout(250);
    const cunha=await p.evaluate(()=>[getComputedStyle(document.getElementById('stage')).getPropertyValue('--tht').trim(),getComputedStyle(document.getElementById('stage')).getPropertyValue('--thb').trim()]);
    ok(parseFloat(cunha[0])<-9&&parseFloat(cunha[0])>-13&&parseFloat(cunha[1])>6&&parseFloat(cunha[1])<10,`1920: cunha aberta como na imagem 2 (${cunha.join(' / ')})`);
    await p.mouse.move(1500,bl.y,{steps:8});await p.mouse.up();await p.waitForTimeout(900);
    ok(await p.evaluate(()=>!document.getElementById('stage').classList.contains('exit')),'1920: soltar com menos de 55% do curso volta ao início');
    await c.close() }
  { /* teclado */
    const c=await b.newContext({viewport:{width:1280,height:720}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1800);
    await p.focus('#blade');await p.keyboard.press('Enter');await p.waitForTimeout(3300);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('title')&&document.activeElement.id==='pill'),'teclado: Enter na navalha corta e leva o foco à pílula');
    await p.keyboard.press('Enter');await p.waitForTimeout(1200);
    ok(/lab\.html/.test(p.url()),'teclado: Enter na pílula entra no laboratório');await c.close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,javaScriptEnabled:false});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(400);
    ok(await p.evaluate(()=>{const a=document.querySelector('.ns');return !!a&&a.getBoundingClientRect().height>0&&/boas-vindas/.test(a.href)}),'sem JS: título e link de texto para o laboratório');await c.close() }
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
