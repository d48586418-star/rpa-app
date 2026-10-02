-- Claquete: schema inicial

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  avatar_url text,
  city text,
  bio text check (char_length(bio) <= 500),
  roles text[] not null default '{}',
  day_rate_min integer check (day_rate_min >= 0),
  day_rate_max integer check (day_rate_max >= day_rate_min),
  available boolean not null default true,
  portfolio_links text[] not null default '{}',
  gear text check (char_length(gear) <= 500),
  created_at timestamptz not null default now()
);

create table public.swipes (
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id),
  check (swiper_id <> target_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
create index matches_user_b_idx on public.matches (user_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_match_idx on public.messages (match_id, created_at);

-- Cria o match quando existe like mútuo (idempotente).
create or replace function public.create_match_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.direction = 'like' and exists (
    select 1 from public.swipes
    where swiper_id = new.target_id
      and target_id = new.swiper_id
      and direction = 'like'
  ) then
    insert into public.matches (user_a, user_b)
    values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
    on conflict (user_a, user_b) do nothing;
  end if;
  return new;
end;
$$;

create trigger swipes_create_match
after insert on public.swipes
for each row execute function public.create_match_on_like();

-- Helper para RLS: o usuário participa do match?
create or replace function public.is_match_member(m_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.matches
    where id = m_id and auth.uid() in (user_a, user_b)
  );
$$;

alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

create policy "profiles: leitura por autenticados" on public.profiles
  for select to authenticated using (true);
create policy "profiles: inserir o próprio" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles: editar o próprio" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "swipes: ver os próprios" on public.swipes
  for select to authenticated using (swiper_id = auth.uid());
create policy "swipes: criar os próprios" on public.swipes
  for insert to authenticated with check (swiper_id = auth.uid());

create policy "matches: ver os próprios" on public.matches
  for select to authenticated using (auth.uid() in (user_a, user_b));

create policy "messages: ler se participa" on public.messages
  for select to authenticated using (public.is_match_member(match_id));
create policy "messages: enviar se participa" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_match_member(match_id));

-- Realtime do chat
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;

-- Storage: fotos de perfil (pasta = id do usuário)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: leitura pública" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars: upload na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: atualizar na própria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
