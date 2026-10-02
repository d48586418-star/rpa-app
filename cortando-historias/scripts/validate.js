// Valida dados + assets com o PRÓPRIO motor do v7. Rodar: node scripts/validate.js
const fs=require('fs'),path=require('path');
const R=p=>path.join(__dirname,'..',p),J=f=>JSON.parse(fs.readFileSync(R('data/'+f),'utf8'));
const Engine=require(R('js/engine.js')),Leituras=require(R('js/leituras.js'));
const takes=J('takes.json'),EXF=J('exercises_engine.json'),LR=J('leituras.json'),ACT=J('activities.json');
const TK={};takes.forEach(t=>TK[t.id]=t);
let bad=0;const fail=m=>{bad++;console.log('✗',m)};
for(const [k,e] of Object.entries(EXF)){const errs=Engine.validateExercise(e,TK);errs.forEach(x=>fail(k+': '+x))}
try{Leituras.validate(LR,EXF,TK)}catch(e){fail('leituras: '+e.message)}
let semVideo=[];
takes.forEach(t=>{
  if(!fs.existsSync(R(t.th)))fail('thumbnail ausente '+t.id);
  if(!t.vid)semVideo.push(t.id);else if(!fs.existsSync(R(t.vid)))fail('vídeo ausente '+t.id);
});
ACT.forEach(a=>a.pool.forEach(i=>{if(!TK[i])fail(a.id+': take fora de takes.json '+i)}));
/* v8: mp4, didática, conceitos, cartilha, emojis */
takes.forEach(t=>{if(t.vid&&!fs.existsSync(R(t.vid.replace(/\.webm$/,'.mp4'))))fail('fallback mp4 ausente '+t.id)});
const NV=J('novas.json'),NT=J('novos-takes.json'),NID=NV.atividades.map(a=>a.id);
NT.takes.forEach(t=>{['th','vid'].forEach(k=>{if(!fs.existsSync(R(t[k])))fail('asset novo ausente '+t[k])});if(!fs.existsSync(R(t.vid.replace(/\.webm$/,'.mp4'))))fail('mp4 novo ausente '+t.id)});
NT.audios.forEach(a=>['ogg','m4a'].forEach(k=>{if(!fs.existsSync(R(a[k])))fail('áudio ausente '+a[k])}));
NV.atividades.forEach(a=>a.pool.forEach(i=>{if(!NT.takes.some(t=>t.id===i))fail(a.id+': take fora do pacote '+i)}));
const DD=J('didatica.json').atividades,CO=J('conceitos.json'),CA=J('cartilha.json');
ACT.concat(NV.atividades).forEach(a=>{const d=DD[a.id];if(!d)return fail('didática ausente '+a.id);['faca','observe','apos','continue'].forEach(k=>{if(!d[k])fail(a.id+': didática sem '+k)});if(a.id!=='EX_LAB_LIVRE'&&(!d.mudou||!d.descoberta))fail(a.id+': didática sem mudou/descoberta')});
const aliases=CO.conceitos.flatMap(c=>c.aliases.map(x=>x.toLowerCase()));
Object.values(LR.atividades).flat().forEach(l=>{if(l.nome&&!aliases.includes(l.nome.toLowerCase()))fail('nome sem conceito: '+l.nome)});
CO.conceitos.forEach(c=>c.exp.forEach(i=>{if(!EXF[i]&&!NID.includes(i))fail('conceito '+c.id+' aponta para atividade inexistente '+i)}));
['js/lab-av.js','js/novas.js'].forEach(f=>{});
const semPg=Object.entries(CA.atividades).filter(([,v])=>!v.pagina).length+Object.entries(CA.conceitos).filter(([,v])=>!v.pagina).length;
if(semPg)console.log('ⓘ cartilha: '+semPg+' referências ainda sem número de página (data/cartilha.json) — a interface mostra só Ato/seção');
const emoji=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
['js/lab.js','js/lab-panels.js','js/views-home.js','js/views-path.js','js/views-learn.js','js/views-me.js','js/views-lab.js','js/novas.js','js/lab-av.js','js/core.js','lab.html','index.html'].forEach(f=>{fs.readFileSync(R(f),'utf8').split('\n').forEach((l,i)=>{if(emoji.test(l))fail(f+':'+(i+1)+' emoji/glifo de interface')})});
console.log(`${Object.keys(EXF).length} exercícios · ${takes.length} takes · ${takes.length-semVideo.length} com vídeo real`);
if(semVideo.length)console.log('ⓘ sem arquivo de vídeo (só imagem):',semVideo.join(', '));
console.log(bad?`${bad} problema(s)`:'OK — dados e assets consistentes');process.exit(bad?1:0);
