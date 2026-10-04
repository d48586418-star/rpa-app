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

## Rodada 5: abertura "embalagem de chocolate" e escolha por deslizar
- **Abertura em 3 cenas** (`index.html`, `css/abertura.css`, `js/abertura.js`; composição, cores e proporções medidas das 3 imagens de referência, fundo #960000, cunha #6e0000): (1) navalha branca na borda direita com "Arraste para cortar e abrir"; (2) o aluno arrasta a navalha para a esquerda: a cunha se abre atrás dela (11° em cima, 8° embaixo, como na imagem 2) e, passando de 55% do curso, as duas folhas giram em torno do ápice e saem; (3) "O simulador de timeline", "Cortando"/"Histórias" (Helvetica Neue Bold, tracking −.07em, nascem de máscaras de linha) e a pílula "Arraste para iniciar", cuja bolinha também se arrasta da direita para a esquerda e leva ao laboratório. Teclado: navalha e pílula são `role="slider"` (Enter/←). Reduzir Movimento: sem giros. Só `transform/opacity/clip-path`. Teste: `node tests/capa-toque.js`.
- **Escolha de perfil** (`js/views-welcome.js`, `css/welcome.css`): um palco de 100vw por personagem, com o vídeo de **corpo inteiro** (`assets/personas/full/<id>.webm|mp4`, sem áudio; altura = tela, então cabeça e pés nunca são cortados) e a cor de fundo medida no próprio vídeo. Deslizar com o dedo, arrastar com o mouse, setas ←/→ ou pontos; só o vídeo visível toca e o laço de 10 s usa dois vídeos com fusão de 0,8 s perto do fim. Texto à esquerda no desktop; no celular o personagem ocupa ~72% da altura. Para trocar um personagem, substitua os arquivos em `assets/personas/full/`.
