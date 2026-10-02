/* novas.js — atividades vindas do pacote JORNADA_EDITOR_MEDIA: dados, regras e mixagem de áudio.
   NÃO altera engine.js: estas atividades têm regras próprias (corte direto, eixo, experimento, J-cut, L-cut)
   e devolvem o mesmo formato de leitura (classe + situação + texto) que o resto do laboratório usa. */
(function(){
"use strict";
const CH=window.CH,D=CH.data;
CH.NOVAS={};CH.AUD={};
(D.novos.takes||[]).forEach(t=>{if(!CH.TK[t.id]){CH.TK[t.id]=t;D.takes.push(t)}});
(D.novos.audios||[]).forEach(a=>{CH.AUD[a.id]=a});
D.novas.atividades.forEach(n=>{
  CH.NOVAS[n.id]=n;
  const labels={};
  if(n.ordem)n.ordem.forEach((id,i)=>labels[id]="Plano "+"AB"[i]);
  else n.pool.forEach((id,i)=>labels[id]="Plano "+(i+1));
  if(n.labels)Object.assign(labels,n.labels);
  const act={id:n.id,t:n.t,m:n.m,pool:n.pool,fx:{},o:"",lab:false};
  CH.ACT[n.id]=act;if(!D.activities.some(a=>a.id===n.id))D.activities.push(act);
  CH.EXF[n.id]={exercise_id:n.id,difficulty:n.difficulty,student_mission:n.m,card_labels:labels,
    operations:{add:true,remove:!!n.ops.remove,reorder:!!n.ops.reorder,duplicate:false,trim:{enabled:!!n.ops.trim,takes:n.ops.trim?n.pool:[],mode:n.ops.trim?"end":null},split:false},
    reflection_policy:{required:false,scope:"per_exercise",prompt:"O que você percebeu?"},version_constraints:{allow_duplicates:n.tipo==="direto"||n.tipo==="experimento"},
    evaluation:{completion:{min_versions:1},pair_catalog:[]},novo:true,max:n.max};
});

/* ---------- regras ---------- */
const s1=x=>Number(x).toFixed(1).replace(".",",");
const L=(situacao,titulo,o,p,nome,experimente)=>({situacao,titulo,o_que:o,por_que:p,nome:nome||null,experimente:experimente||null});
function segStarts(seq){let x=0;return seq.map(s=>{const d=CH.dur(s),o={start:x,dur:d};x+=d;return o})}
function clipOf(aud,id){return (aud||[]).find(c=>c.link===id||c.id===id)}
const R={
  direto(n,seq){
    if(seq.length<2)return["incomplete",L("incompleta","Sua montagem ainda está começando","Ainda falta um segundo plano para existir um corte.","O corte acontece quando um plano encontra outro.")];
    const k=seq.findIndex((s,i)=>i&&s.id!==seq[i-1].id);
    if(k<0)return["unmapped",L("diferente","Os dois trechos são do mesmo plano","Você colocou trechos do mesmo plano um depois do outro.","Para ver um corte direto entre planos diferentes, escolha outro plano para o segundo lugar.")];
    return["valid",L("proposta","Um plano termina e o outro já começa","Você colocou um plano logo depois do outro. Entre eles não há fade, dissolvência ou efeito: a imagem muda de uma vez.","A própria troca de plano já é uma decisão de montagem.","corte direto","Escolha outro plano para o segundo lugar. A troca ainda funciona?")]
  },
  eixo(n,seq){
    const ids=[...new Set(seq.map(s=>s.id))];
    if(ids.length<3)return["incomplete",L("incompleta","Ainda faltam planos","Com menos de três planos fica difícil perceber onde cada pessoa está.","Escolha mais planos da conversa no carro.")];
    const lados=[...new Set(ids.map(i=>(n.lado||{})[i]).filter(Boolean))];
    if(lados.length>1)return["unmapped",L("diferente","Eles trocaram de lado","Entre um plano e outro, quem estava à esquerda passou para a direita.","Quando a câmera cruza a linha entre os dois, o espectador perde a referência de onde cada um está.","","Troque um plano por outro. Eles voltam a ficar cada um no seu lado?")];
    return["valid",L("proposta","Cada um continua no seu lado da tela","Você trocou de plano "+(seq.length-1)+" vezes e, em todos, "+(lados[0]||"ele ficou à esquerda e ela à direita")+".","A câmera ficou sempre do mesmo lado da linha entre os dois.","eixo","Monte com outros planos. Alguma vez eles trocaram de lado?")]
  },
  experimento(n,seq){
    if(seq.length<2)return["incomplete",L("incompleta","Sua montagem ainda está começando","Coloque pelo menos dois planos.","A ordem só aparece quando há mais de um plano.")];
    const idx=seq.map(s=>n.original.indexOf(s.id));let inv=0;for(let i=1;i<idx.length;i++)if(idx[i]<idx[i-1])inv++;
    if(inv===0)return["known_weak",L("falta","Esta é a ordem original","Os planos estão na ordem em que o filme os conta.","Agora mude a ordem de alguns planos e assista de novo. O que a história passa a dizer?","","Troque dois planos de lugar.")];
    return["valid",L("proposta","A história mudou","Você mudou a ordem dos planos e a história que eles contam mudou junto.","Os planos são os mesmos. O que mudou foi o que o público entende primeiro e o que entende depois.","a ordem importa","Tire um plano da sua versão. A história ainda se entende?")]
  },
  crosscut(n,seq){
    const li=seq.map(s=>(CH.TK[s.id]||{}).linha),ls=[...new Set(li)];
    if(seq.length<2)return["incomplete",L("incompleta","Sua montagem ainda está começando","Coloque pelo menos dois planos.","A alternância só aparece quando há mais de um plano.")];
    if(ls.length<2)return["unmapped",L("diferente","Você ficou numa casa só","Todos os planos que você escolheu são da mesma mulher.","Para mostrar duas ações acontecendo ao mesmo tempo, é preciso planos do outro lugar também.","","Procure os planos da outra casa e coloque entre os seus.")];
    let sw=0;for(let i=1;i<li.length;i++)if(li[i]!==li[i-1])sw++;
    if(sw>=2)return["valid",L("proposta","As duas casas acontecem juntas","Você foi e voltou entre as duas mulheres "+sw+" vezes.","Ao alternar entre dois lugares, a montagem faz parecer que as duas ações acontecem ao mesmo tempo e que uma responde à outra.","montagem paralela","Monte uma casa inteira e depois a outra, sem alternar. A sensação de ao mesmo tempo continua?")];
    return["known_weak",L("falta","Primeiro uma, depois a outra","Você mostrou uma casa e depois a outra, sem voltar à primeira.","Assim as duas ações parecem acontecer uma depois da outra. Volte à primeira casa para sentir que acontecem ao mesmo tempo.","","Coloque um plano da primeira casa depois dos da segunda.")];
  },
  cobertura(n,seq){
    const A=new Set(n.a),B=new Set(n.b),k=seq.map(s=>A.has(s.id)?"A":B.has(s.id)?"B":"X");
    if(seq.length<2||!k.includes("A"))return["incomplete",L("incompleta","Sua montagem ainda está começando","Comece pelo garoto e depois escolha o que ele vê.","O plano de apoio só faz sentido ao lado da cena principal.")];
    for(let i=1;i<k.length-1;i++)if(k[i]==="B"&&k[i-1]==="A"&&k[i+1]==="A")return["valid",L("proposta","Agora a gente sabe o que ele olha","Você saiu do garoto, mostrou o céu com a pipa e voltou para ele.","O plano do meio responde à pergunta que a imagem do garoto deixa aberta: o que ele está olhando?","B-roll","Troque a pipa por outra. O sentido muda?")];
    if(k.includes("X"))return["unmapped",L("diferente","Esse plano não explica o olhar dele","Você colocou um detalhe que não tem relação com o que o garoto olha.","Um plano de apoio precisa responder a algo da cena. O livro, o celular e a placa não dizem para onde ele olha.","","Procure um plano de céu.")];
    if(k.includes("B"))return["known_weak",L("falta","Falta voltar ao garoto","Você mostrou o que ele vê, mas não voltou para ele.","O plano de apoio costuma devolver a cena principal. Volte ao garoto depois da pipa.","","Coloque um plano do garoto depois do céu.")];
    return["incomplete",L("incompleta","Falta o plano de apoio","Só há planos do garoto.","Entre dois planos dele, coloque um que mostre o que ele olha.")];
  },
  jcut(n,seq,aud){
    const [a,b]=n.ordem;
    if(seq.length<2||seq[0].id!==a||seq[1].id!==b)return["incomplete",L("incompleta","Falta montar A e B","Coloque o plano A e, depois dele, o plano B.","O J-cut acontece na passagem de um plano para o outro.")];
    const st=segStarts(seq),c=clipOf(aud,b);
    if(!c)return["incomplete",L("incompleta","O som de B não está na timeline","Coloque o plano B de novo para trazer o som dele.","")];
    const off=st[1].start-c.start;
    if(off>=n.av.min_segundos)return["valid",L("proposta","Você ouviu antes de ver","O som de B começou "+s1(off)+" s antes de a imagem de B aparecer, ainda sobre o plano A.","A imagem mudou depois do som: o espectador escuta para onde a cena vai antes de ver.","J-cut","Antecipe o som um pouco mais, e depois um pouco menos. Qual deixa a passagem mais suave?")];
    if(off>0)return["known_weak",L("falta","O som saiu na frente, mas por muito pouco","O som de B antecipou "+s1(off)+" s.","Com tão pouco tempo, quase ninguém percebe. Antecipe mais um pouco.")];
    return["unmapped",L("diferente","Som e imagem mudam juntos","O som de B começa no mesmo instante da imagem de B"+(c.linked?", porque ainda está ligado a ela":"")+".","Isso funciona: é um corte simples. Para fazer um J-cut, o som precisa sair na frente.","","Separe o som de B e arraste ele para antes do corte.")];
  },
  lcut(n,seq,aud){
    const [a,b]=n.ordem;
    if(seq.length<2||seq[0].id!==a||seq[1].id!==b)return["incomplete",L("incompleta","Falta montar A e B","Coloque o plano A e, depois dele, o plano B.","O L-cut acontece na passagem de um plano para o outro.")];
    const st=segStarts(seq),c=clipOf(aud,a);
    if(!c)return["incomplete",L("incompleta","O som de A não está na timeline","Coloque o plano A de novo para trazer o som dele.","")];
    const ad=CH.AUD[c.id].d,end=c.start+(c.b-c.a)*ad,ov=end-st[1].start;
    if(ov>=n.av.min_segundos)return["valid",L("proposta","A imagem mudou, o som ficou","O som de A continuou "+s1(ov)+" s por cima da imagem de B.","O som costura os dois planos e faz o corte parecer mais suave.","L-cut","Estenda o som por mais tempo. Até onde ele ainda faz sentido sobre a nova imagem?")];
    if(ov>0)return["known_weak",L("falta","O som passou um pouquinho","O som de A invadiu "+s1(ov)+" s a imagem de B.","É pouco para perceber. Estenda mais.")];
    return["unmapped",L("diferente","Som e imagem terminam juntos","O som de A para no mesmo instante em que a imagem de A termina.","Isso funciona: é um corte simples. Para fazer um L-cut, o som de A precisa continuar depois do corte.","","Separe o som de A e estenda ele para a direita.")];
  }
};
CH.novas={
  read(exId,seq,aud){
    const n=CH.NOVAS[exId],[cls,Lr]=R[n.tipo](n,seq,aud);
    return{clips:CH.clipsOf(seq),r:{class:cls,matched_targets:cls==="valid"?["T_"+n.tipo]:[]},L:Lr};
  },
  /* tempos reais para o diagrama J/L-cut */
  timing(exId,seq,aud){
    const n=CH.NOVAS[exId];if(!n||!n.av)return null;
    const st=segStarts(seq);return{vid:seq.map((s,i)=>({id:s.id,start:st[i].start,dur:st[i].dur})),aud:(aud||[]).map(c=>({id:c.id,link:c.link,start:c.start,dur:(c.b-c.a)*CH.AUD[c.id].d}))};
  }
};

/* ---------- progresso das novas atividades ---------- */
const baseProgress=CH.progress;
CH.progress=function(exId){
  const n=CH.NOVAS[exId];if(!n)return baseProgress(exId);
  const a=CH.store.state.act[exId];
  const out={exId,status:"nova",n:0,nivel:0,disc:CH.store.discoveredIn(exId),complete:false,reasons:[],refl:{required:false,ok:true,scope:"per_exercise"},done:false};
  if(!a)return out;
  out.n=a.versions.length;
  const valid=a.versions.filter(v=>v.cls==="valid").length;
  if(a.versions.length||a.watchedOnce)out.nivel=1;
  if(out.disc.length||a.versions.some(v=>v.nome))out.nivel=2;
  if(!(a.versions.length||a.draft||a.started))return out;
  out.status="andamento";
  out.counted=a.versions.map((v,i)=>i);
  if(valid>=2){out.complete=out.done=true;out.status="concluida";out.nivel=3}else out.reasons.push("min_valid");
  return out;
};
CH.nextActivity=function(){
  for(const ato of D.atos.atos)for(const id of CH.atividadesDoAto(ato)){if(CH.progress(id).status!=="concluida")return id}
  return null};

/* ---------- mixagem: o som é uma faixa separada da imagem ---------- */
class AudioMix{
  constructor(){this.el={}}
  get(id){
    if(this.el[id])return this.el[id];
    const a=CH.AUD[id],el=new Audio();el.preload="auto";
    el.src=el.canPlayType('audio/ogg; codecs="opus"')?a.ogg:a.m4a;this.el[id]=el;return el;
  }
  sync(clips,t,playing){
    clips.forEach(c=>{
      const a=CH.AUD[c.id],el=this.get(c.id),len=(c.b-c.a)*a.d,off=t-c.start;
      if(playing&&off>=0&&off<len-.03){
        const want=c.a*a.d+off;
        if(el.paused){try{el.currentTime=want}catch(e){}el.play().catch(()=>{})}
        else if(Math.abs(el.currentTime-want)>.3){try{el.currentTime=want}catch(e){}}
      }else if(!el.paused)el.pause();
    });
  }
  stop(){Object.values(this.el).forEach(e=>{try{e.pause()}catch(x){}})}
  destroy(){this.stop();Object.values(this.el).forEach(e=>{e.removeAttribute("src");e.load()});this.el={}}
}
CH.AudioMix=AudioMix;
})();
