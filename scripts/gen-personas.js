/* Gera supabase/seed/personas.sql e docs/personas-teste.md a partir de src/constants/personas.json.
 * Uso: node scripts/gen-personas.js   (o teste personas.test.ts confere que os arquivos estão em dia) */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const data = require('../src/constants/personas.json');
const P = data.personas;
const byKey = Object.fromEntries(P.map((p) => [p.key, p]));

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`;
const n = (v) => (v == null ? 'null' : String(v));

/** Para cada persona: com quem o like dela vira match (quem já a curtiu antes). */
function expectedMatches() {
  const out = {};
  for (const me of P) {
    const mates = [];
    for (const other of P) {
      if (other.account_type === me.account_type || me.pre_likes.includes(other.key)) continue;
      if (other.pre_likes.includes(me.key)) mates.push(other.key);
    }
    out[me.key] = mates;
  }
  return out;
}

function genSql() {
  const ids = P.map((p) => q(p.id)).join(', ');
  const L = [];
  L.push('-- Seed de teste do Take One: 10 personas (5 freelancers e 5 empresas).');
  L.push('-- GERADO por scripts/gen-personas.js a partir de src/constants/personas.json. Não edite à mão.');
  L.push('--');
  L.push('-- ATENÇÃO: use SOMENTE em um projeto Supabase de teste. Todas as contas compartilham a mesma senha');
  L.push(`-- (${data.password}). Rode depois de 0001_init.sql e 0002_account_type.sql.`);
  L.push('-- Não foi validado contra um Supabase real nesta versão; se o login falhar, veja docs/personas-teste.md.');
  L.push('');
  L.push('begin;');
  L.push('');
  L.push('-- 1) Usuários de autenticação');
  L.push('insert into auth.users (');
  L.push('  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,');
  L.push('  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,');
  L.push('  confirmation_token, recovery_token, email_change_token_new, email_change');
  L.push(') values');
  L.push(
    P.map(
      (p) =>
        `  ('00000000-0000-0000-0000-000000000000', ${q(p.id)}, 'authenticated', 'authenticated', ${q(p.email)}, ` +
        `extensions.crypt(${q(data.password)}, extensions.gen_salt('bf')), now(), ` +
        `'{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')`,
    ).join(',\n'),
  );
  L.push('on conflict (id) do nothing;');
  L.push('');
  L.push('insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values');
  L.push(
    P.map(
      (p) =>
        `  (gen_random_uuid(), ${q(p.id)}, ${q(p.id)}, ` +
        `'{"sub":"${p.id}","email":"${p.email}","email_verified":true}'::jsonb, 'email', now(), now(), now())`,
    ).join(',\n'),
  );
  L.push('on conflict (provider_id, provider) do nothing;');
  L.push('');
  L.push('-- 2) Perfis');
  L.push('insert into public.profiles (id, account_type, name, city, bio, roles, day_rate_min, day_rate_max, available, website, gear, portfolio_links) values');
  L.push(
    P.map(
      (p) =>
        `  (${q(p.id)}, ${q(p.account_type)}, ${q(p.name)}, ${q(p.city)}, ${q(p.bio)}, ${arr(p.roles)}, ` +
        `${n(p.day_rate_min)}, ${n(p.day_rate_max)}, ${p.available}, ${q(p.website)}, ${q(p.gear)}, ${arr(p.portfolio_links)})`,
    ).join(',\n'),
  );
  L.push('on conflict (id) do nothing;');
  L.push('');
  L.push('-- 3) Likes que já existem (um lado só). O match nasce quando a outra pessoa curte de volta.');
  const likes = P.flatMap((p) => p.pre_likes.map((k) => ({ from: p, to: byKey[k] })));
  L.push('insert into public.swipes (swiper_id, target_id, direction) values');
  L.push(likes.map((l) => `  (${q(l.from.id)}, ${q(l.to.id)}, 'like') -- ${l.from.name} -> ${l.to.name}`).join(',\n').replace(/\) -- ([^\n]*),\n/g, '), -- $1\n'));
  L.push('on conflict (swiper_id, target_id) do nothing;');
  L.push('');
  L.push('commit;');
  L.push('');
  L.push('-- Limpeza (descomente para remover as personas e tudo que depende delas):');
  L.push(`-- delete from auth.users where id in (${ids});`);
  L.push('');
  return L.join('\n');
}

function genDoc() {
  const em = expectedMatches();
  const name = (k) => byKey[k].name;
  const D = [];
  D.push('# Personas de teste do match');
  D.push('');
  D.push('> Gerado por `scripts/gen-personas.js` a partir de `src/constants/personas.json`. Não edite à mão.');
  D.push('');
  D.push(`Dez contas prontas, cinco freelancers e cinco empresas. **Senha de todas: \`${data.password}\`** (apenas para testes, nunca em produção).`);
  D.push('');
  D.push('## Como usar');
  D.push('');
  D.push('- **Na demo:** na tela de login, toque em uma persona em "Entrar como persona". Para trocar de pessoa, vá em Perfil, toque em Sair e entre com outra. Os likes e matches continuam enquanto a página estiver aberta.');
  D.push('- **No seu Supabase de teste:** rode `supabase/seed/personas.sql` no SQL Editor, depois das duas migrations. Entre no app com o e-mail e a senha da tabela.');
  D.push('');
  D.push('## As 10 personas');
  D.push('');
  D.push('| Persona | Tipo | Cargo | Cidade | Funções | Cachê/dia | Situação | Login |');
  D.push('|---|---|---|---|---|---|---|---|');
  for (const p of P) {
    const rate =
      p.day_rate_min != null ? `R$ ${p.day_rate_min.toLocaleString('pt-BR')} a ${p.day_rate_max.toLocaleString('pt-BR')}` : '—';
    const status = p.account_type === 'empresa' ? (p.available ? 'Contratando' : 'Sem vagas') : p.available ? 'Disponível' : 'Ocupada';
    D.push(`| **${p.name}** | ${p.account_type} | ${p.cargo} | ${p.city} | ${p.roles.join(', ')} | ${rate} | ${status} | \`${p.email}\` |`);
  }
  D.push('');
  D.push('## Personalidade (define as respostas automáticas do chat na demo)');
  D.push('');
  for (const p of P) D.push(`- **${p.name}:** ${p.personality}`);
  D.push('');
  D.push('## Likes que já existem');
  D.push('');
  D.push('Só um lado curtiu. O match acontece quando você entra como o outro lado e curte de volta.');
  D.push('');
  for (const p of P) for (const k of p.pre_likes) D.push(`- ${p.name} curtiu ${name(k)}`);
  D.push('');
  D.push('## Cenários de teste');
  D.push('');
  D.push('Entre como a persona, abra Explorar, toque em Pessoas e curta quem está no deck (o botão do coração). Quem já recebeu seu like antes não aparece de novo no deck.');
  D.push('');
  D.push('| Entre como | Curta | Resultado esperado |');
  D.push('|---|---|---|');
  for (const p of P) {
    const mates = em[p.key];
    const candidates = P.filter((o) => o.account_type !== p.account_type && !p.pre_likes.includes(o.key));
    const none = candidates.filter((o) => !mates.includes(o.key));
    if (mates.length) D.push(`| ${p.name} | ${mates.map(name).join(' e ')} | **É um match!** e chat liberado |`);
    if (none.length) D.push(`| ${p.name} | ${none.map((o) => o.name).join(', ')} | Nenhum match (essas pessoas nunca curtiram ${p.name}) |`);
  }
  D.push('');
  D.push('### Casos que cada coisa cobre');
  D.push('');
  D.push('- **Match de verdade (dos dois lados):** Caio curte Lume Filmes e depois entre como Lume Filmes: Caio já não aparece, porque o match foi criado.');
  D.push('- **Vários matches para a mesma pessoa:** Caio fecha com Lume Filmes e Casa Vermelha. A Casa Vermelha também fecha com Theo.');
  D.push('- **Nenhum match:** Marina, Joana e Theo só ganham match quando a empresa que eles já curtiram os curte de volta.');
  D.push('- **Filtro de disponibilidade:** Joana (ocupada) e Estúdio Neon (sem vagas) somem com "Só disponíveis" ou "Só contratando".');
  D.push('- **Filtro por função:** use os chips de função no topo do deck.');
  D.push('- **Chat:** na demo, o outro lado responde com a personalidade da persona.');
  D.push('');
  D.push('## Jobs de exemplo (Explorar → Vagas, só na demo)');
  D.push('');
  D.push('| Job | Publicado por | Função | Gênero | Local | Diárias | Orçamento/diária | Equipamento pedido |');
  D.push('|---|---|---|---|---|---|---|---|');
  for (const p of P) for (const j of p.jobs || []) {
    D.push(`| ${j.title} | ${p.name} | ${j.role} | ${j.genre} | ${j.city || 'remoto'} | ${j.days} | R$ ${j.budget_per_day.toLocaleString('pt-BR')} | ${j.gear.length ? j.gear.join(', ') : '—'} |`);
  }
  D.push('');
  D.push('## Dados de match dos freelancers (créditos, agenda, reputação)');
  D.push('');
  D.push('| Persona | Cidade | Raio | Créditos verificados | Nota (avaliações) | Selos de formação | Dias ocupados (a partir de hoje) | Conta criada há |');
  D.push('|---|---|---|---|---|---|---|---|');
  for (const p of P.filter((x) => x.account_type === 'freelancer')) {
    const ver = p.credits.filter((c) => c.verified).length;
    const rep = p.reputation.rating_count ? `${String(p.reputation.rating_avg).replace('.', ',')} (${p.reputation.rating_count})` : 'sem avaliações';
    D.push(`| ${p.name} | ${p.city} | ${p.radius_km} km | ${ver} de ${p.credits.length} | ${rep} | ${p.training_badges.join(', ') || '—'} | ${p.blocked_offsets.length ? p.blocked_offsets.map((o) => `+${o}`).join(', ') : '—'} | ${p.created_days_ago} dias |`);
  }
  D.push('');
  D.push('### Cenários para o match %');
  D.push('');
  D.push('- **Data bloqueada:** Marina tem o dia +3 ocupado, e o job de casamento em Itacaré cai nele. Disponibilidade zera.');
  D.push('- **Fora do raio:** Bia (raio de 60 km) vê o job em Valença com distância zerada.');
  D.push('- **Equipamento:** o job de casamento pede câmera 4K e estabilizador; Marina tem os dois.');
  D.push('- **Conta nova:** Theo foi criado há 20 dias, não tem avaliações (nota neutra) e ganha bônus de visibilidade na lista do contratante.');
  D.push('- **Formação:** só Caio tem o selo Formado em Montagem, que conta no job de edição.');
  D.push('- **Chance de ser chamado:** Alta, Média ou Baixa conforme o match e a posição entre os candidatos.');
  D.push('- **Agenda cheia:** Joana tem do dia +10 ao +14 ocupado, o que afeta o job de som do festival.');
  D.push('');
  D.push('Os números exatos saem do código (`src/lib/matchScore.ts`) e estão cobertos por testes; este guia não repete os percentuais para não ficar desatualizado.');
  D.push('');
  D.push('## Se o login do seed falhar no Supabase');
  D.push('');
  D.push('O SQL insere direto em `auth.users` e `auth.identities`, o que pode variar com a versão do Supabase. Se o login der erro, crie os 10 usuários em *Authentication → Users → Add user* (com a senha acima e e-mail confirmado) e rode só as partes 2 e 3 do SQL (perfis e likes), trocando os ids pelos ids reais dos usuários.');
  D.push('');
  return D.join('\n');
}

module.exports = { genSql, genDoc, expectedMatches };

if (require.main === module) {
  fs.writeFileSync(path.join(root, 'supabase/seed/personas.sql'), genSql());
  fs.writeFileSync(path.join(root, 'docs/personas-teste.md'), genDoc());
  console.log('Gerados: supabase/seed/personas.sql, docs/personas-teste.md');
}
