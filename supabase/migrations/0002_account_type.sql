-- Tipo de conta: freelancer (pessoa) ou empresa (produtora/contratante)
alter table public.profiles
  add column account_type text not null default 'freelancer'
  check (account_type in ('freelancer', 'empresa'));

alter table public.profiles
  add column website text check (char_length(website) <= 200);
