/* Escolha de perfil (boas-vindas, passo 3): controlador de vidro que recolhe em cápsula.
   Escolher → recolhe, rótulo vira "Reset", vídeo do perfil revelado → Reset → volta à base. 3 ciclos × 5 perfis, clique duplo, teclado, erro de vídeo.
   Uso: PLAYWRIGHT_CHROMIUM=/caminho/chrome node tests/perfil-vidro.js (servidor em PERFIL, padrão http://localhost:8765) */
const {chromium}=require('playwright');
const URL=process.env.PERFIL||'http://localhost:8765/lab.html#/boas-vindas';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM,args:['--autoplay-policy=no-user-gesture-required']}:{args:['--autoplay-policy=no-user-gesture-required']});
  let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  const IDS=['historias','ritmo','olhar','som','experimental'];
  for(const [w,h] of [[1440,900],[1000,800],[1920,1080]]){
    const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.goto(URL);await p.waitForTimeout(600);
    if(await p.isVisible('[data-skipname]')){await p.click('[data-skipname]');await p.waitForTimeout(500)}
    const st=()=>p.evaluate(()=>({cls:document.querySelector('#pk-ctl').className,dis:[...document.querySelectorAll('.pk-b')].map(x=>x.disabled),txt:[...document.querySelectorAll('.pk-b')].map(x=>x.textContent.trim()),on:[...document.querySelectorAll('.pk-v')].filter(v=>v.classList.contains('on')).length,playing:[...document.querySelectorAll('.pk-v.on')].some(v=>!v.paused)}));
    ok(await p.evaluate(()=>document.querySelectorAll('.pk-b').length===5&&!document.querySelector('.pk-ctl [style*="left"]')),`${w}px: 5 perfis; cápsula sem left/width inline`);
    for(let ciclo=0;ciclo<3;ciclo++)for(const id of IDS){
      const sel=`.pk-b[data-id="${id}"]`;
      await p.dblclick(sel);   /* clique duplo não pode enfileirar uma segunda transição */
      await p.waitForTimeout(1900);
      let s=await st();const i=IDS.indexOf(id);
      ok(/collapsed/.test(s.cls)&&s.txt[i]==='Reset'&&s.dis.filter(x=>!x).length===1&&!s.dis[i]&&s.on===1,`${w}px ciclo ${ciclo+1} ${id}: recolhido, "Reset" ativo, único botão ativo, 1 vídeo à vista`);
      if(ciclo===0&&id==='ritmo'){ok(await p.evaluate(()=>[...document.querySelectorAll('.pk-b')].filter(x=>x.disabled).every(x=>x.getAttribute('aria-hidden')==='true'&&x.tabIndex===-1)),`${w}px: demais botões desabilitados, aria-hidden e fora da ordem de tabulação`)}
      await p.click('.pk-b.is-reset');await p.waitForTimeout(1300);
      s=await st();
      ok(!/collapsed|rear-fade|reversing/.test(s.cls)&&s.dis.every(x=>!x)&&s.txt.join()==='Histórias,Ritmo,Olhar,Som,Experimental'&&s.on===0,`${w}px ciclo ${ciclo+1} ${id}: reset volta à base (rótulos, botões, sem vídeo)`);
    }
    /* teclado: Enter escolhe, o foco fica no botão (agora Reset); Enter de novo volta */
    await p.focus('.pk-b[data-id="som"]');await p.keyboard.press('Enter');await p.waitForTimeout(1900);
    ok(await p.evaluate(()=>document.activeElement.classList.contains('is-reset')),`${w}px: foco restaurado no botão que virou Reset`);
    await p.keyboard.press('Enter');await p.waitForTimeout(1300);
    ok(await p.evaluate(()=>document.activeElement.dataset.id==='som'),`${w}px: foco restaurado ao voltar ao rótulo`);
    ok(errs.length===0,`${w}px: sem erros de página ${errs.join('|')}`);
    await p.close();
  }
  /* falha do vídeo: o controle reabre, mostra "Tentar de novo" e nunca fica travado */
  { const p=await b.newPage({viewport:{width:1440,height:900}});
    await p.route(/\/assets\/personas\/olhar\.(webm|mp4)$/,r=>r.abort());
    await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.goto(URL);await p.waitForTimeout(600);
    if(await p.isVisible('[data-skipname]')){await p.click('[data-skipname]');await p.waitForTimeout(500)}
    await p.click('.pk-b[data-id="olhar"]');await p.waitForTimeout(3500);
    const s=await p.evaluate(()=>({retry:!document.querySelector('#pk-err').hidden,cls:document.querySelector('#pk-ctl').className,dis:[...document.querySelectorAll('.pk-b')].map(x=>x.disabled)}));
    ok(s.retry&&!/collapsed/.test(s.cls)&&s.dis.every(x=>!x),'erro de vídeo: barra reaberta, "Tentar de novo" visível, nada travado');
    await p.unroute(/\/assets\/personas\/olhar\.(webm|mp4)$/);await p.click('#pk-retry');await p.waitForTimeout(2200);
    ok(await p.evaluate(()=>document.querySelector('.pk-b.is-reset')&&document.querySelector('#pk-err').hidden),'tentar de novo: com a rede de volta o perfil é selecionado');
    await p.close(); }
  await b.close();console.log(bad?`\n${bad} falhas`:'\nok');process.exit(bad?1:0);
})();
