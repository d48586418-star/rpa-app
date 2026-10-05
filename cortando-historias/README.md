# Cortando Histórias — Laboratório de Montagem (v9)

Extensão digital da cartilha *Cortando Histórias* (Cinema na Comunidade). A pessoa **vê → faz → percebe → descobre → nomeia → experimenta de novo**, com planos de filmes reais. Você está aprendendo a olhar como editor.

HTML/CSS/JS puro, sem build e sem CDN. Abre por duplo clique em `index.html` (abertura) ou com servidor (`npm run serve`). O laboratório em si está em `lab.html`.

## Comandos

```bash
npm install                      # http-server e playwright
npx playwright install chromium  # (ou PLAYWRIGHT_CHROMIUM=/caminho/do/chrome)
npm run validate                 # gera data/data.js e valida dados, assets, mp4, didática, conceitos, emojis
npm test                         # e2e: 13 rotas × 5 larguras, as 15 atividades, vídeo real, versões, importar/exportar…
npm run qr                       # tabela id → URL para QR Codes da cartilha
```
Depois de editar qualquer `data/*.json`: `npm run build`.

## Estrutura

```
index.html (abertura)  lab.html (laboratório)  css/ (abertura, tokens, base, shell, home, screens, learn, lab)  js/  data/  assets/  fonts/  scripts/  tests/
js/engine.js leituras.js   motor e leitura do v7 (INALTERADOS)
js/lab.js lab-panels.js    monitor, timeline, descoberta, aprofundamento, comparação A/B
js/views-*.js app.js       Início, Jornada, Descobertas/Conceitos/O que é edição?, Caderno, Meu espaço, Créditos
data/didatica.json         faça · observe · depois de assistir · o que mudou · descoberta (15 atividades)
data/conceitos.json        biblioteca de descobertas + "O que é edição?" + "Quem foi?"
data/cartilha.json         mapa laboratório ↔ cartilha (páginas) · data/imagens.json política de imagens
```

## Como a experiência funciona

**Caminho essencial:** Ver → Montar → Assistir → Descobrir → Continuar. Ao terminar de assistir, se a montagem realiza a proposta, o experimento é **registrado sozinho** e a descoberta aparece (nome, o que mudou, o que você ganhou, *Na cartilha*, próxima atividade). Nenhum texto digitado é exigido.
**Aprofundar (opcional):** comparar A/B, versões, duplicar, anotar, pergunta para observar. Comparar nunca bloqueia nada.
Montagens fora da proposta não são "erro": aparecem como *Exploração diferente* ou *Ainda não aconteceu*, com feedback relacional.

**Folha de contato (sem pontos):** cada atividade é um fotograma: *a revelar* → *experimentou* (P&B) → *descobriu* (duotone do ato) → *aprofundou* (cor, exige o que o motor pede). **Jornada:** Relacionar → Continuar → Manipular o tempo → Escolher → Criar (laboratório livre).

Primeira atividade (*Na estrada*) é o tutorial do laboratório (4 passos) e some depois de "Entendi".

## Motor e dados preservados
`engine.js`/`leituras.js` idênticos; classes `valid / alternative_valid / known_weak / invalid / unmapped / incomplete` intactas. Mudou só a *apresentação* e o critério de "descoberta" (agora pela ação, não por reflexão). O estado "aprofundou" continua usando `checkCompletion` + `reflectionStatus` do motor.

## Vídeo
WebM/VP8 originais + **MP4/H.264 gerados** (`scripts/make-mp4.sh`, exige ffmpeg com libx264). Safari/iOS recebem MP4 automaticamente (`CH.vurl`). **Não testado em Safari/iOS real** (sem acesso aqui): validado em Chromium. `DL_022` só existe como imagem.

## Acessibilidade
Skip link, foco visível, navegação por teclado (timeline: setas; Shift = 1 s), alvos ≥ 44 px (verificado em teste), `aria-live`, estados nunca só por cor, `prefers-reduced-motion` + opção em Meu espaço (abertura vira sequência estática), texto maior, mais contraste, revelação progressiva e uma pergunta por vez (acessibilidade cognitiva).

## Privacidade
Tudo em `localStorage` (`ch:v1`). Sem conta, sem rede. Para o aluno, “Salvar minha jornada” gera um PDF (jsPDF 2.5.1, em `vendor/`). Cópia técnica `.json` fica na rota oculta `#/tecnico`. Campos novos (`tut`, `seen`, `disc[].ex`) são compatíveis com dados antigos.

## ⚠ Pendências que dependem da cartilha (não inventei)
1. **A cartilha não veio no ZIP.** Só vieram o laboratório e imagens de referência externa (editor de vídeo, cartões rotacionados, fita diagonal, etc.). A linguagem visual foi extraída dessas referências + marca existente (preto, amarelo claquete, acentos), **não** da cartilha. Se ela usa outra paleta/fonte, ajuste `css/tokens.css`.
2. **Páginas da cartilha:** `data/cartilha.json` tem 28 entradas com `pagina: null`. A interface mostra "Ato N · título" até você preencher (`secao`, `pagina`, `pdf`). Os 4 Atos continuam agrupados a partir das 9 etapas; conferir com a estrutura real.
3. **Textos de "O que é edição?", conceitos e "Quem foi?"** foram escritos a partir do que as atividades ensinam e conhecimento geral (Kuleshov, Murch); conferir com a cartilha. Sem retratos: não havia imagem com procedência; usei placas tipográficas.
4. **Créditos institucionais:** só a sigla UESC constava.
5. `MC_007` (dado 2,13 s, arquivo 7,17 s; usa 2,13 s). `jc_done` fala "câmera não se mexeu" mas `NL_047` é plano geral→close; os textos novos evitam a afirmação, o dado antigo segue.
6. Os personagens (perfis) são imagens e vídeos **gerados por inteligência artificial**, enviados pela autora; o duotone é feito no navegador sobre os quadros dos próprios filmes.

## Licenças
Fontes SIL OFL 1.1 (`fonts/LICENSES.txt`). Planos pertencem aos curtas listados em Créditos, uso educacional.

## Rodadas 2 e 3
Ver [RELATORIO_INTEGRACAO.md](RELATORIO_INTEGRACAO.md): integração dos takes, personas, boas-vindas, timeline com tesoura, J/L-cut, Passaporte e Museu da Edição. Rotas novas: `#/boas-vindas`, `#/editor`, `#/museu`, `#/museu/:id`, `#/tecnico`.

## Abertura (index.html)
Home no estilo da referência butter.video: hero vermelho (#a81020) com o “corte” (a rolagem é a timeline; no fim, uma fenda abre no vermelho e revela a citação da cartilha), linha do tempo de 8 eras, Museu do Editor assimétrico + paradas reais do Museu da Edição (`data/museu.json`), escolha de perfil com controlador de vidro, rodapé com ticker e aparência claro/escuro/automática. Tipografia: **DM Sans** (a autora não quer fonte serifada), servida de `fonts/`. Movimento só liga sem `prefers-reduced-motion`. `BRIEF.md` e `construcoes.md` registram a jornada em cenas. Textos das 8 eras e “mais de 40 equipamentos catalogados” vieram da autora e não foram verificados.

## Rodada 4: reforma visual completa (v9)
- **Um só sistema visual** na abertura (`index.html`) e no laboratório (`lab.html`): papel quente, tinta, vermelho de claquete, âmbar, DM Sans em pesos 400 a 600, vidro (glass) e duotone. Tokens em `css/tokens.css`. Sem serifa, sem caixa-alta espaçada, sem Archivo/Inter/JetBrains (removidas de `fonts/`).
- **Abertura**: o título "Cortando" rasga a tela ao rolar e revela "Histórias" (`.rip` em `css/abertura.css`, pontos do rasgo gerados em `js/abertura.js`). Há uma seção Guia e o seletor de perfil com cápsula de vidro.
- **Navegação**: Início, Jornada, Museu, Livre, Caderno, Guia, Meu espaço (no celular, Meu espaço é o selo no cabeçalho). `#/edicao` redireciona para `#/guia`. Toda aba traz uma linha "Nesta aba".
- **Museu** (`js/views-museu.js`, `css/museu.css`): filmstrip de seleção com pontas verde (início) e vermelha (fim) arrastáveis, 4 salas por categoria, barras de Murch, montadoras. As imagens são planos do próprio laboratório em duotone. Para usar uma imagem sua: coloque `assets/museu/<id>.jpg` e acrescente o id em `"imgs"` no `data/museu.json`.
- **Celebração** (`js/celebrar.js`): ao realizar um efeito, uma estrela aparece no centro, por cima de tudo, dizendo qual efeito foi realizado. Fecha com botão, clique fora ou Esc.
- **Escolha de perfil** (boas-vindas e abertura): controle de vidro, cápsula deslizante, os outros perfis recolhem e surge "Trocar"; vídeo trocado sem costura; 2 colunas no celular.
- **Guia** (`js/views-guia.js`): o que faz cada aba, cada passo, cada ferramenta e "O que é edição?".
- A cartilha não é mais citada na interface (páginas, capítulos ou "Na cartilha"). O mapeamento interno continua em `data/cartilha.json` e `AUDITORIA_CARTILHA.md`.
- O laboratório (`lab.html`) é só claro; a abertura tem tema escuro.

### Imagens do Museu
As fotos em `assets/museu/` (Méliès, Porter, Griffith, Kuleshov, Eisenstein, Pudovkin, Vertov, Godard e Murch) são **imagens da internet** (fonte específica e licença de cada uma não registradas; ver `assets/museu/creditos.json`) e entram em duotone. Identifique a origem e a licença de cada uma antes de publicar de forma ampla. Sem foto, a parada usa uma ilustração própria (hoje: tesouras, J-cut e L-cut, e Lean). `melies-lua.jpg` é um fotograma de Méliès ainda não usado.

## Rodada 5 (v10)
- **Player:** em rede lenta o relógio da montagem espera o vídeo carregar (até 30 s). Só vale como "assistiu" se todos os planos realmente apareceram; caso contrário avisa e pede para assistir de novo.
- **Peso:** takes novos recodificados em 640×360 (WebM VP9 ~250 kbit/s, MP4 H.264 ~350 kbit/s, com áudio). `assets/personas/originais` e os vídeos DF_049/053/055/066 (não usados) removidos. Site: 92 MB → 28 MB.
- **Eixo:** a leitura agora usa a posição real de cada plano (`lado`) e detecta quando eles trocam de lado.
- **Jornada:** etapa 1 agora começa pelo corte direto (a antiga etapa 10 foi absorvida; etapas renumeradas).
- **Timeline:** zoom (− / +), rótulos da régua maiores, botões "Recuar" / "Avançar" no lugar de dois "Mover".
- **Telas baixas:** o dock fixo deixa de ser fixo em celulares com menos de 900 px de altura; o aviso "Nesta aba" aparece só na primeira visita.
- **Textos:** "N de 19 descobertas" igual em Início e Meu espaço; "Falta pouco…" só depois da primeira descoberta; indicador de passos com contraste ≥ 4,5:1.
- Não feito nesta rodada: áudio nos planos-base (precisa de material), trocar o NL_047 (precisa de novo material de jump cut), importar PDF/progresso, "Na cartilha, p. X" (conflita com a regra de não citar a cartilha).

## Rodada 6 (v11) — retorno da primeira rodada de testes com a autora
- **Capa:** tela vermelha sólida; "Cortando" pequeno sobre "Histórias" grande, apresentação e botão "Começar a jornada". O rasgo nasce reto e só fica irregular ao rolar. Sem as marcas laterais. Botões não ficam mais amarelos ao passar o mouse.
- **Perfil de editor:** pergunta à esquerda ("perfil de editor" em negrito), personagem à direita; passar o mouse/dedo mostra o olhar de cada perfil; o botão final usa a cor do perfil (mais escura que o fundo).
- **Laboratório (telas largas):** monitor e planos em cima, timeline larga embaixo; sem o aviso "Nesta aba"; destaques em vermelho/branco (o amarelo ficou só para a estrela). Cores das etapas: vermelho, azul, amarelo, verde e ameixa, com duotones próprios.
- **Início:** etapas em carrossel horizontal.
- **Museu:** ilustração da timeline colorida e em vidro; fontes trocadas por Britannica, Library of Congress, Criterion, BFI, ACMI e artigo revisado por pares. Blogs e Wikipedia saíram.
- **Caderno:** folha pautada com margem e furos. **Livre:** enunciado no mesmo estilo das outras atividades.
- Pendente: conferir os textos do Museu contra as fontes novas (não foi possível abrir as páginas, só confirmar que existem), `Livre` com nomes de filmes padronizados (não localizei o trecho em caixa alta).

## Rodada 7 (final): abertura espelhada, escolha com barra de vidro, design "vidro minimalista"
- **Abertura** (`index.html`, `css/abertura.css`, `js/abertura.js`): composição das 3 referências **espelhada**. A navalha nasce na borda esquerda, o aluno a arrasta para a direita, a cunha abre para a esquerda. A bolinha da pílula fica à esquerda e é arrastada para a direita; ao soltar, a câmera faz um zoom para dentro da bolinha (`ch:cap`) e o site abre **direto na escolha de perfil** (`ch:go3`, sem capa nem nome). O título nasce letra por letra, em máscaras, com um corte fino de 1px. Crédito discreto no rodapé: "Site desenvolvido por Débora Augusta Alves Santos e por inteligência artificial (Claude, Anthropic)". Reduzir movimento: sem zoom, só fade.
- **Escolha de perfil** (`js/views-welcome.js`, `css/welcome.css`): palco de 100vw por personagem de corpo inteiro (`assets/personas/full/`), deslizar com o dedo, mouse ou setas. Um nome por vez; **bolinhas** (uma por perfil) acompanham o dedo e se enchem conforme o perfil passa. Enunciado "Escolha o seu perfil de editor" acima do bloco de texto, longe do personagem (no celular, no alto da tela, acima da cabeça). Botão de vidro **"Escolher"** grava o perfil; depois vem o nome (se ainda não houver) e a tela final. A barra de nomes com "Reset" foi retirada a pedido da autora.
- **Abertura, ajustes finais:** título maior e mais pesado (peso 800, letras sobem girando em cascata), sem a linha fina; "Arraste para iniciar" centralizado na pílula; durante o zoom na bolinha a escolha de perfil já aparece desfocada e ganha foco ao chegar.
- **Takes CD_BH_01–08:** recortados do curta "The Black Hole" (Phil & Olly) por `scripts/import-cd-bh.py`. O erro "tela preta + imagem quebrada" acontece quando a hospedagem não tem `assets/video`, `assets/takes` e `assets/img`: suba o pacote inteiro. Se um arquivo faltar, o site mostra "Vídeo indisponível".
- **Sem texto sublinhado:** links se distinguem por peso 600 e seta ↗ quando externos.
- **Design "vidro minimalista"** (definição em `DESIGN_DECISIONS.md`): botões e navegação são vidro, sem preenchimento colorido e sem troca de cor no hover.
- **Fontes de pesquisa na tela:** Museu (nome do site + link por parada), "Quem foi?", conceitos, "O que é edição?" e Guia mostram "Fonte: …" em fonte pequena; o que não tem origem verificada aparece como "texto do projeto". Fotos do Museu: "imagem da internet (fonte e licença não registradas)".
- **Limites honestos:** takes `CD_BH_01–08` ainda não estão no pacote (aguardando os arquivos da autora); o validador também aponta o pacote `NZ_*`; não testado em Safari/iOS reais nem com leitor de tela real.

## Rodada 8: celular e continuidade
- **Movimento:** só a preferência do site (Meu espaço → Movimento → Reduzido) desliga a abertura, os vídeos dos personagens e a coreografia da escolha. Se apenas o aparelho está em "reduzir movimento" (comum em celulares e no app), os efeitos continuam em versão suave (sem giros, zoom curto) e os vídeos tocam. `CH.motionOff()` em `js/core.js`.
- **Abertura:** pílula mais curta (texto centralizado ao lado da bolinha, conclui com 70% do curso); "O simulador de timeline" maior e entrando palavra por palavra; a escolha de perfil real carrega num iframe invisível e aparece desfocada atrás da bolinha enquanto a câmera entra, ganhando foco, sem trocar de tela no meio do movimento (`from-cap2`).
- **Escolha de perfil:** controlador de vidro no rodapé (cápsula acompanha o dedo, bolinhas enchem), vizinhos desfocam/esmaecem ao deslizar, "Escolher" recolhe o controlador em cápsula com o nome do perfil e segue. Margens de safe-area no alto e embaixo.
- Tela final: só "Começar a jornada".

## Rodada 9: robustez no celular
- **`lab.html#/escolher`** abre direto na escolha de perfil e não depende de `sessionStorage` (alguns visualizadores bloqueiam o armazenamento). A abertura navega para ela.
- Se a troca de página falhar ou demorar, aparece o link "Entrar" (e a navegação é tentada de novo); ao voltar ou retornar ao app (`pageshow`/`visibilitychange`) o zoom congelado é desfeito.
- A cópia invisível da escolha (iframe) só é usada em computador; no toque o zoom usa o círculo branco e a imagem desfocada (leve).
- `css/compat.css`: alternativas sem `color-mix()` para navegadores antigos. `lab.html` mostra "Não foi possível carregar" com botão se o app não montar.
