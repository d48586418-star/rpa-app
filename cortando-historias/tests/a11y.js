/* Auditoria de acessibilidade: nome acessível, alt, alvo de toque, contraste (AA 4.5:1) em claro/escuro, rotas principais, 390px.
   uso: NODE_PATH=... node tests/a11y.js  (servidor em localhost:8766) */
const {chromium}=require('playwright');
const URL=process.env.URL||'http://localhost:8766/lab.html';
const AUDITORIA=()=>{
        const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0&&+s.opacity>0&&!e.closest('[hidden],[aria-hidden="true"]')};
        const nome=e=>(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')&&document.getElementById(e.getAttribute('aria-labelledby').split(' ')[0])?.textContent||e.textContent||e.getAttribute('title')||'').trim();
        const sem=[],peq=[],alt=[];
        document.querySelectorAll('button,a[href],[role="button"],[role="slider"],input:not([type=hidden]),select,textarea,summary').forEach(e=>{if(!vis(e))return;
          if(!nome(e)&&!(e.labels&&e.labels.length)&&!e.getAttribute('placeholder'))sem.push(e.outerHTML.slice(0,80));
          const r=e.getBoundingClientRect();if(!/^(input|select|textarea)$/i.test(e.tagName)&&(r.width<40||r.height<40)&&!e.closest('.sw-dots,.tl-scroll,.mm,.cl-f')&&!(e.tagName==='A'&&getComputedStyle(e).display==='inline'))peq.push((e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height))});
        document.querySelectorAll('img').forEach(i=>{if(vis(i)&&!i.hasAttribute('alt'))alt.push(i.src.split('/').pop())});
        /* contraste: cor do texto contra o fundo composto (camadas translúcidas sobre o ancestral opaco); ignora fundos com imagem/gradiente */
        const lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};const lum=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
        const rgb=s=>{if(!s||s==='transparent')return[0,0,0,0];let m=s.match(/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)/);if(m)return[+m[1]*255,+m[2]*255,+m[3]*255,m[4]===undefined?1:+m[4]];m=s.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]===undefined?1:+m[3]]:[0,0,0,0]};
        const bgOf=e=>{const layers=[];let x=e,imagem=false;while(x){const s=getComputedStyle(x),c=rgb(s.backgroundColor);if(s.backgroundImage&&s.backgroundImage!=='none'&&x!==document.documentElement)imagem=true;if(c[3]>0)layers.push(c);if(c[3]>=1)break;x=x.parentElement}
          let base=[255,255,255];for(let i=layers.length-1;i>=0;i--){const c=layers[i],a=c[3];base=[c[0]*a+base[0]*(1-a),c[1]*a+base[1]*(1-a),c[2]*a+base[2]*(1-a)]}return{c:base,imagem}};
        const pobre=[];const seen=new Set();
        document.querySelectorAll('p,li,span,b,h1,h2,h3,h4,a,button,label,small,summary,dd,dt,em,i').forEach(e=>{
          if(!vis(e)||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1))return;
          const s=getComputedStyle(e),f=rgb(s.color),B=bgOf(e);if(B.imagem)return;
          const op=f[3]*(+s.opacity||1);const fg=[f[0]*op+B.c[0]*(1-op),f[1]*op+B.c[1]*(1-op),f[2]*op+B.c[2]*(1-op)];
          const l1=lum(fg),l2=lum(B.c),cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const sz=parseFloat(s.fontSize),big=sz>=24||(sz>=18.7&&+s.fontWeight>=700);
          if(cr<(big?3:4.5)){const k=e.className+'|'+cr.toFixed(1);if(!seen.has(k)){seen.add(k);pobre.push((e.className||e.tagName)+' '+cr.toFixed(1)+':1 "'+e.textContent.trim().slice(0,24)+'"')}}});
        return{sem,peq:[...new Set(peq)],alt,pobre};
      };
const ROTAS_ANT=['#/inicio','#/percurso','#/descobertas','#/edicao','#/guia','#/museu','#/museu/kuleshov','#/caderno','#/eu','#/livre','#/lab/EX_BROLL_001','#/lab/EX_CORTE_004C','#/lab/EX_JCUT_001','#/creditos'];
const ROTAS=['#/inicio','#/percurso','#/descobertas','#/edicao','#/guia','#/museu','#/museu/kuleshov','#/museu/murch','#/caderno','#/eu','#/livre','#/lab/EX_BROLL_001','#/lab/EX_CORTE_004C','#/lab/EX_JCUT_001','#/lab/EX_EXPERIMENTO_001','#/creditos','#/contraste','#/boas-vindas'];
(async()=>{
  const b=await chromium.launch();let bad=0;
  for(const [tema,W,H] of [['light',390,844],['dark',390,844],['light',1280,800],['dark',1280,800],['light',360,740]]){
    const c=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700,reducedMotion:'reduce'});
    await c.addInitScript(t=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'Marina',persona:'ritmo',onboarded:true},seen:{tour:1}}));if(t==='dark')localStorage.setItem('ch:tema','dark')},tema);
    const p=await c.newPage();
    for(const r of ROTAS){
      await p.goto(URL+r);await p.waitForTimeout(700);
      const out=await p.evaluate(AUDITORIA);
      const n=out.sem.length+out.alt.length;const ruins=out.pobre.length+out.peq.length;
      if(n||ruins)bad++;
      console.log((n||ruins?'✗':'·')+` ${tema} ${W} ${r}  sem-nome:${out.sem.length} sem-alt:${out.alt.length} alvos<40px:${out.peq.length} contraste<AA:${out.pobre.length}`);
      if(out.sem.length)console.log('    sem nome:',out.sem.slice(0,3).join(' | '));
      if(out.peq.length)console.log('    alvos pequenos:',out.peq.slice(0,5).join(' | '));
      if(out.pobre.length)console.log('    contraste:',out.pobre.slice(0,6).join(' | '));
    }
    await c.close();
  }
  /* cada perfil (cor própria) × claro/escuro: boas-vindas (passos 3 e 4), palco de Meu espaço, tutorial */
  for(const tema of ['light','dark'])for(const pe of ['historias','ritmo','olhar','som','experimental']){
    const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await c.addInitScript(t=>{if(t==='dark')localStorage.setItem('ch:tema','dark')},tema);
    const p=await c.newPage();const rel=[];
    const rep=async(nome)=>{const out=await p.evaluate(AUDITORIA);const ruins=out.pobre.length+out.sem.length+out.alt.length;if(ruins)bad++;rel.push((ruins?'✗':'·')+' '+nome+' sem-nome:'+out.sem.length+' contraste<AA:'+out.pobre.length+(out.pobre.length?' → '+out.pobre.slice(0,4).join(' | '):''))};
    await p.goto(URL+'#/boas-vindas');await p.waitForTimeout(700);
    await p.fill('#w-nm','Marina');await p.click('#w-name button[type=submit]');await p.waitForTimeout(700);
    await p.evaluate(id=>{const i=CH.PERSONAS?Object.keys(CH.PERSONAS).indexOf(id):0;const sw=document.getElementById('pk2-track');sw.scrollLeft=sw.clientWidth*i},pe);await p.waitForTimeout(700);
    await rep(`${tema} ${pe} boas-vindas (escolha)`);
    await p.click('.pf.on [data-confirm]');await p.waitForTimeout(700);await rep(`${tema} ${pe} boas-vindas (final)`);
    await p.goto(URL+'#/eu');await p.waitForTimeout(800);await rep(`${tema} ${pe} Meu espaço (palco)`);
    rel.forEach(x=>console.log(x));await c.close();
  }
  await b.close();console.log(bad?`\nFALHAS DE NOME/ALT: ${bad}`:'\nSEM FALHAS DE NOME/ALT');
})();
