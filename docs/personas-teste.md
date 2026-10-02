# Personas de teste do match

> Gerado por `scripts/gen-personas.js` a partir de `src/constants/personas.json`. Não edite à mão.

Dez contas prontas, cinco freelancers e cinco empresas. **Senha de todas: `Teste@123`** (apenas para testes, nunca em produção).

## Como usar

- **Na demo:** na tela de login, toque em uma persona em "Entrar como persona". Para trocar de pessoa, vá em Perfil, toque em Sair e entre com outra. Os likes e matches continuam enquanto a página estiver aberta.
- **No seu Supabase de teste:** rode `supabase/seed/personas.sql` no SQL Editor, depois das duas migrations. Entre no app com o e-mail e a senha da tabela.

## As 10 personas

| Persona | Tipo | Cargo | Cidade | Funções | Cachê/dia | Situação | Login |
|---|---|---|---|---|---|---|---|
| **Marina Duarte** | freelancer | Diretora de Fotografia | São Paulo | Diretor(a) de Fotografia | R$ 1.800 a 2.800 | Disponível | `marina.duarte@takeone.test` |
| **Caio Ribeiro** | freelancer | Editor e Colorista | Rio de Janeiro | Editor(a), Colorista | R$ 900 a 1.500 | Disponível | `caio.ribeiro@takeone.test` |
| **Joana Alencar** | freelancer | Técnica de Som Direto | Recife | Técnico(a) de Som Direto | R$ 1.200 a 1.900 | Ocupada | `joana.alencar@takeone.test` |
| **Theo Nakamura** | freelancer | Motion Designer e VFX | São Paulo | Motion Designer, VFX / Animador(a) | R$ 700 a 1.300 | Disponível | `theo.nakamura@takeone.test` |
| **Bia Camargo** | freelancer | Direção de Arte e Figurino | Porto Alegre | Direção de Arte, Figurinista | R$ 800 a 1.400 | Disponível | `bia.camargo@takeone.test` |
| **Lume Filmes** | empresa | Produtora publicitária | São Paulo | Diretor(a) de Fotografia, Operador(a) de Câmera | — | Contratando | `lume.filmes@takeone.test` |
| **Casa Vermelha Produções** | empresa | Documentários e séries | Rio de Janeiro | Editor(a), Colorista, Motion Designer | — | Contratando | `casa.vermelha@takeone.test` |
| **Estúdio Neon** | empresa | Estúdio de motion e VFX | Belo Horizonte | Motion Designer, VFX / Animador(a) | — | Sem vagas | `estudio.neon@takeone.test` |
| **Pulso Audiovisual** | empresa | Cobertura de shows e festivais | Curitiba | Técnico(a) de Som Direto, Desenhista de Som | — | Contratando | `pulso.audiovisual@takeone.test` |
| **Fio Condutor Cinema** | empresa | Cinema autoral | Porto Alegre | Direção de Arte, Figurinista | — | Contratando | `fio.condutor@takeone.test` |

## Personalidade (define as respostas automáticas do chat na demo)

- **Marina Duarte:** Perfeccionista e direta. Quer decupagem, lentes e referências antes de fechar qualquer diária.
- **Caio Ribeiro:** Calmo e detalhista. Pergunta formato de entrega, número de revisões e prazo real.
- **Joana Alencar:** Bem-humorada e prática. Está ocupada agora, mas responde rápido e vai direto ao ponto.
- **Theo Nakamura:** Criativo e ansioso com prazo. Responde em segundos e sempre pergunta a data de entrega.
- **Bia Camargo:** Entusiasta e fala rápido. Já chega com ideias, referências e perguntas sobre a paleta do filme.
- **Lume Filmes:** Objetiva e com orçamento apertado. Fala de cachê logo na primeira mensagem.
- **Casa Vermelha Produções:** Formal e planejada. Fala em contratos de longo prazo, cronograma e confidencialidade.
- **Estúdio Neon:** Descolada e informal, cheia de gíria. Sem vagas abertas, mas gosta de trocar ideia.
- **Pulso Audiovisual:** Ágil e sempre com urgência. Pergunta disponibilidade imediata e fecha rápido.
- **Fio Condutor Cinema:** Artística e conversadora. Adora falar de referências, mas demora para fechar valores.

## Likes que já existem

Só um lado curtiu. O match acontece quando você entra como o outro lado e curte de volta.

- Marina Duarte curtiu Lume Filmes
- Joana Alencar curtiu Pulso Audiovisual
- Theo Nakamura curtiu Casa Vermelha Produções
- Lume Filmes curtiu Caio Ribeiro
- Casa Vermelha Produções curtiu Caio Ribeiro
- Estúdio Neon curtiu Bia Camargo
- Fio Condutor Cinema curtiu Bia Camargo

## Cenários de teste

Entre como a persona, abra Descobrir e curta quem está na lista. Quem já recebeu seu like antes não aparece de novo no deck.

| Entre como | Curta | Resultado esperado |
|---|---|---|
| Marina Duarte | Casa Vermelha Produções, Estúdio Neon, Pulso Audiovisual, Fio Condutor Cinema | Nenhum match (essas pessoas nunca curtiram Marina Duarte) |
| Caio Ribeiro | Lume Filmes e Casa Vermelha Produções | **É um match!** e chat liberado |
| Caio Ribeiro | Estúdio Neon, Pulso Audiovisual, Fio Condutor Cinema | Nenhum match (essas pessoas nunca curtiram Caio Ribeiro) |
| Joana Alencar | Lume Filmes, Casa Vermelha Produções, Estúdio Neon, Fio Condutor Cinema | Nenhum match (essas pessoas nunca curtiram Joana Alencar) |
| Theo Nakamura | Lume Filmes, Estúdio Neon, Pulso Audiovisual, Fio Condutor Cinema | Nenhum match (essas pessoas nunca curtiram Theo Nakamura) |
| Bia Camargo | Estúdio Neon e Fio Condutor Cinema | **É um match!** e chat liberado |
| Bia Camargo | Lume Filmes, Casa Vermelha Produções, Pulso Audiovisual | Nenhum match (essas pessoas nunca curtiram Bia Camargo) |
| Lume Filmes | Marina Duarte | **É um match!** e chat liberado |
| Lume Filmes | Joana Alencar, Theo Nakamura, Bia Camargo | Nenhum match (essas pessoas nunca curtiram Lume Filmes) |
| Casa Vermelha Produções | Theo Nakamura | **É um match!** e chat liberado |
| Casa Vermelha Produções | Marina Duarte, Joana Alencar, Bia Camargo | Nenhum match (essas pessoas nunca curtiram Casa Vermelha Produções) |
| Estúdio Neon | Marina Duarte, Caio Ribeiro, Joana Alencar, Theo Nakamura | Nenhum match (essas pessoas nunca curtiram Estúdio Neon) |
| Pulso Audiovisual | Joana Alencar | **É um match!** e chat liberado |
| Pulso Audiovisual | Marina Duarte, Caio Ribeiro, Theo Nakamura, Bia Camargo | Nenhum match (essas pessoas nunca curtiram Pulso Audiovisual) |
| Fio Condutor Cinema | Marina Duarte, Caio Ribeiro, Joana Alencar, Theo Nakamura | Nenhum match (essas pessoas nunca curtiram Fio Condutor Cinema) |

### Casos que cada coisa cobre

- **Match de verdade (dos dois lados):** Caio curte Lume Filmes e depois entre como Lume Filmes: Caio já não aparece, porque o match foi criado.
- **Vários matches para a mesma pessoa:** Caio fecha com Lume Filmes e Casa Vermelha. A Casa Vermelha também fecha com Theo.
- **Nenhum match:** Marina, Joana e Theo só ganham match quando a empresa que eles já curtiram os curte de volta.
- **Filtro de disponibilidade:** Joana (ocupada) e Estúdio Neon (sem vagas) somem com "Só disponíveis" ou "Só contratando".
- **Filtro por função:** use os chips de função no topo do deck.
- **Chat:** na demo, o outro lado responde com a personalidade da persona.

## Se o login do seed falhar no Supabase

O SQL insere direto em `auth.users` e `auth.identities`, o que pode variar com a versão do Supabase. Se o login der erro, crie os 10 usuários em *Authentication → Users → Add user* (com a senha acima e e-mail confirmado) e rode só as partes 2 e 3 do SQL (perfis e likes), trocando os ids pelos ids reais dos usuários.
