# Take One

Tinder para profissionais do audiovisual: deslize perfis de diretores, fotógrafos, editores, som e mais; quando o interesse é mútuo, vira **match** e abre um chat para combinar o trabalho.

**Stack:** Expo (React Native) + TypeScript + Expo Router · Supabase (Auth, Postgres + RLS, Storage, Realtime).

## Como rodar

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute em ordem `supabase/migrations/0001_init.sql` e `0002_account_type.sql`.
3. (Para testar rápido) em *Authentication → Providers → Email*, desative "Confirm email".
4. `cp .env.example .env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Settings → API).
5. `npm install && npx expo start` e abra no celular com o app **Expo Go**.

Para testar o match, crie duas contas (dois aparelhos/emuladores) e dê "chamar" nas duas.

## Fluxo

Splash (deslizar) → **Selecione a sua jornada** (Freelancer ou Empresa) → cadastro → perfil por tipo → deck. Freelancers veem empresas e empresas veem freelancers; match mútuo abre o chat.

## Navegação (demo)

Barra preta em pílula: **Início, Explorar, + , Rede e Perfil**. O **+** abre uma folha de vidro com três ações (publicar vaga, postar trabalho, projeto aberto). Em **Explorar**, o profissional desliza **vagas** (direita candidata, esquerda pula, para cima salva) e também vê pessoas, salvas e projetos; a empresa desliza talentos e vê as próprias vagas. A **Rede** é o feed de trabalhos (foto, curtir, comentar, salvar). Cena e Conversas abrem pelo Início. Veja [docs/direcao-visual.md](docs/direcao-visual.md) e [docs/analise-ux.md](docs/analise-ux.md).

O app é **claro primeiro**, com vidro fosco e azul elétrico como única cor de ação; o modo escuro está preparado em `src/theme.ts` (`palette.dark`), mas ainda não está ligado.

### Fotos

As fotos de capas, posts e perfis de exemplo são **CC0** (StockSnap, via Openverse) e estão em `assets/photos` e `assets/portraits`, com créditos em [assets/photos/CREDITS.md](assets/photos/CREDITS.md). São **ilustrativas**: não mostram as pessoas, empresas ou trabalhos de exemplo. Para trocar, edite `src/constants/photos.ts`.

## Jobs e match %

Na demo, a empresa publica uma vaga em 4 passos (com capa e prévia), o profissional vê o match % explicado e se candidata, abre o detalhe (galeria, requisitos, empresa, vagas parecidas), e os dois seguem por contrato, custódia (simulada), avaliação e XP. Veja [docs/jobs-e-match.md](docs/jobs-e-match.md).

## Personas de teste

Dez contas prontas (5 freelancers e 5 empresas) para testar o match: veja [docs/personas-teste.md](docs/personas-teste.md). Na demo (`EXPO_PUBLIC_DEMO=1`) elas aparecem na tela de login; no Supabase de teste, rode `supabase/seed/personas.sql`. Os arquivos são gerados com `npm run gen:personas`.

## Scripts

- `npm test` — testes das regras de match/filtros e das personas
- `npm run gen:personas` — regera o SQL e o guia das personas a partir de `src/constants/personas.json`
- `npm run typecheck` — TypeScript
- `npm run lint` — ESLint do Expo

## Como funciona

- `supabase/migrations/0001_init.sql`: tabelas `profiles`, `swipes`, `matches`, `messages`; um *trigger* cria o match quando há dois likes opostos; RLS garante que cada pessoa só edita o próprio perfil e só lê mensagens dos seus matches.
- `src/app/`: telas (login, onboarding, descobrir, matches, perfil, chat).
- `src/components/CardDeck.tsx`: pilha de cartas em leque com gesto de arrastar (Reanimated + Gesture Handler) e botões; `SwipeDeck` (pessoas) e `JobDeck` (vagas) usam ele.
- `src/lib/matching.ts`: regras puras (filtros, par de match), cobertas por testes.

## Fora do MVP (próximos passos)

Vagas/projetos publicados, notificações push, verificação de perfil, denúncia/bloqueio, filtro por distância e paginação do deck.
