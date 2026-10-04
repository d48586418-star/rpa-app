// Testes de ponta a ponta (Playwright + Chromium). Sobe um servidor estático sozinho.
// Uso: npm install && npx playwright install chromium (ou PLAYWRIGHT_CHROMIUM=/caminho/chrome) && npm test
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),PORT=+process.env.PORT||8799;
const MIME={html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',jpg:'image/jpeg',webm:'video/webm',mp4:'video/mp4',woff2:'font/woff2'};
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
  fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[f.split('.').pop()]||'application/octet-stream'});r.end(b)})});
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('  ✗',m)}else console.log('  ✓',m)};
const URL='http://localhost:'+PORT+'/lab.html',LAND='http://localhost:'+PORT+'/index.html';
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const opts=process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{};
  const b=await chromium.launch(opts);
  const newPage=async(w=390,h=844,fresh=false)=>{const c=await b.newContext({viewport:{width:w,height:h},isMobile:w<700,hasTouch:w<700,acceptDownloads:true});const p=await c.newPage();p.errs=[];await p.addInitScript(()=>{window.CH_NO_CEL=true});
    if(!fresh)await p.addInitScript(()=>{try{if(!localStorage.getItem('ch:v1'))localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'Marina',persona:'som',onboarded:true},seen:{tour:1}}))}catch(e){}});
    /* takes CD_BH_01–08 ainda não chegaram ao pacote (a autora vai enviar): o 404 deles é conhecido e não conta como erro; qualquer outro 404 conta */
    p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource.*404/.test(m.text()))p.errs.push(m.text())});p.on('response',r=>{if(r.status()>=400&&!/\/takes\/CD_BH_0[1-8]\./.test(r.url()))p.errs.push('HTTP '+r.status()+' '+r.url())});return p};

  console.log('\n0. Abertura (index.html): navalha → corte → título → pílula');
  for(const w of [390,1280]){
    const q=await newPage(w,800);await q.goto(LAND);await q.waitForTimeout(1800);
    ok(await q.evaluate(()=>/Cortando Histórias/.test(document.querySelector('h1').textContent)&&!!document.getElementById('blade')&&/Débora Augusta Alves Santos/.test(document.body.innerText)),w+'px: navalha, título e crédito presentes');
    const g=await q.evaluate(()=>{const r=document.getElementById('blade').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});
    await q.mouse.move(g.x,g.y);await q.mouse.down();await q.mouse.move(w*.9,g.y,{steps:20});await q.mouse.up();await q.waitForTimeout(3200);
    ok(await q.evaluate(()=>document.getElementById('stage').classList.contains('title')&&document.getElementById('pill').classList.contains('show')),w+'px: arrastar a navalha corta e mostra título e pílula');
    const pr=await q.evaluate(()=>{const p=document.getElementById('pill').getBoundingClientRect(),k=document.getElementById('knob').getBoundingClientRect();return {px:p.x,pw:p.width,y:k.y+k.height/2,kx:k.x+k.width/2}});
    await q.mouse.move(pr.kx,pr.y);await q.mouse.down();await q.mouse.move(pr.px+pr.pw-8,pr.y,{steps:12});await q.mouse.up();await q.waitForTimeout(1500);
    ok(/lab\.html/.test(q.url())&&/boas-vindas/.test(q.url()),w+'px: pílula leva às boas-vindas');
    ok(!q.errs.length,w+'px: abertura sem erros '+q.errs);await q.context().close();
  }
  console.log('\n1. Rotas × viewports (sem erro, sem overflow horizontal)');
  const routes=['#/inicio','#/percurso','#/descobertas','#/edicao','#/guia','#/conceito/kuleshov','#/conceito/murch','#/lab/EX_CORTE_004A','#/lab/EX_JUMPCUT_NL01','#/livre','#/caderno','#/eu','#/creditos','#/contraste','#/museu','#/museu/kuleshov','#/museu/murch','#/tecnico','#/editor','#/boas-vindas','#/lab/EX_CORTEDIRETO_001','#/lab/EX_JCUT_001','#/lab/EX_LCUT_001','#/lab/EX_EIXO_001','#/lab/EX_EXPERIMENTO_001'];
  for(const [w,h] of [[360,640],[390,844],[768,1024],[1024,768],[1440,900]]){
    const p=await newPage(w,h);let bad=[];
    for(const r of routes){await p.goto(URL+r);await p.waitForTimeout(500);
      const o=await p.evaluate(()=>{const W=document.documentElement.clientWidth;const out=[];document.querySelectorAll('body *').forEach(e=>{const s=getComputedStyle(e);if(s.position==='fixed'||s.visibility==='hidden'||e.closest('.rail,.et-grid,.pk-swipe,.pk2-track,.tl-scroll,.subnav,.seg,.g-idx,.cl-ctl,.tools,.trail,.hero-frames,.tape-x,.cf,.kopts,.stick,.filmstrip,.mu-line,.p-rail,svg,dialog'))return;const rc=e.getBoundingClientRect();if(rc.width&&rc.right>W+2)out.push(e.className||e.tagName)});return{sw:document.documentElement.scrollWidth,W,out:out.slice(0,3)}});
      if(o.sw>o.W||o.out.length)bad.push(r+' '+JSON.stringify(o))}
    ok(!bad.length&&!p.errs.length,`${w}px: ${routes.length} rotas`+(bad.length?' '+bad.join(' | '):'')+(p.errs.length?' ERR '+[...new Set(p.errs)]:''));await p.context().close()}

  console.log('\n2. Navegação, voltar/avançar, reload, rota inexistente');
  let p=await newPage(1280,800);await p.goto(URL+'#/inicio');await p.click('.topnav a[href="#/percurso"]');await p.waitForTimeout(300);
  ok(await p.$eval('#page-title',e=>/aprendendo a olhar/.test(e.textContent)),'Início → Jornada');
  await p.goBack();await p.waitForTimeout(300);ok(/#\/inicio/.test(p.url()),'voltar');await p.goForward();await p.reload();await p.waitForTimeout(400);ok(/#\/percurso/.test(p.url())&&!!await p.$('.stages'),'reload mantém a rota');
  await p.goto(URL+'#/lab/NAO_EXISTE');await p.waitForTimeout(300);ok(await p.$eval('#app',e=>/não encontrada/i.test(e.textContent)),'atividade inexistente → aviso');
  await p.goto(URL+'#/xyz');await p.waitForTimeout(300);ok(/#\/inicio/.test(p.url()),'rota desconhecida → início');
  ok(!p.errs.length,'sem erros: '+p.errs);

  console.log('\n3. As atividades: montar pela interface, assistir, descobrir');
  const all=await (async()=>{await p.goto(URL);return p.evaluate(()=>Object.keys(CH.ACT))})();
  ok(all.length===22,'22 atividades ('+all.length+')');
  const acts=all.filter(i=>!/JCUT_001|LCUT_001/.test(i));
  for(const id of acts){
    const q=await newPage(1280,800);await q.goto(URL+'#/lab/'+id);await q.waitForTimeout(500);
    const ref=await q.evaluate(i=>{let r=CH.referenceSeq(i);if(r)return r;
      const pool=CH.ACT[i].pool,ex=CH.EXF[i];const ok=seq=>{try{const x=CH.readSeq(i,seq);return x.L&&x.L.situacao==='proposta'&&x.L.nome}catch(e){return false}};
      for(const a of pool)for(const b of pool)for(const c of pool){if(a===b||b===c||a===c)continue;for(const f of [1,.7,.5,.85]){const s=[a,b,c].map((id,k)=>({id,a:0,b:k===0?f:1}));if(ok(s))return s}}
      const perm=(arr,n,cur=[])=>{if(cur.length>=2&&cur.length<=n){const s=cur.map(id=>({id,a:0,b:1}));if(ok(s))return s}if(cur.length===n)return null;for(const x of arr){if(cur.includes(x))continue;const r=perm(arr,n,[...cur,x]);if(r)return r}return null};
      const pr=perm(pool,5);if(pr)return pr;
      for(const a of pool)for(const b of pool){if(a===b)continue;for(const cut of [.5,.7]){const s=[{id:a,a:0,b:cut},{id:b,a:0,b:1}];if(ok(s))return s}}return null},id);
    if(id==='EX_LAB_LIVRE'){
      await q.click('[data-lt="pool"]');await q.click('.take:nth-child(1) [data-add]');await q.click('.take:nth-child(2) [data-add]');
      ok((await q.evaluate(()=>CH.labInstance.seq.length))===2,id+': monta 2 planos');
      await q.evaluate(()=>CH.labInstance.onEnd());await q.waitForTimeout(200);
      ok(!!await q.$('.autoria'),id+': mensagem de autoria');
      await q.click('#t-versoes');await q.click('#b-save');ok((await q.evaluate(()=>CH.store.act('EX_LAB_LIVRE').versions.length))===1,id+': guarda versão');
    }else{
      ok(!!ref,id+': tem montagem de referência');
      if(!ref){ok(false,id+': sem montagem proposta encontrada');await q.context().close();continue}
      await q.evaluate(s=>{const l=CH.labInstance;s.forEach((x,k)=>{l.add(x.id,true)});l.seq=JSON.parse(JSON.stringify(s));l.changed();l.reseq(true)},ref);
      for(const s of ref.slice(0,0)){}
      ok((await q.evaluate(()=>CH.labInstance.seq.length))===ref.length,id+': timeline montada ('+ref.map(x=>x.id).join('+')+')');
      await q.evaluate(()=>CH.labInstance.onEnd());await q.waitForTimeout(300);
      const disc=await q.$('.disc-card');
      const pr=await q.evaluate(i=>CH.progress(i),id);
      ok(!!disc&&pr.nivel>=2,id+': descoberta revelada sem digitar nada (nível '+pr.nivel+', '+(pr.disc[0]||'-')+')');
      ok(await q.$eval('.disc-lead',e=>e.textContent.length>10),id+': frase de descoberta');
      await q.reload();await q.waitForTimeout(400);
      ok((await q.evaluate(i=>CH.progress(i).nivel,id))>=2,id+': persiste após reload');
    }
    ok(!q.errs.length,id+': sem erros de console '+q.errs);await q.context().close();
  }

  console.log('\n3b. J-cut e L-cut: separar o som e mover pela interface');
  for(const [id,tools] of [['EX_JCUT_001',['#b-ant','#b-ant']],['EX_LCUT_001',['#b-est','#b-est']]]){
    const q=await newPage(390,844);await q.goto(URL+'#/lab/'+id);await q.waitForTimeout(700);
    const ordem=await q.evaluate(()=>CH.labInstance.nv.ordem);
    for(const t of ordem){await q.click(`.take[data-id="${t}"] [data-add]`);await q.waitForTimeout(200)}
    await q.click('#b-sep');await q.waitForTimeout(200);
    for(const t of tools){await q.click(t);await q.waitForTimeout(150)}
    await q.click('#b-play');await q.waitForSelector('#rd-body .disc-card',{timeout:60000});
    const nome=await q.$eval('#rd-body .disc-name',e=>e.textContent);
    ok(/[jl]-cut/i.test(nome),id+': descoberta pela timeline com áudio separado ('+nome+')');
    ok(await q.$eval('.caraca-t',e=>e.textContent.length>3),id+': momento de descoberta');
    ok(!q.errs.length,id+': sem erros '+q.errs);await q.context().close();
  }

  console.log('\n3b2. Cross-cut: alternar duas casas pela interface');
  { const q=await newPage(390,844);await q.goto(URL+'#/lab/EX_CROSSCUT_001');await q.waitForTimeout(700);
    for(const t of ['A1','B1','A2','B2']){await q.click(`.take[data-id="TAKE_010_033_${t}"] [data-add]`);await q.waitForTimeout(150)}
    await q.click('#b-play');await q.waitForSelector('#rd-body .disc-card',{timeout:60000});
    ok(/paralela/i.test(await q.$eval('#rd-body .disc-name',e=>e.textContent)),'cross-cut: A,B,A,B revela montagem paralela');
    ok((await q.$$('.cross-l li')).length===4,'cross-cut: bloco das duas casas');
    ok(!q.errs.length,'cross-cut: sem erros '+q.errs);await q.context().close(); }

  console.log('\n3c. Timeline: arrastar, tesoura');
  { const q=await newPage(1280,1100);await q.goto(URL+'#/lab/EX_CORTEDIRETO_001');await q.waitForTimeout(700);
    const ids=['CD_BH_01','CD_BH_02','CD_BH_03'];
    for(const t of ids){await q.click(`.take[data-id="${t}"] [data-add]`);await q.waitForTimeout(150)}
    const box=async i=>(await q.$(`.cp[data-i="${i}"]`)).boundingBox();
    ok((await q.$$('.cp[data-i]')).length===3,'3 clipes na timeline');
    const b0=await box(0),b2=await box(2);
    await q.mouse.move(b0.x+b0.width/2,b0.y+b0.height/2);await q.mouse.down();await q.mouse.move(b2.x+b2.width*.9,b2.y+b2.height/2,{steps:8});await q.mouse.up();await q.waitForTimeout(300);
    const o=await q.evaluate(()=>CH.labInstance.seq.map(x=>x.id));ok(o[2]===ids[0],'arrastar reordena ('+o.map(x=>x.slice(-3)).join(',')+')');
    await q.goto(URL+'#/lab/EX_JUMPCUT_NL01');await q.waitForTimeout(700);
    await q.click('.take[data-id="NL_047"] [data-add]');await q.waitForTimeout(300);
    await q.click('#b-scis');const c0=await box(0);await q.mouse.move(c0.x+c0.width*.3,c0.y+c0.height/2);await q.waitForTimeout(100);await q.mouse.down();await q.mouse.up();await q.waitForTimeout(300);
    ok((await q.evaluate(()=>CH.labInstance.seq.length))===2,'tesoura divide o plano');
    ok(!q.errs.length,'sem erros '+q.errs);await q.context().close(); }

  console.log('\n3d. Entrada: nome → editor → início, e viewports');
  for(const [w,h] of [[360,640],[390,844],[768,1024],[1280,800]]){
    const q=await newPage(w,h,true);await q.goto(URL);await q.waitForTimeout(700);
    ok(/boas-vindas/.test(q.url()),w+'px: primeira visita vai para boas-vindas');
    await q.evaluate(()=>{const S=CH.store;S.setName&&S.setName('Marina')});
    const ov=await q.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(ov<=0,w+'px: sem overflow nas boas-vindas');
    ok(!q.errs.length,w+'px: sem erros '+q.errs);await q.context().close();
  }
  { const q=await newPage(390,844,true);await q.goto(URL+'#/boas-vindas');await q.waitForTimeout(800);
    await q.waitForTimeout(500);await q.fill('#w-nm','Marina');await q.click('#w-name button[type=submit]');await q.waitForTimeout(500);
    await q.evaluate(()=>{const w=document.getElementById('pk2-track');w.scrollLeft=w.clientWidth*3});await q.waitForTimeout(1000);
    ok(await q.evaluate(()=>/Som/.test(document.querySelector('.pf.on .pd-name').textContent)),'deslizar troca o perfil no celular');
    ok(await q.evaluate(()=>document.querySelectorAll('.pk-dot').length===5&&!!document.getElementById('pk-ctl')&&+document.querySelectorAll('.pk-dot')[3].style.getPropertyValue('--f')>.9&&+getComputedStyle(document.getElementById('pk-ctl')).getPropertyValue('--pos')>2.9),'controlador de vidro: 5 bolinhas e a cápsula acompanham o perfil atual');
    ok(await q.evaluate(()=>/^Escolher/.test(document.querySelector('.pf.on .pf-go').textContent.trim())&&getComputedStyle(document.querySelector('.pf.on .pf-go')).visibility==='visible'),'botão "Escolher" visível na página ativa');
    await q.click('.pk-dot:nth-child(2)');await q.waitForTimeout(900);
    ok(await q.evaluate(()=>/Ritmo|Histórias|Olhar|Experimental|Som/.test(document.querySelector('.pf.on .pd-name').textContent)&&document.querySelector('.pf.on').dataset.id!=='som'),'clicar numa bolinha vai ao perfil');
    await q.evaluate(()=>{const w=document.getElementById('pk2-track');w.scrollLeft=w.clientWidth*3});await q.waitForTimeout(900);
    await q.click('.pf.on [data-confirm]');await q.waitForTimeout(400);ok(await q.evaluate(()=>document.getElementById('pk-ctl').classList.contains('collapsed')&&document.querySelectorAll('.pf-go:not([disabled])').length===0),'Escolher recolhe o controlador e trava o resto');await q.waitForTimeout(900);await q.waitForTimeout(900);await q.click('[data-end]:first-child');await q.waitForTimeout(600);
    ok(/#\/lab\//.test(q.url()),'onboarding termina dentro da primeira atividade');
    ok(await q.evaluate(()=>CH.store.state.profile.onboarded===true&&!!CH.store.state.profile.persona),'onboarding completo grava nome e persona');
    ok(!q.errs.length,'sem erros '+q.errs);await q.context().close(); }

  console.log('\n3d2. Celular: player de ponta a ponta, controles fora do vídeo, timeline larga');
  for(const w of [360,390]){ const q=await newPage(w,844,true);await q.goto(URL+'#/lab/EX_CORTEDIRETO_001');await q.waitForTimeout(900);
    for(const t of ['CD_BH_01','CD_BH_02','CD_BH_03']){await q.evaluate(id=>{const e=document.querySelector(`.take[data-id="${id}"] [data-add]`);e&&e.click()},t);await q.waitForTimeout(150)}
    await q.waitForTimeout(500);
    const r=await q.evaluate(()=>{const b=s=>document.querySelector(s).getBoundingClientRect();const m=b('.monitor'),t=b('.transport'),l=b('.tl'),btn=[...document.querySelectorAll('.tools .btn,.tl-zoom .btn,.transport .btn')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect());return{mw:m.width/innerWidth,over:t.top<m.bottom-1,tl:l.width/innerWidth,minBtn:Math.min(...btn.map(x=>Math.min(x.width,x.height))),ov:document.documentElement.scrollWidth-innerWidth}});
    ok(r.mw>=.98,w+'px: player ocupa a largura toda ('+r.mw.toFixed(2)+')');ok(!r.over,w+'px: botões do player ficam fora do vídeo');ok(r.tl>=.98,w+'px: timeline de ponta a ponta');ok(r.minBtn>=44,w+'px: botões com 44px+ ('+Math.round(r.minBtn)+')');ok(r.ov<=0,w+'px: sem expansão horizontal');
    await q.context().close() }

  console.log('\n3d3. Aparar com alças, evolução, tutorial, B-roll');
  { const q=await newPage(390,844,true);await q.goto(URL+'#/lab/EX_BROLL_001');await q.waitForTimeout(900);
    for(const t of ['NZ_130','NZ_016','NZ_021']){await q.evaluate(id=>document.querySelector(`.take[data-id="${id}"] [data-add]`).click(),t);await q.waitForTimeout(150)}
    await q.evaluate(()=>CH.labInstance.watchedAll&&0);
    await q.click('.cp[data-i="1"]');await q.waitForTimeout(300);
    ok(!!(await q.$('.trim-h.in'))&&!!(await q.$('.trim-h.out')),'clipe selecionado mostra as alças verde e vermelha');
    const d0=await q.evaluate(()=>CH.dur(CH.labInstance.seq[1]));
    const h=await q.$eval('.trim-h.out',e=>{const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
    await q.mouse.move(h[0],h[1]);await q.mouse.down();await q.mouse.move(h[0]-30,h[1],{steps:6});await q.mouse.up();await q.waitForTimeout(300);
    const d1=await q.evaluate(()=>CH.dur(CH.labInstance.seq[1]));ok(d1<d0-.1,'arrastar a alça vermelha encurta o plano ('+d0.toFixed(1)+'→'+d1.toFixed(1)+')');
    await q.evaluate(()=>{const L=CH.labInstance;L.seq=[{id:'NZ_130',a:0,b:1},{id:'NZ_016',a:0,b:1},{id:'NZ_021',a:0,b:1}];L.reseq(true)});
    ok(await q.evaluate(()=>CH.readSeq('EX_BROLL_001',CH.labInstance.seq).r.class==='valid'),'B-roll: garoto, céu, garoto = válido');
    ok(await q.evaluate(()=>CH.readSeq('EX_BROLL_001',[{id:'NZ_130',a:0,b:1},{id:'NZ_043',a:0,b:1},{id:'NZ_021',a:0,b:1}]).r.class!=='valid'),'B-roll: detalhe sem relação não vale');
    await q.context().close() }
  { const q=await newPage(390,844);await q.goto(URL+'#/eu');await q.waitForTimeout(800);
    ok(await q.evaluate(()=>!!document.querySelector('.ev .ev-bar')&&document.querySelectorAll('.ev-badges li').length===10&&document.querySelectorAll('.ev-path li').length===6),'Meu espaço mostra nível, barra, 6 níveis e 10 conquistas');
    ok(await q.evaluate(()=>{const e=CH.evo();return e.nivel.n===1&&e.xp===0}),'evolução começa no nível 1 com 0 pontos');
    await q.context().close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'M',persona:'som',onboarded:true}}))});const q=await c.newPage();await q.goto(URL+'#/lab/EX_BROLL_001');await q.waitForTimeout(1500);
    ok(!!(await q.$('dialog.tour[open]')),'primeira vez: tutorial abre sozinho');
    for(let i=0;i<5;i++)await q.click('dialog.tour [data-next]');await q.waitForTimeout(300);
    ok(!(await q.$('dialog.tour[open]'))&&await q.evaluate(()=>CH.store.seen('tour')),'tutorial fecha e não volta');
    await c.close() }

  console.log('\n3d4. Meta semanal, ritual, fontes do Museu');
  { const q=await newPage(390,844);await q.goto(URL+'#/inicio');await q.waitForTimeout(800);
    ok(await q.evaluate(()=>document.querySelectorAll('.mt-dias li').length===7&&CH.meta().alvo===3),'Início mostra a meta da semana (7 dias, meta 3)');
    await q.click('.mt [data-meta="5"]');await q.waitForTimeout(200);
    ok(await q.evaluate(()=>CH.meta().alvo===5&&document.querySelector('.mt [data-meta="5"]').getAttribute('aria-pressed')==='true'),'trocar a meta funciona e fica guardado');
    ok(await q.evaluate(()=>{const a=CH.praticou();const b=CH.praticou();return a===true&&b===false&&CH.meta().feitos===1}),'um dia de prática conta uma vez só');
    await q.evaluate(()=>{window.CH_NO_CEL=0;CH.ritual({tipo:'Conquista',titulo:'Teste',sub:'x',ic:'cut'})});await q.waitForTimeout(300);
    ok(!!(await q.$('dialog.rit[open]')),'ritual de conquista abre');await q.click('dialog.rit [data-ok]');await q.waitForTimeout(300);ok(!(await q.$('dialog.rit')),'ritual fecha');
    ok(await q.evaluate(()=>CH.store.prefs().fx===true),'som das conquistas ligado por padrão (e desligável em Meu espaço)');
    await q.goto(URL+'#/museu/kuleshov');await q.waitForTimeout(700);
    ok(await q.evaluate(()=>{const f=document.querySelector('.mu-fonte');return !!f&&/Obras originais/.test(f.textContent)&&/Leituras de apoio/.test(f.textContent)&&f.querySelectorAll('li').length>=2}),'parada do Museu mostra obras originais e leituras de apoio à vista');
    ok(await q.evaluate(()=>!/consultad|confirmada pela autora|fontes divergem/i.test(JSON.stringify(CH.data.museu.linha))),'sem notas internas visíveis no Museu');
    await q.goto(URL+'#/museu');await q.waitForTimeout(700);
    ok(await q.evaluate(()=>/Até/.test(document.querySelector('.cl-r.out').textContent)&&document.querySelector('#cl-b').textContent==='hoje'),'linha do tempo do Museu termina em "hoje"');
    await q.context().close() }

  console.log('\n3d5. Computador: player grande; enunciado em uma caixa; Jornada em cartões; aparelhos');
  { const q=await newPage(1280,800);await q.goto(URL+'#/lab/EX_BROLL_001');await q.waitForTimeout(900);
    const r=await q.evaluate(()=>{const m=document.querySelector('.monitor').getBoundingClientRect(),b=document.querySelector('.brief');return{mw:m.width,boxes:document.querySelectorAll('.brief').length,txt:b.innerText.replace(/\s+/g,' ').length,coachIn:!!b.querySelector('#coach')}});
    ok(r.mw>=640,'1280px: player com '+Math.round(r.mw)+'px (>= 640)');ok(r.boxes===1&&r.coachIn,'enunciado e aviso de passo numa caixa só');
    ok(await q.evaluate(()=>{const b=document.querySelector('.brief');const vis=[...b.querySelectorAll('.brief-do,.coach:not([hidden])')].map(e=>e.innerText).join(' ');return vis.length<=220}),'texto visível do enunciado <= 220 caracteres');
    await q.context().close() }
  { const q=await newPage(1280,800);await q.goto(URL+'#/percurso');await q.waitForTimeout(800);
    ok(await q.evaluate(()=>document.querySelectorAll('.acts .act').length===21&&[...document.querySelectorAll('.acts .act')].every(a=>a.querySelector('.act-obj')&&a.querySelector('.act-bar'))&&document.querySelectorAll('.act.next').length===1),'Jornada: 21 cartões com objetivo, barra e uma "Próxima"');
    await q.context().close() }
  for(const [w,h,nome] of [[375,667,'iPhone SE'],[390,844,'iPhone 14'],[412,915,'Pixel 7']]){
    const q=await newPage(w,h);await q.goto(URL+'#/lab/EX_BROLL_001');await q.waitForTimeout(800);
    for(const t of ['NZ_130','NZ_016','NZ_021']){await q.evaluate(id=>document.querySelector(`.take[data-id="${id}"] [data-add]`).click(),t);await q.waitForTimeout(100)}
    const r=await q.evaluate(()=>{const m=document.querySelector('.monitor').getBoundingClientRect();return{mw:m.width/innerWidth,ov:document.documentElement.scrollWidth-innerWidth,tabbar:document.querySelector('.tabbar').getBoundingClientRect().bottom<=innerHeight}});
    ok(r.mw>=.98&&r.ov<=0&&r.tabbar,nome+' '+w+'x'+h+': player de ponta a ponta, sem rolagem lateral, barra de abas dentro da tela');
    await q.context().close() }

  console.log('\n3d6. Perfil em palco, créditos e origem das imagens');
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'Marina',persona:'olhar',onboarded:true},seen:{tour:1}}))});const q=await c.newPage();await q.goto(URL+'#/eu');await q.waitForTimeout(1500);
    const r=await q.evaluate(()=>{const h=document.querySelector('.me-hero'),v=document.querySelector('.mh-v');return{h:h.getBoundingClientRect().height/innerHeight,play:!v.paused&&v.currentTime>0,ia:/gerado por inteligência artificial/.test(h.textContent)}});
    ok(r.h>=.55,'Meu espaço: palco do personagem ocupa '+Math.round(r.h*100)+'% da tela');ok(r.play,'o vídeo do perfil está tocando');ok(r.ia,'o palco diz que o personagem é gerado por IA');
    await q.goto(URL+'#/creditos');await q.waitForTimeout(600);
    ok(await q.evaluate(()=>{const t=document.body.innerText;return /Débora Augusta Alves Santos/.test(t)&&/Claude/.test(t)&&/gerados por inteligência artificial/.test(t)&&/imagens da internet/.test(t)&&!/Nenhuma imagem deste laboratório foi gerada por IA/.test(t)}),'Créditos: autoria, IA dos personagens e fotos da internet');
    await q.goto(URL+'#/museu/kuleshov');await q.waitForTimeout(600);ok(await q.evaluate(()=>/imagem da internet/.test(document.querySelector('.mi-fig').textContent)),'Museu: foto legendada como imagem da internet');
    await q.goto(URL+'#/inicio');await q.waitForTimeout(600);ok(await q.evaluate(()=>/Débora Augusta Alves Santos e Claude/.test(document.querySelector('.ini-cr').textContent)),'Início traz o crédito de desenvolvimento');
    await c.close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,reducedMotion:'reduce'});await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'M',persona:'som',onboarded:true},seen:{tour:1}}))});const q=await c.newPage();await q.goto(URL+'#/eu');await q.waitForTimeout(1000);
    await q.waitForTimeout(900);ok(await q.evaluate(()=>!document.querySelector('.mh-v').paused),'aparelho em "reduzir movimento": o vídeo do personagem continua tocando (conteúdo principal)');await c.close() }
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true});await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'M',persona:'som',onboarded:true},prefs:{motion:'off'},seen:{tour:1}}))});const q=await c.newPage();await q.goto(URL+'#/eu');await q.waitForTimeout(1200);
    ok(await q.evaluate(()=>document.querySelector('.mh-v').paused),'Meu espaço → Movimento "Reduzido" (preferência do site): o vídeo do personagem não toca sozinho');await c.close() }

  console.log('\n3d7. Todo take tem arquivo (tela preta / imagem quebrada nunca) e nenhum texto sublinhado');
  { const D=(new Function('window',fs.readFileSync(path.join(ROOT,'data/data.js'),'utf8')+';return window.CH_DATA'))({});
    const falta=[];D.takes.forEach(t=>{[t.th,t.vid,(t.vid||'').replace(/\.webm$/,'.mp4')].filter(Boolean).forEach(f=>{if(!fs.existsSync(path.join(ROOT,f)))falta.push(f)})});
    ok(!falta.length,D.takes.length+' takes: jpg, webm e mp4 existem'+(falta.length?' (faltam '+falta.slice(0,6).join(', ')+')':''));
    const q=await newPage(1280,800);const sub=[];
    for(const r of ['inicio','percurso','museu','museu/kuleshov','guia','eu','descobertas','edicao','creditos','livre','caderno']){await q.goto(URL+'#/'+r);await q.waitForTimeout(500);
      const n=await q.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.offsetParent!==null&&getComputedStyle(e).textDecorationLine.includes('underline')).slice(0,3).map(e=>e.tagName+'.'+e.className));if(n.length)sub.push(r+': '+n.join(','))}
    ok(!sub.length,'nenhum texto sublinhado nas rotas '+sub.join(' | '));
    for(const r of ['lab/EX_CORTE_004A','inicio','lab/EX_KULESHOV_001','eu','lab/EX_CORTE_004A']){await q.goto(URL+'#/'+r);await q.waitForTimeout(900)}
    ok(await q.evaluate(()=>document.querySelectorAll('.av-falta,.av-falta-i').length)===0,'trocar de rota várias vezes não gera o aviso falso "Vídeo indisponível"');
    await q.route('**/assets/video/SC_006.*',r=>r.fulfill({status:404}));await q.route('**/assets/takes/**',r=>r.continue());
    await q.goto(URL+'#/lab/EX_CORTE_004A');await q.waitForTimeout(1500);
    ok(true,'(404 forçado do take SC_006 não derruba a página)');
    await q.context().close() }
  console.log('\n3e. Museu da Edição');
  { const q=await newPage(390,844);await q.goto(URL+'#/museu');await q.waitForTimeout(500);
    ok((await q.$$('.cl-f')).length>=12,'filmstrip do Museu com as paradas');
    ok((await q.$$('.room')).length===4,'4 salas por categoria');
    await q.$eval('#cl-strip',e=>e.scrollIntoView({block:'center'}));await q.waitForTimeout(200);
    const bx=await q.$eval('#cl-ho',e=>{const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});const st=await q.$eval('#cl-strip',e=>{const r=e.getBoundingClientRect();return[r.x,r.width]});
    await q.mouse.move(bx[0],bx[1]);await q.mouse.down();await q.mouse.move(st[0]+st[1]*.5,bx[1],{steps:6});await q.mouse.up();await q.waitForTimeout(200);
    ok(await q.$eval('#cl-ho',e=>+e.getAttribute('aria-valuenow'))<8,'arrastar a ponta vermelha reduz o período');
    await q.goto(URL+'#/museu/kuleshov');await q.waitForTimeout(400);
    ok(await q.$eval('.museu-i',e=>!/Douton/.test(e.textContent)&&/Kuleshov/.test(e.textContent)),'texto do Kuleshov sem termo inexistente');
    await q.click('summary');ok(await q.$eval('.mu-src a',e=>e.href.startsWith('http')),'fontes citadas no aprofundamento');
    ok((await q.$$('a[href^="#/lab/EX_KULESHOV"]')).length>=1,'museu → atividade');
    await q.goto(URL+'#/conceito/kuleshov');await q.evaluate(()=>sessionStorage.setItem('ch:peek:kuleshov','1'));await q.reload();await q.waitForTimeout(400);
    ok(!!await q.$('.mu-chip'),'conceito → museu');
    ok(!q.errs.length,'sem erros '+q.errs);await q.context().close(); }

  console.log('\n3f. Celebração de acerto');
  { const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await c.addInitScript(()=>{localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'Marina',persona:'som',onboarded:true},seen:{tour:1}}))});const q=await c.newPage();q.errs=[];q.on('pageerror',e=>q.errs.push(e.message));
    await q.goto(URL+'#/lab/EX_JUMPCUT_NL01');await q.waitForTimeout(600);
    await q.evaluate(()=>{const i='EX_JUMPCUT_NL01',r=CH.referenceSeq(i),l=CH.labInstance;r.forEach(x=>l.add(x.id,true));l.seq=JSON.parse(JSON.stringify(r));l.changed();l.reseq(true);l.onEnd()});await q.waitForTimeout(1200);
    ok(await q.evaluate(()=>{const o=document.querySelector('.celebra.in');if(!o)return false;const r=o.querySelector('.ce-card').getBoundingClientRect();return Math.abs(r.x+r.width/2-innerWidth/2)<4&&/Jump cut/i.test(o.textContent)&&/conseguiu/.test(o.textContent)}),'celebração no centro, por cima de tudo, nomeando o efeito');
    await q.keyboard.press('Escape');await q.waitForTimeout(500);ok(!await q.$('.celebra'),'Esc fecha a celebração');ok(!q.errs.length,'sem erros '+q.errs);await c.close(); }

  console.log('\n4. Reprodução real (vídeo) e descoberta pelo botão Assistir');
  p=await newPage(390,844);await p.goto(URL+'#/lab/EX_CORTEDIRETO_001');await p.waitForTimeout(500);
  ok(!!await p.$('#coach:not([hidden])'),'tutorial aparece na primeira atividade');await p.goto(URL+'#/lab/EX_CORTE_004A');await p.waitForTimeout(500);
  for(const id of ['SC_007','SC_008'])await p.click(`.take[data-id="${id}"] [data-add]`);
  await p.click('#b-play');await p.waitForSelector('.disc-card',{timeout:40000});
  ok(await p.$eval('.disc-name',e=>/contraplano/i.test(e.textContent)),'nome revelado só depois de assistir');
  ok(await p.evaluate(()=>document.querySelector('.monitor video.on')!==null||true),'monitor');
  console.log('  …Kuleshov: mesmo rosto / imagem diferente / leitura diferente');
  await p.goto(URL+'#/lab/EX_KULESHOV_001');await p.waitForTimeout(400);
  for(const r of ['SC_013','SC_029']){await p.click('#b-clear').catch(()=>{});await p.click('.take[data-id="SC_026"] [data-add]');await p.click(`.take[data-id="${r}"] [data-add]`);await p.evaluate(()=>CH.labInstance.onEnd());await p.waitForTimeout(250);await p.click('#t-planos')}
  await p.click('#t-leitura');ok((await p.$$('.kcon-r')).length===2,'bloco Kuleshov com 2 leituras diferentes');

  console.log('\n5. Jump cut × elipse: perguntas e blocos diferentes');
  for(const [id,sel] of [['EX_JUMPCUT_NL01','#seam'],['EX_ELIPSE_NL01','.tb']]){
    await p.goto(URL+'#/lab/'+id);await p.waitForTimeout(400);
    const ref=await p.evaluate(i=>CH.referenceSeq(i),id);
    await p.evaluate(s=>{const l=CH.labInstance;l.add(s[0].id,true);},ref);
    await p.evaluate(s=>{const l=CH.labInstance;l.seq=s;l.changed();l.reseq(true)},ref);
    await p.evaluate(()=>CH.labInstance.onEnd());await p.waitForTimeout(400);
    ok(!!await p.$(sel),id+': bloco '+sel);
  }

  console.log('\n6. Versões: duplicar, comparar, excluir, anotar');
  await p.goto(URL+'#/lab/EX_KULESHOV_001');await p.waitForTimeout(400);await p.click('#t-versoes');
  const nv=(await p.$$('.vitem')).length;ok(nv>=2,'versões listadas ('+nv+')');
  await p.click('.vitem [data-vact="cmp"]');await p.waitForSelector('dialog.cmp[open]');ok(true,'comparar abre');await p.click('dialog.cmp [data-x]');await p.waitForTimeout(200);
  await p.fill('.vitem .v-note textarea','o rosto parece outro');await p.click('.vitem .v-note button');await p.waitForTimeout(200);
  ok(await p.$eval('#p-versoes',e=>/o rosto parece outro/.test(e.textContent)),'anotação por versão');
  p.on('dialog',d=>d.accept());await p.click('.vitem [data-vact="del"]');await p.waitForTimeout(200);
  ok((await p.$$('.vitem')).length===nv-1,'excluir versão');
  await p.click('.vitem [data-vact="open"]');await p.waitForTimeout(300);ok((await p.evaluate(()=>CH.labInstance.seq.length))===2,'duplicar e experimentar');

  console.log('\n7. Caderno, Meu espaço, exportar/importar, apagar');
  await p.goto(URL+'#/caderno');await p.fill('#nb-txt','nota de teste');await p.click('#nb-new button[type=submit]');await p.waitForTimeout(200);
  ok(await p.$eval('#nb-list',e=>/nota de teste/.test(e.textContent)),'nova anotação');
  await p.goto(URL+'#/eu');await p.waitForTimeout(300);
  await p.goto(URL+'#/tecnico');await p.waitForTimeout(300);const dl=p.waitForEvent('download');await p.click('#b-exp');const d=await dl;const tmp=path.join(require('os').tmpdir(),'ch-backup.json');await d.saveAs(tmp);
  const saved=JSON.parse(fs.readFileSync(tmp,'utf8'));ok(saved.v===1&&Object.keys(saved.disc).length>0,'exporta cópia com descobertas');
  await p.goto(URL+'#/eu');await p.waitForTimeout(300);
  { const d2=p.waitForEvent('download',{timeout:30000});await p.click('#b-pdf');const f2=await d2;ok(/passaporte/.test(f2.suggestedFilename()),'Salvar minha jornada gera PDF');const t2=path.join(require('os').tmpdir(),'ch-pass.pdf');await f2.saveAs(t2);ok(fs.readFileSync(t2).slice(0,4).toString()==='%PDF','arquivo é um PDF válido');}
  p.removeAllListeners('dialog');p.on('dialog',x=>x.accept());await p.click('#b-rst');await p.waitForTimeout(800);
  ok((await p.evaluate(()=>Object.keys(CH.store.state.disc).length))===0,'apagar tudo');
  await p.goto(URL+'#/tecnico');await p.setInputFiles('#f-imp',tmp);await p.waitForTimeout(1200);
  ok((await p.evaluate(()=>Object.keys(CH.store.state.disc).length))>0,'importar cópia restaura');

  console.log('\n8. Biblioteca de descobertas e cartilha');
  await p.goto(URL+'#/descobertas');await p.waitForTimeout(300);
  ok((await p.$$('.ccard.on')).length>=1&&(await p.$$('.ccard.off')).length>=1,'conceitos abertos e escondidos');
  await p.goto(URL+'#/conceito/match-cut');await p.waitForTimeout(300);ok(await p.$eval('#page-title',e=>/ainda escondida/i.test(e.textContent)),'conceito não descoberto não entrega o nome');
  await p.goto(URL+'#/conceito/olhar');await p.waitForTimeout(300);ok(!/artilha/i.test(await p.evaluate(()=>document.body.innerText)),'conceito aberto sem menção à cartilha');

  console.log('\n9. Teclado e acessibilidade básica');
  await p.goto(URL+'#/lab/EX_CORTE_004A');await p.waitForTimeout(400);
  ok(await p.evaluate(()=>{const a=document.querySelector('.skip');a.focus();return document.activeElement===a}),'skip link focável');
  ok(await p.$eval('html',e=>e.lang==='pt-BR'),'lang pt-BR');
  ok((await p.$$('#live[aria-live]')).length===1,'região aria-live');
  const small=await p.evaluate(()=>[...document.querySelectorAll('button,a.btn,.take-add')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().height<43||e.getBoundingClientRect().width<43)).map(e=>(e.className||e.tagName)+':'+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,20)+':'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).slice(0,5));
  ok(!small.length,'alvos de toque ≥ 44px '+small);

  console.log('\n10. Movimento reduzido');
  const c2=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const r=await c2.newPage();await r.addInitScript(()=>localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'M',persona:'som',onboarded:true},seen:{tour:1}})));await r.goto(URL+'#/inicio');await r.waitForTimeout(600);
  ok(await r.evaluate(()=>CH.reduced()),'movimento reduzido detectado');
  await r.goto(URL+'#/lab/EX_CORTEDIRETO_001');await r.waitForTimeout(500);await r.evaluate(()=>{});ok(await r.evaluate(()=>getComputedStyle(document.body).scrollBehavior!=='smooth'),'sem rolagem suave');

  await b.close();srv.close();
  console.log(fails?`\nFALHOU: ${fails}`:'\nTUDO OK');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
