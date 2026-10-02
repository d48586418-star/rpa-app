/* Baixa imagens de domínio público/CC do Wikimedia Commons para o Museu (rode no SEU computador, com internet).
   Uso: node scripts/baixar-imagens-museu.js
   Para cada parada, procura no Commons, pega a primeira imagem com licença livre, salva em assets/museu/<id>.jpg,
   grava a atribuição em assets/museu/creditos.json e acrescenta o id em "imgs" no data/museu.json.
   CONFIRA cada imagem antes de publicar: a busca é automática e pode errar de pessoa ou de época. */
const fs=require('fs'),path=require('path');
const BUSCAS={tesouras:'Moviola film editing',melies:'Georges Méliès portrait',porter:'Edwin S. Porter',griffith:'D. W. Griffith portrait',kuleshov:'Lev Kuleshov',eisenstein:'Sergei Eisenstein portrait',pudovkin:'Vsevolod Pudovkin',vertov:'Dziga Vertov',godard:'Jean-Luc Godard',lean:'David Lean director',murch:'Walter Murch'};
const API='https://commons.wikimedia.org/w/api.php';
const root=path.join(__dirname,'..'),out=path.join(root,'assets/museu');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const dj=path.join(root,'data/museu.json'),d=JSON.parse(fs.readFileSync(dj,'utf8')),cred={};d.imgs=d.imgs||[];
  for(const [id,q] of Object.entries(BUSCAS)){
    try{
      const u=`${API}?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent(q+' filetype:bitmap')}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900`;
      const r=await (await fetch(u,{headers:{'user-agent':'CortandoHistorias/1.0'}})).json();
      const pg=Object.values((r.query||{}).pages||{}).sort((a,b)=>a.index-b.index).find(p=>{const m=(p.imageinfo||[])[0]?.extmetadata||{};return /public domain|cc0|cc by|cc-by/i.test((m.LicenseShortName||{}).value||'')});
      if(!pg){console.log('sem resultado livre:',id);continue}
      const ii=pg.imageinfo[0],m=ii.extmetadata,b=Buffer.from(await (await fetch(ii.thumburl||ii.url,{headers:{'user-agent':'CortandoHistorias/1.0'}})).arrayBuffer());
      fs.writeFileSync(path.join(out,id+'.jpg'),b);
      cred[id]={arquivo:pg.title,autor:(m.Artist||{}).value||'',licenca:(m.LicenseShortName||{}).value||'',url:ii.descriptionurl};
      if(!d.imgs.includes(id))d.imgs.push(id);console.log('ok',id,pg.title);
    }catch(e){console.log('falhou',id,e.message)}
  }
  fs.writeFileSync(path.join(out,'creditos.json'),JSON.stringify(cred,null,1));fs.writeFileSync(dj,JSON.stringify(d,null,1));
  console.log('Depois rode: node scripts/build-data.js');
})();
