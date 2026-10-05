/* Abertura em 3 cenas: (1) navalha na borda esquerda; (2) o aluno a arrasta para a direita e corta; (3) título nasce e a bolinha da pílula (à esquerda) arrastada para a direita faz o zoom e leva direto à escolha de perfil.
   360/390/430 (toque) × (normal, Reduzir Movimento), mouse 1920, teclado e sem JS. */
const {chromium}=require('playwright');
const URL=process.env.CAPA||'http://localhost:8766/index.html';const LAB_URL=URL.replace('index.html','lab.html')+'#/escolher';
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
    ok(bl.x>0&&bl.x<w*.2&&Math.abs(bl.y/h-.53)<.08&&bl.h>=60,`${rot}: cena 1 — navalha na borda esquerda, meia altura, ≥ 60 px`);
    ok(await p.evaluate(()=>/cortar e abrir/.test(document.getElementById('hint').textContent)&&+getComputedStyle(document.getElementById('hint')).opacity>.8&&!document.getElementById('stage').classList.contains('exit')),`${rot}: instrução "Arraste para cortar e abrir"`);
    await toque(cd,bl.x,bl.y,w*.2,bl.y);await p.waitForTimeout(700);
    ok(await p.evaluate(()=>!document.getElementById('stage').classList.contains('exit')&&+getComputedStyle(document.getElementById('blade')).opacity>.9),`${rot}: arrasto curto não corta; a navalha volta`);
    const b2=await centro(p,'blade');
    await toque(cd,b2.x,b2.y,w*.88,b2.y);await p.waitForTimeout(2600);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('exit')&&document.getElementById('stage').classList.contains('title')),`${rot}: arrastar até a direita corta e o título nasce`);
    ok(await p.evaluate(()=>{const t=document.getElementById('ttl').getBoundingClientRect();return t.width>0&&document.getElementById('ln2').getBoundingClientRect().width>innerWidth*.45}),`${rot}: "Histórias" ocupa ≥ 45% da largura`);
    ok(await p.evaluate(()=>{const e=document.getElementById('pill'),r=e.getBoundingClientRect();return e.classList.contains('show')&&r.height>=52&&r.left>=0&&r.right<=innerWidth}),`${rot}: pílula "Arraste para iniciar" (≥ 52 px) dentro da tela`);
    const pl=await centro(p,'pill'),kn=await centro(p,'knob');
    await toque(cd,kn.x,kn.y,pl.x+pl.w/2-10,kn.y);await p.waitForTimeout(1500);
    ok(/lab\.html/.test(p.url())&&/escolher/.test(p.url()),`${rot}: arrastar a bolinha (esq→dir) leva às boas-vindas`);
    ok(await p.evaluate(()=>!!document.querySelector('#pick')&&!document.querySelector('.ws3').hidden&&/Escolha o seu perfil/.test(document.querySelector('.pf-kick').textContent)),`${rot}: chega direto na escolha de perfil (sem capa nem nome)`);
    ok(!errs.length,`${rot}: sem erros ${errs}`);await c.close();
  }
  { /* armazenamento bloqueado (visualizadores restritos): arrastar a bolinha ainda leva à escolha de perfil */
    const c=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    await c.addInitScript(()=>{const t=()=>{throw new DOMException('blocked','SecurityError')};try{Object.defineProperty(window,'localStorage',{get:t});Object.defineProperty(window,'sessionStorage',{get:t})}catch(e){}});
    const p=await c.newPage();const cd=await c.newCDPSession(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.waitForTimeout(1800);
    let bl=await centro(p,'blade');await toque(cd,bl.x,bl.y,390*.88,bl.y);await p.waitForTimeout(3800);
    const pl=await centro(p,'pill'),kn=await centro(p,'knob');await toque(cd,kn.x,kn.y,pl.x+pl.w/2-8,kn.y);await p.waitForTimeout(3600);
    ok(/lab\.html#\/escolher/.test(p.url()),'sem armazenamento: a bolinha leva a lab.html#/escolher');
    ok(await p.evaluate(()=>!!document.querySelector('.pf-kick')&&!document.querySelector('.ws3').hidden),'sem armazenamento: aparece a escolha de perfil (não a capa)');
    ok(!errs.length,'sem armazenamento: sem erros de script '+errs.slice(0,2));await c.close() }
  { /* voltar para a abertura (bfcache/retorno ao app) não deixa a tela congelada no zoom */
    const c=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true});const p=await c.newPage();const cd=await c.newCDPSession(p);
    await p.goto(URL);await p.waitForTimeout(1800);let bl=await centro(p,'blade');await toque(cd,bl.x,bl.y,390*.88,bl.y);await p.waitForTimeout(3800);
    const pl=await centro(p,'pill'),kn=await centro(p,'knob');await toque(cd,kn.x,kn.y,pl.x+pl.w/2-8,kn.y);await p.waitForTimeout(3600);
    ok(await p.evaluate(()=>!document.querySelector('.lab-frame')),'toque: sem iframe invisível (leve)');
    await p.click('.ws3 .w-back');await p.waitForTimeout(1500);
    ok(await p.evaluate(()=>!!document.getElementById('pill')&&!document.querySelector('.portal')),'Voltar leva à abertura nova (sem círculo branco preso)');
    /* retorno por bfcache/app em segundo plano: simula pageshow persistido logo após o zoom */
    bl=await centro(p,'blade');await toque(cd,bl.x,bl.y,390*.88,bl.y);await p.waitForTimeout(3800);
    const pl2=await centro(p,'pill'),kn2=await centro(p,'knob');await p.route('**/lab.html**',async r=>{await new Promise(x=>setTimeout(x,9000));r.continue().catch(()=>{})});await toque(cd,kn2.x,kn2.y,pl2.x+pl2.w/2-8,kn2.y);await p.waitForTimeout(500);
    await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await p.waitForTimeout(300);
    ok(await p.evaluate(()=>!document.querySelector('.portal')&&!document.getElementById('stage').classList.contains('go')&&document.getElementById('base').style.transform===''),'pageshow persistido limpa o zoom congelado');await c.close() }
  { /* se a troca de página falhar, o link manual aparece e a navegação é tentada de novo */
    const c=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true});const p=await c.newPage();const cd=await c.newCDPSession(p);
    await p.route('**/lab.html**',async r=>{await new Promise(x=>setTimeout(x,9000));r.continue().catch(()=>{})});
    await p.goto(URL);await p.waitForTimeout(1800);let bl=await centro(p,'blade');await toque(cd,bl.x,bl.y,390*.88,bl.y);await p.waitForTimeout(3800);
    const pl=await centro(p,'pill'),kn=await centro(p,'knob');await toque(cd,kn.x,kn.y,pl.x+pl.w/2-8,kn.y);await p.waitForTimeout(3700);
    ok(await p.evaluate(()=>{const l=document.getElementById('entrar-link');return !!l&&!l.hidden}),'navegação falhou: o link "Entrar" aparece como saída manual');await c.close() }
  { /* título estável depois do corte (sem "pulo") e fonte atrasada em 1,5 s */
    const c=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true});const p=await c.newPage();const cd=await c.newCDPSession(p);
    await p.route('**/*.woff2',async r=>{await new Promise(x=>setTimeout(x,1500));r.continue().catch(()=>{})});
    await p.goto(URL);await p.waitForTimeout(2200);let bl=await centro(p,'blade');await toque(cd,bl.x,bl.y,390*.88,bl.y);await p.waitForTimeout(2200);
    const amostras=[];for(let i=0;i<14;i++){await p.waitForTimeout(150);amostras.push(await p.evaluate(()=>{const r=document.getElementById('ln2').getBoundingClientRect();return [r.x,r.y,r.width]}))}
    const d=k=>Math.max(...amostras.map(a=>a[k]))-Math.min(...amostras.map(a=>a[k]));
    ok(d(0)<=2&&d(1)<=2&&d(2)<=8,'título não pula depois do corte (Δx '+d(0).toFixed(1)+', Δy '+d(1).toFixed(1)+', Δlargura '+d(2).toFixed(1)+')');await c.close() }
  { /* abrir a escolha direto, com rede lenta e sem cache: nunca branco (cor de chegada + "Carregando…") */
    const c=await b.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true});const p=await c.newPage();const cd=await c.newCDPSession(p);
    await cd.send('Network.enable');await cd.send('Network.setCacheDisabled',{cacheDisabled:true});await cd.send('Network.emulateNetworkConditions',{offline:false,latency:200,downloadThroughput:150*1024,uploadThroughput:100*1024});
    p.goto(LAB_URL).catch(()=>{});await p.waitForTimeout(500);
    const cor=await p.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor+'|'+!!document.getElementById('boot-splash'));
    ok(/rgb\(155, 87, 69\)\|true/.test(cor),'escolha aberta a frio: fundo terracota e "Carregando…" desde o primeiro instante ('+cor+')');await c.close() }
  { /* mouse em tela larga + soltar no meio volta */
    const c=await b.newContext({viewport:{width:1920,height:1080}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1800);
    const bl=await centro(p,'blade');
    ok(Math.abs(bl.x/1920-.021)<.012&&Math.abs(bl.y/1080-.528)<.01,`1920: navalha em ${(bl.x/1920*100).toFixed(1)}% × ${(bl.y/1080*100).toFixed(1)}% (referência espelhada 2,1% × 52,8%)`);
    await p.mouse.move(bl.x,bl.y);await p.mouse.down();await p.mouse.move(770,bl.y,{steps:18});await p.waitForTimeout(250);
    const cunha=await p.evaluate(()=>[getComputedStyle(document.getElementById('stage')).getPropertyValue('--tht').trim(),getComputedStyle(document.getElementById('stage')).getPropertyValue('--thb').trim()]);
    ok(parseFloat(cunha[0])<-9&&parseFloat(cunha[0])>-13&&parseFloat(cunha[1])>6&&parseFloat(cunha[1])<10,`1920: cunha aberta como na imagem 2 (${cunha.join(' / ')})`);
    await p.mouse.move(420,bl.y,{steps:8});await p.mouse.up();await p.waitForTimeout(900);
    ok(await p.evaluate(()=>!document.getElementById('stage').classList.contains('exit')),'1920: soltar com menos de 55% do curso volta ao início');
    await c.close() }
  { /* teclado */
    const c=await b.newContext({viewport:{width:1280,height:720}});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(1800);
    await p.focus('#blade');await p.keyboard.press('Enter');await p.waitForTimeout(3300);
    ok(await p.evaluate(()=>document.getElementById('stage').classList.contains('title')&&document.activeElement.id==='pill'),'teclado: Enter na navalha corta e leva o foco à pílula');
    await p.keyboard.press('Enter');await p.waitForTimeout(1200);
    ok(/lab\.html/.test(p.url()),'teclado: Enter na pílula entra no laboratório');await c.close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,javaScriptEnabled:false});const p=await c.newPage();await p.goto(URL);await p.waitForTimeout(400);
    ok(await p.evaluate(()=>{const a=document.querySelector('.ns');return !!a&&a.getBoundingClientRect().height>0&&/escolher/.test(a.href)}),'sem JS: título e link de texto para o laboratório');await c.close() }
  await b.close();console.log(bad?`\nFALHOU ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
