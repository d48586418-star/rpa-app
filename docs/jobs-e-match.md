# Jobs e match % (primeira fatia)

Esta fatia traz para o app o núcleo do documento de produto "Diária": o contratante publica um **job**, o profissional vê o **match %** explicado, se candidata de graça, e os dois seguem por **contrato, pagamento em custódia (simulado), avaliação e XP**.

> **Só roda na demo** (`EXPO_PUBLIC_DEMO=1`). O backend Supabase dos jobs ainda não existe, e a aba Jobs fica oculta fora da demo.

## O que é simulado

| Parte | Na demo | Para ser real precisa de |
|---|---|---|
| Pagamento em custódia (Pix) | Botões mudam a etapa. Nenhum dinheiro se move | Parceiro de pagamentos regulado com conta de custódia e validação jurídica |
| Liberação 24 h após o check-out | Liberação imediata por botão | Agendador no servidor e regras de contestação |
| Check-in e check-out | Botão, sem localização | Geolocalização no horário marcado, com consentimento (LGPD) |
| Confirmação de crédito | Botão "Simular confirmação" | Fluxo de convite para o contratante ou a equipe confirmarem |
| Identidade | Não existe | Verificação de CPF e selfie antes do primeiro job pago |
| Contrato | Texto de exemplo gerado do job | Revisão jurídica do modelo (prestação de serviço e cessão de imagem) |

## Match % (`src/lib/matchScore.ts`)

Nota de 0 a 100 por job, com pesos fixos e sempre explicada.

| Fator | Peso | Como é medido |
|---|---|---|
| Função e habilidades | 30 | 70% função (nota cheia com 2 créditos verificados na função, 75% com 1, 40% só declarada) e 30% equipamentos pedidos que o perfil declara |
| Experiência no tipo de trabalho | 20 | Créditos verificados no mesmo gênero; 3 valem nota cheia |
| Disponibilidade na data | 15 | Qualquer dia do job marcado como ocupado zera o fator |
| Distância | 10 | Dentro de metade do raio vale tudo; cai até zero no limite do raio; job remoto vale tudo |
| Reputação | 15 | 50% nota média, 25% comparecimento, 25% prazo. Sem avaliações, nota neutra |
| Faixa de valor | 5 | Orçamento cobre a diária mínima (cheio), fica até 20% abaixo (metade) ou muito abaixo (zero) |
| Formação no app | 5 | Selo da trilha da função. Só Montagem tem trilha; para as demais funções o fator **não conta** e a nota é reescalada para 100 |

Regras de justiça, cobertas por testes:

- O cálculo recebe só dados profissionais. Foto, gênero, idade e bairro não existem na entrada.
- Crédito pendente (não verificado) não conta.
- Conta com menos de 60 dias ganha +5 **só na ordem da lista do contratante**. O % mostrado ao profissional é o real.
- O app nunca sugere baixar a diária para subir o match.

**O que falta:** cada melhoria possível (um crédito verificado, liberar a data, declarar o equipamento, fazer a trilha) é simulada de verdade, e só aparece se aumentar o match. O texto mostra o novo valor, por exemplo "sobe seu match para 94% (+6)".

**Chance de ser chamado:** faixa Alta, Média ou Baixa a partir do match e da posição entre os candidatos. Nunca um número.

## Etapas do contrato (`src/lib/engagement.ts`)

`Contrato` (profissional aceita) → `Pagamento` (contratante paga em custódia) → `Em custódia` (profissional faz check-in) → `No set` (check-out) → `Entregue` (contratante libera) → `Liberado` (contratante avalia) → `Concluído`.

Valores (`src/lib/contract.ts`): o profissional recebe a diária inteira; o contratante paga uma taxa de serviço de 8% por cima, mostrada à parte. Hora extra, multa de cancelamento (30%, com menos de 48 h) e rodadas de revisão por função aparecem no contrato. **Valores de partida a testar.**

## XP, níveis e selos (`src/lib/xp.ts`)

- XP: job concluído (+100), primeiro job (+50), avaliação de 4 ou mais (+20), crédito verificado (+30).
- Níveis: Claquete, Assistente (150), Operador(a) (400), Chefe de Equipe (800), Diretor(a) de Cena (1500).
- Selos: Pontual (10 check-ins), Entrega no prazo (10 entregas de pós-produção), Primeiro job, Pioneiro(a).

## Para testar

Entre pela tela de login como uma das personas (veja [personas-teste.md](personas-teste.md)): Marina candidata-se ao job de casamento; a Lume Filmes vê os candidatos ordenados, fecha com ela e percorre o contrato; Marina volta e vê o XP e o selo. Os 70 testes automáticos cobrem as regras de cada fator, o fluxo inteiro do contrato e as validações.

## Modelo de dados proposto para o Supabase (próxima etapa)

Ainda não implementado. Tabelas sugeridas, com RLS por participante:

- `jobs` (owner_id, title, role, genre, date, days, city, budget_per_day, gear text[], description, status)
- `applications` (job_id, pro_id, status; PK composta)
- `engagements` (job_id unique, pro_id, owner_id, stage, check_in_at, check_out_at)
- `reviews` (engagement_id, reviewer_id, reviewee_id, tecnica, comunicacao, prazo, tip)
- `credits` (pro_id, title, role, genre, year, verified, confirmed_by)
- `availability_blocks` (pro_id, date)
- `xp_events` (pro_id, label, xp, engagement_id): o XP e os selos saem da soma desse livro-caixa
- Em `profiles`: `radius_km`.

O cálculo do match é uma função pura, então pode rodar no cliente (como hoje) ou virar uma função SQL; as regras são as mesmas.

## Fora desta fatia

Trilhas e Laboratório de Montagem, feed da Cena, desafios do mês, comunidades, mentoria, indicação recompensada, aluguel de equipamento, "Monte sua equipe", ranking por temporada, verificação de identidade e pagamento real.
