// Gera a tabela de links estáveis atividade → URL (destino dos QR Codes da cartilha).
// Uso: BASE_URL=https://seu-dominio/cortando-historias/ node scripts/qr-links.js > data/qr-links.csv
const fs=require('fs'),path=require('path');
const D=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','data',f),'utf8'));
const base=(process.env.BASE_URL||'https://EXEMPLO/').replace(/\/?$/,'/');
const acts=D('activities.json'),cart=D('cartilha.json').atividades;
console.log('id,titulo,url,cartilha_pagina');
acts.forEach(a=>console.log([a.id,'"'+a.t+'"',base+'lab.html#/'+(a.id==='EX_LAB_LIVRE'?'livre':'lab/'+a.id),(cart[a.id]||{}).pagina||''].join(',')));
