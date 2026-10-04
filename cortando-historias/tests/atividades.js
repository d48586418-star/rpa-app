/* Auditoria de TODAS as atividades: vídeo dos takes, combinações possíveis, respostas válidas, % de proximidade.
   uso: NODE_PATH=... node tests/atividades.js  (servidor em localhost:8766) */
const {chromium}=require('playwright');
const URL=process.env.URL||'http://localhost:8766/lab.html';
(async()=>{
  const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{});const p=await b.newPage({viewport:{width:1280,height:800}});
  await p.addInitScript(()=>{window.CH_NO_CEL=1;localStorage.setItem('ch:v1',JSON.stringify({v:1,profile:{name:'T',persona:'olhar',onboarded:true,created:1},seen:{tour:1},prefs:{motion:'off'}}))});
  await p.goto(URL+'#/inicio');await p.waitForTimeout(800);
  const rep=await p.evaluate(async()=>{
    const out=[];
    for(const id of CH.allActs()){
      const act=CH.ACT[id],pool=act.pool.slice();
      const sem=[];for(const t of pool){const tk=CH.TK[t];if(!tk||!tk.vid){sem.push(t+':sem-vid');continue}
        for(const u of [tk.vid,tk.vid.replace(/\.webm$/,".mp4")]){const r=await fetch(u,{method:'HEAD'});if(!r.ok)sem.push(t+':'+u.split('.').pop())}}
      for(const t of pool){const tk=CH.TK[t];if(!tk||!tk.vid)continue;
        const ok=await new Promise(res=>{const v=document.createElement('video');v.preload='auto';v.muted=true;const to=setTimeout(()=>res('timeout'),6000);v.onloadeddata=()=>{clearTimeout(to);res(v.videoWidth>0&&v.duration>0?'ok':'vazio')};v.onerror=()=>{clearTimeout(to);res('erro')};v.src=tk.vid});
        if(ok!=='ok')sem.push(t+':decode-'+ok)}
      const ex=CH.EXF[id],mx=3;let valid=0,total=0,tent=[];
      const mk=a=>a.map(x=>({id:x,a:0,b:1}));
      const seqs=[];
      for(const a of pool){seqs.push([a]);for(const b2 of pool){if(a===b2&&!(CH.NOVAS[id]&&CH.NOVAS[id].tipo==="direto"))continue;seqs.push([a,b2]);if(mx>=3&&pool.length<=10)for(const c of pool)if(c!==a&&c!==b2){seqs.push([a,b2,c]);if(pool.length<=8&&(ex.required_take_count||0)>=4)for(const d of pool)if(d!==a&&d!==b2&&d!==c)seqs.push([a,b2,c,d])}}}
      let tipo=CH.NOVAS[id]?CH.NOVAS[id].tipo:"motor";
      for(const s of seqs){total++;try{const {r}=CH.readSeq(id,mk(s));if(r.class==="valid"){valid++;if(tent.length<2)tent.push(s.join('>'))}}catch(e){}}
      const ref=CH.referenceSeq?CH.referenceSeq(id):null;
      out.push({id,t:act.t,tipo,pool:pool.length,semVideo:sem,total,valid,exemplo:tent,ref:!!ref});
    }
    return out;
  });
  let bad=0;
  for(const r of rep){
    const falha=r.semVideo.length||(r.valid===0&&!r.ref&&!['jcut','lcut'].includes(r.tipo));
    if(falha)bad++;
    console.log((falha?'✗':'✓')+' '+r.id.padEnd(20)+r.t.padEnd(22)+`pool ${r.pool} | combos ${r.total} | válidas ${r.valid} | ref ${r.ref?'sim':'não'}`+(r.semVideo.length?` | SEM VÍDEO: ${r.semVideo.join(',')}`:'')+(r.exemplo.length?` | ex: ${r.exemplo[0]}`:''));
  }
  await b.close();
  console.log(bad?`\nFALHOU: ${bad}`:'\nTUDO OK');process.exit(bad?1:0);
})();
