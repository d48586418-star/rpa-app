/* cada perfil: o vídeo da página chega a readyState>=3 e o tempo avança; iPhone prefere mp4 primeiro */
const {chromium}=require('playwright');
const URL=process.env.LAB||'http://localhost:8766/lab.html#/escolher';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{});let bad=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)bad++};
  const c=await b.newContext({viewport:{width:390,height:780},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);await p.waitForSelector('.pf-kick',{state:'visible'});
  for(let i=0;i<5;i++){
    await p.evaluate(k=>{const t=document.getElementById('pk2-track');t.scrollTo({left:k*t.clientWidth,behavior:'auto'})},i);
    await p.waitForTimeout(300);
    const r=await p.evaluate(async k=>{const v=document.querySelectorAll('.pf')[k].querySelector('.pf-v');const t0=Date.now();while(Date.now()-t0<6000&&(v.readyState<3||v.currentTime<.3))await new Promise(r=>setTimeout(r,100));return {id:document.querySelectorAll('.pf')[k].dataset.id,rs:v.readyState,t:v.currentTime,err:!!v.error}},i);
    ok(r.rs>=3&&r.t>=.3&&!r.err,`${r.id}: readyState ${r.rs}, currentTime ${r.t.toFixed(2)}`);
  }
  const f=await p.evaluate(()=>{const o=CH.preferMp4;CH.preferMp4=true;const m=CH.videoSources('x');CH.preferMp4=o;return m.indexOf('.mp4')<m.indexOf('.webm')});
  ok(f,'preferMp4 → mp4 primeiro');ok(!errs.length,'sem erros de script '+errs.join('|'));
  await b.close();process.exit(bad?1:0);
})();
