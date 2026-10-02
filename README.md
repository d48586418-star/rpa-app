# 🎬 Claquete

Tinder para profissionais do audiovisual: deslize perfis de diretores, fotógrafos, editores, som e mais; quando o interesse é mútuo, vira **match** e abre um chat para combinar o trabalho.

**Stack:** Expo (React Native) + TypeScript + Expo Router · Supabase (Auth, Postgres + RLS, Storage, Realtime).

## Como rodar

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute `supabase/migrations/0001_init.sql`.
3. (Para testar rápido) em *Authentication → Providers → Email*, desative "Confirm email".
4. `cp .env.example .env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Settings → API).
5. `npm install && npx expo start` e abra no celular com o app **Expo Go**.

Para testar o match, crie duas contas (dois aparelhos/emuladores) e dê "chamar" nas duas.

## Scripts

- `npm test` — testes das regras de match/filtros
- `npm run typecheck` — TypeScript
- `npm run lint` — ESLint do Expo

## Como funciona

- `supabase/migrations/0001_init.sql`: tabelas `profiles`, `swipes`, `matches`, `messages`; um *trigger* cria o match quando há dois likes opostos; RLS garante que cada pessoa só edita o próprio perfil e só lê mensagens dos seus matches.
- `src/app/`: telas (login, onboarding, descobrir, matches, perfil, chat).
- `src/components/SwipeDeck.tsx`: deck com gesto de arrastar (Reanimated + Gesture Handler) e botões.
- `src/lib/matching.ts`: regras puras (filtros, par de match), cobertas por testes.

## Fora do MVP (próximos passos)

Vagas/projetos publicados, notificações push, verificação de perfil, denúncia/bloqueio, filtro por distância e paginação do deck.
