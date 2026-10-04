# Decisões de design — v8

## Diagnóstico do v7 (auditoria)
Excesso de competição visual (enunciado, stepper de 7 etapas, monitor, timeline, 3 abas, biblioteca no mesmo plano), bordas de 2 px e sombras duras em tudo, glifos (✓ ◐ ○ ◆ ✂) como ícones, descoberta presa à reflexão escrita, comparação como passo do caminho, jump cut × elipse com a mesma pergunta, pouca teoria (só exercícios), cartilha sem ponte real (`pagina:null`), Home com cara de landing.

## Linguagem visual
Sem a cartilha disponível, extraí das referências: painéis claros e arredondados de editor de vídeo (layout do lab), cartões rotacionados sobre fundo (capa), fita diagonal (Home), cartões coloridos grandes com foto na base e títulos apertados (jornada), alças verde/vermelha de aparar (timeline). Marca existente preservada: tinta, **amarelo claquete**, acentos por ato (lima, laranja, lilás). Regras: fundo branco; hairlines em vez de bordas; raios 18–40 px; títulos Archivo 800 com tracking negativo, caixa-alta só em rótulos; sem emoji; ícones SVG próprios; **duotone** (filtros SVG) só em contextos editoriais (capa, jornada, fotogramas), **cor natural** dentro do laboratório (o aluno analisa a imagem real).

## Minimalismo (o que saiu)
Stepper 7→4 passos (+ "Aprofundar" opcional). Enunciado virou **Faça / Observe** em duas linhas (completo sob demanda). Ferramentas só aparecem com planos na timeline. Três abas → **Planos · Descoberta · Aprofundar**; em desktop viram painel lateral único. Portas da Home, XP-like e etiquetas removidos. Dock sticky no celular (vídeo sempre visível ao escolher planos).

## Pedagogia
- **Descoberta pela ação:** assistir a uma montagem que realiza a proposta registra o experimento e revela o nome. `unlocked()` por reflexão foi removido; reflexão só consolida.
- **Momento de reconhecimento:** "Isso que você fez tem um nome" → o que mudou → frase-síntese → o que você ganhou → Na cartilha → próximo passo.
- **Kuleshov:** bloco *mesmo rosto + imagem diferente = leitura diferente* montado com os quadros das versões do próprio aluno.
- **Jump cut × elipse:** mesma operação, perguntas opostas. Jump cut mostra os dois quadros reais em volta da emenda ("o que mudou de lugar no quadro?"); elipse mostra a barra de tempo omitido ("você não viu, mas entendeu que passou").
- **EX_CORTE_003 (A professora):** ensina o tempo atravessado num mesmo enquadramento; mantido como "o mesmo lugar, outro tempo", parente do match cut só pela composição. Não foi renomeado para match cut.
- **Murch:** critérios como ordem de perguntas, nunca "a resposta certa".
- **Feedback relacional:** nada de certo/errado; variações viram *Exploração diferente*.
- **Reflexão leve:** pergunta adaptativa (1ª "O que você sentiu?", 2ª "Mudou alguma coisa?", 3ª "Qual funciona melhor para você?"); a pergunta concreta do motor vai de apoio.
- **Teoria como extensão:** Biblioteca de descobertas (conceito só abre depois de experimentado, com "ver mesmo assim"), "O que é edição?", "Quem foi?".

## Gamificação
Folha de contato (experimentou → descobriu → aprofundou), Jornada do Editor (5 paradas), descobertas nomeadas. Sem XP, ranking, vidas, nível ou medalhas. O motor continua decidindo "aprofundou".

## Integração cartilha ↔ laboratório
`CH.naCartilha` compõe "Ato · seção · p. N" sem inventar número; link para PDF se `cartilha.pdf` existir. IDs estáveis (`EX_*`) viram URLs `#/lab/ID` (botão "Copiar link" e `npm run qr`).

## Técnica
Player e motor intactos; MP4 de fallback; correção de bug preexistente (`tToX` ao limpar a timeline); scroll engine estendido (trilho com escala/inclinação, fita que acelera com a velocidade de rolagem, cena 1 visível desde o início).

## Autoavaliação (honesta, sem medição externa)
Verificado por teste automatizado: 13 rotas × 5 larguras sem erro/overflow, as 15 atividades chegando à descoberta pela interface, persistência, exportar/importar, versões, alvos ≥ 44 px, movimento reduzido. **Não verificado:** Safari/iOS real, leitores de tela reais, teste com aluno real, fidelidade à cartilha.
| Categoria | Nota | Observação |
|---|---|---|
| Conceito/didática/iniciante | 8,5 | fluxo e textos novos; falta testar com aluno |
| Atividades/progressão | 8,5 | 15 OK; requisitos de "aprofundar" ainda pesados em Kuleshov |
| UX/UI/identidade | 8,0 | minimalista e coerente; não é a cartilha (não recebida) |
| Acessibilidade | 8,5 | sem teste com leitor de tela |
| Cartilha ↔ lab | 6,5 | estrutura pronta; páginas vazias |
| Técnica | 8,5 | sem Safari real |
Não atingi 9,5: os pontos acima dependem da cartilha e de teste com pessoas.

## Rodadas 2 e 3
- **Feedback sem certo/errado:** o aluno nunca vê as classes do motor. A descoberta é tipográfica (“CORTOU.” + uma frase), 300–500 ms, sem emoji, com som opcional desligado por padrão.
- **Persona só em momentos estratégicos** (entrada, escolha, início, descoberta, Meu espaço). Nunca mascote fixo; cor como acento.
- **Motor intocado:** novas atividades usam `js/novas.js` com o mesmo formato de leitura.
- **Áudio real nos J/L-cut:** faixa A1 com `<audio>`; o aluno separa e move. Regras por tempo, não por identidade de take.
- **PDF no lugar de JSON:** dados técnicos nunca aparecem para o aluno.
- **Museu:** só afirma o que tem fonte; divergências são escritas; termos da cartilha preservados literalmente.

## Abertura (index.html)
- **Sem serifa:** a especificação pedia Fraunces; a autora pediu depois “não quero fonte serifada”. Display e texto em DM Sans (variável, local).
- **Pico = o corte:** pin de 300 svh; a rolagem anda o playhead e depois abre uma fenda (clip-path) no vermelho. Sem duplicar DOM, sem biblioteca.
- **IntersectionObserver não vê o clip-path do próprio alvo:** o reveal de eras e salas usa `getBoundingClientRect` no loop de rolagem.
- **Cada sala do museu tem forma própria** (raio, borda, sombra e direção de entrada diferentes); nenhuma grade uniforme.
- **Cabeçalho** vira barra sólida depois do hero (sem mix-blend, que ficava ilegível sobre o conteúdo).
- **Aparência** automática/clara/escura com tokens da autora; hero e rodapé não mudam.
- **Perfil sugerido:** a escolha na abertura grava `ch:persona-hint`; as boas-vindas do laboratório abrem já com ele.

## v9: reforma visual
Referência de estrutura e acabamento: butter.video (95% de semelhança, com mais interação). O que veio dela: barra flutuante de vidro, títulos enormes em peso leve e tracking apertado, seções com ritmos diferentes, rodapé escuro com ticker. O que é nosso: o rasgo da tela no título, o filmstrip do Museu (fundo branco, pontas verde e vermelha), o duotone com planos de filmes reais, o seletor de perfil que recolhe.
Contra o "aspecto de IA" (pesquisa em outubro de 2026): âncora em referência nomeada; fonte única com peso leve; sem gradiente roxo, sem terracota #D97757, sem três cartões iguais, sem seta em todo link, sem ponto-médio entre metadados, sem travessão espaçado, sem rótulo em caixa-alta acima de título, raios e sombras com hierarquia, fade-slide-up usado em um só momento, ritmo de densidade variado, grades irregulares.


## Rodada 7: "vidro minimalista" (um só sistema)
**Definição.** Tipografia DM Sans / Helvetica Neue. Vermelho `#960000` só na abertura, na capa e como acento de foco. Superfícies neutras (papel `#fafafa` / tinta `#0f0f0f`; escuro `#0f0f0f`). **Vidro** = fundo translúcido + `backdrop-filter` (blur 9–18px) + borda de 1px + realce interno de 1px no canto superior esquerdo; é o mesmo material do controlador da escolha de perfil.
**Botões.** Todo `.btn` (e `.gb` na escolha de perfil) é vidro ou contorno fino: fundo `currentColor` a 7%, contorno de 1px a 30%, sem preenchimento colorido e **sem troca de cor no hover** (hover = elevação de 1px e contorno um pouco mais firme). A ação principal (`.pri/.red/.ink`) só ganha contorno de 1,5px e peso 600. Estado ativo de abas/segmentos = vidro mais firme + contorno de 1,5px + peso 600, nunca tinta cheia. Altura 40–48px (os controles do laboratório seguem com alvo ≥ 44px).
**Navegação.** Tabbar e topnav usam os tokens `--nav-*` (vidro neutro bem transparente, blur 18px, borda branca a 55%; no escuro, vidro cinza a 40%), texto em tinta; o fundo aparece por trás. Raios 999 em controles.
**Fora do padrão por decisão:** rótulos (`.tag`, `.act-nx`) seguem com tinta cheia por serem etiquetas e não botões; o aviso offline e o "pular para o conteúdo" também.
**Fontes.** Todo conteúdo pesquisado mostra a fonte (nome do site + link) em fonte pequena; sem origem verificada, "texto do projeto".

**Ajustes pós-entrega.** Escolha de perfil sem barra de nomes: um perfil por vez, bolinhas que seguem o dedo e botão "Escolher". Sem texto sublinhado em nenhuma rota (peso 600 + seta ↗ nos links externos). Abertura: título peso 800 sem linha de corte; a próxima tela aparece desfocada durante o zoom e ganha foco na chegada.

**Movimento e acessibilidade (rodada 8).** A abertura e os vídeos de personagem são o conteúdo principal e são acionados pelo próprio aluno; por isso o "reduzir movimento" do sistema só os suaviza (sem giros, zoom curto). Quem quiser desligar tudo usa Meu espaço → Movimento → Reduzido, que é respeitado por completo.
