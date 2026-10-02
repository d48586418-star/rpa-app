-- Seed de teste do Take One: 10 personas (5 freelancers e 5 empresas).
-- GERADO por scripts/gen-personas.js a partir de src/constants/personas.json. Não edite à mão.
--
-- ATENÇÃO: use SOMENTE em um projeto Supabase de teste. Todas as contas compartilham a mesma senha
-- (Teste@123). Rode depois de 0001_init.sql e 0002_account_type.sql.
-- Não foi validado contra um Supabase real nesta versão; se o login falhar, veja docs/personas-teste.md.

begin;

-- 1) Usuários de autenticação
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'marina.duarte@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'caio.ribeiro@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'joana.alencar@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'theo.nakamura@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'bia.camargo@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'lume.filmes@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'casa.vermelha@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'estudio.neon@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'pulso.audiovisual@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'fio.condutor@takeone.test', extensions.crypt('Teste@123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '{"sub":"a0000000-0000-4000-8000-000000000001","email":"marina.duarte@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '{"sub":"a0000000-0000-4000-8000-000000000002","email":"caio.ribeiro@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '{"sub":"a0000000-0000-4000-8000-000000000003","email":"joana.alencar@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '{"sub":"a0000000-0000-4000-8000-000000000004","email":"theo.nakamura@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', '{"sub":"a0000000-0000-4000-8000-000000000005","email":"bia.camargo@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006', '{"sub":"a0000000-0000-4000-8000-000000000006","email":"lume.filmes@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000007', '{"sub":"a0000000-0000-4000-8000-000000000007","email":"casa.vermelha@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008', '{"sub":"a0000000-0000-4000-8000-000000000008","email":"estudio.neon@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000009', '{"sub":"a0000000-0000-4000-8000-000000000009","email":"pulso.audiovisual@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000010', '{"sub":"a0000000-0000-4000-8000-000000000010","email":"fio.condutor@takeone.test","email_verified":true}'::jsonb, 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- 2) Perfis
insert into public.profiles (id, account_type, name, city, bio, roles, day_rate_min, day_rate_max, available, website, gear, portfolio_links) values
  ('a0000000-0000-4000-8000-000000000001', 'freelancer', 'Marina Duarte', 'São Paulo', 'DP com 8 anos em publicidade e ficção. Disponível para diárias e projetos longos.', array['Diretor(a) de Fotografia']::text[], 1800, 2800, true, null, 'FX6, lentes Sigma Cine, Aputure 600d', array['vimeo.com/marinaduarte']::text[]),
  ('a0000000-0000-4000-8000-000000000002', 'freelancer', 'Caio Ribeiro', 'Rio de Janeiro', 'Edição e color grading para documentário e clipes. DaVinci Resolve e Premiere.', array['Editor(a)', 'Colorista']::text[], 900, 1500, true, null, 'Estação com DaVinci Studio, monitor calibrado', array['vimeo.com/caioribeiro']::text[]),
  ('a0000000-0000-4000-8000-000000000003', 'freelancer', 'Joana Alencar', 'Recife', 'Som direto para cinema e TV, com equipe própria de boom e mixer. Agenda cheia até o mês que vem.', array['Técnico(a) de Som Direto']::text[], 1200, 1900, false, null, 'Sound Devices 833, Sennheiser MKH 416, 2 lapelas sem fio', array[]::text[]),
  ('a0000000-0000-4000-8000-000000000004', 'freelancer', 'Theo Nakamura', 'São Paulo', 'Motion para redes e TV, After Effects e Cinema 4D. Entrego rápido e aceito prazos apertados.', array['Motion Designer', 'VFX / Animador(a)']::text[], 700, 1300, true, null, 'Workstation RTX 4090, Wacom, licenças Adobe e Maxon', array['behance.net/theonakamura']::text[]),
  ('a0000000-0000-4000-8000-000000000005', 'freelancer', 'Bia Camargo', 'Porto Alegre', 'Direção de arte para curtas e publicidade, com acervo próprio de objetos de cena.', array['Direção de Arte', 'Figurinista']::text[], 800, 1400, true, null, 'Acervo de objetos de cena e figurinos de época', array['instagram.com/biacamargo.arte']::text[]),
  ('a0000000-0000-4000-8000-000000000006', 'empresa', 'Lume Filmes', 'São Paulo', 'Produtora de publicidade e videoclipes. Procuramos equipe para campanhas de moda neste trimestre.', array['Diretor(a) de Fotografia', 'Operador(a) de Câmera']::text[], null, null, true, '@lumefilmes', null, array[]::text[]),
  ('a0000000-0000-4000-8000-000000000007', 'empresa', 'Casa Vermelha Produções', 'Rio de Janeiro', 'Documentários e séries para streaming. Pós-produção remota ou presencial, projetos de longo prazo.', array['Editor(a)', 'Colorista', 'Motion Designer']::text[], null, null, true, 'casavermelha.example', null, array[]::text[]),
  ('a0000000-0000-4000-8000-000000000008', 'empresa', 'Estúdio Neon', 'Belo Horizonte', 'Vinhetas, lyric videos e animação 2D e 3D para marcas. Equipe fechada no momento.', array['Motion Designer', 'VFX / Animador(a)']::text[], null, null, false, 'estudioneon.example', null, array[]::text[]),
  ('a0000000-0000-4000-8000-000000000009', 'empresa', 'Pulso Audiovisual', 'Curitiba', 'Cobertura de shows e festivais. Equipe de som sempre bem-vinda, trabalhos com datas fixas.', array['Técnico(a) de Som Direto', 'Desenhista de Som']::text[], null, null, true, '@pulsoav', null, array[]::text[]),
  ('a0000000-0000-4000-8000-000000000010', 'empresa', 'Fio Condutor Cinema', 'Porto Alegre', 'Produtora de cinema autoral. Procuramos direção de arte e figurino para um longa de época.', array['Direção de Arte', 'Figurinista']::text[], null, null, true, 'fiocondutor.example', null, array[]::text[])
on conflict (id) do nothing;

-- 3) Likes que já existem (um lado só). O match nasce quando a outra pessoa curte de volta.
insert into public.swipes (swiper_id, target_id, direction) values
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'like'), -- Marina Duarte -> Lume Filmes
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000009', 'like'), -- Joana Alencar -> Pulso Audiovisual
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000007', 'like'), -- Theo Nakamura -> Casa Vermelha Produções
  ('a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'like'), -- Lume Filmes -> Caio Ribeiro
  ('a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'like'), -- Casa Vermelha Produções -> Caio Ribeiro
  ('a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000005', 'like'), -- Estúdio Neon -> Bia Camargo
  ('a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000005', 'like') -- Fio Condutor Cinema -> Bia Camargo
on conflict (swiper_id, target_id) do nothing;

commit;

-- Limpeza (descomente para remover as personas e tudo que depende delas):
-- delete from auth.users where id in ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000010');
