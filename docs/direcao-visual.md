# Direção visual: o que foi extraído das 9 referências

As nove imagens vieram do Pinterest e servem só como **direção de estilo**. Nada delas é copiado (logos, ilustrações, textos, rostos). Cores medidas por amostragem de pixels.

## O que cada referência mostra

| # | Referência | O que ela traz |
|---|---|---|
| 1 | "App identity becomes a living framework" | Fundo claro `#F2F2F2`. Bolhas de vidro com brilho como avatares e categorias. Botão "+" translúcido embaixo. Título grande, leve, em sans geométrica |
| 2 | App de podcast (itcroc) | Fundo quase preto `#1B1B1B`. Botão principal **lima** `#E9F344` em pílula. Cards-avatar em squircle com cor lisa (azul, laranja, roxo). **Barra inferior de vidro** em pílula, com o item ativo em círculo lima |
| 3 | App de saúde (veri) | **Auras de gradiente** (rosa, verde-menta, azul) dentro de cards arredondados. Telas escuras com números grandes. Cards em tamanhos diferentes, como mosaico |
| 4 | App de perfis (Adverse) | Perfil com **retrato em tela cheia** e painel de vidro escuro por cima (nome grande, números, ações). Botão com **gradiente pastel** (verde-água, pêssego, lilás). Faixa de avatares no topo. Barra de vidro com ícone ativo brilhando |
| 5 | App de moda (Bensa) | Foto como herói da tela, título grande sobreposto, carrossel de miniaturas redondas, controle segmentado de vidro |
| 6 | App de provador | Faixa de histórias, **tiles de estatística** coloridos (azul, grafite), cartão herói com foto recortada, botão de ação verde-lima |
| 7 | "Searching for freelancers" | **O mais próximo do nosso caso.** Pilha de cards de freelancer em lima `#ECFF56`, chips de informação em pílula, abas de detalhe (Responsabilidades, Experiência, Formação), painel de **filtros** com alternadores e faixa de valor, botão "Enviar mensagem" em lima |
| 8 | App de carteira | Home escura com saudação em dois tons ("Good morning!" em branco e cinza). Tiles de vidro com cantos muito arredondados. Barra de vidro com **botão central** destacado |
| 9 | "Let's Work Together" | Fundo claro, título enorme e leve com **desbotado em degradê** na segunda linha. Dois squircles sobrepostos (retrato escuro e silhueta de vidro) com ícone de troca no meio |

## Padrões que se repetem (o que vale extrair)

1. **Base quase preta** (`#0D0D0D` a `#1B1B1B`) com variante clara em off-white (`#F2F2F2`, `#F2F2E9`).
2. **Uma cor de ação viva**: lima `#E9F344` a `#ECFF56`, usada em botões principais, chips de destaque e estado ativo.
3. **Vidro fosco** em barra inferior, painéis sobre foto, botões de controle: fundo branco a 8–14%, blur, borda branca fina.
4. **Squircles grandes** (raio de 28 a 40) nos cards, avatares e botões.
5. **Foto como protagonista**: retrato em tela cheia, texto sobreposto, painel de vidro com as informações.
6. **Barra inferior em pílula flutuante** com um item central destacado.
7. **Títulos grandes, leves, com pouco espaço entre letras** e às vezes em dois tons.
8. **Auras e degradês suaves** como fundo de cards (verde-menta, rosa, azul, pêssego).
9. **Filtros** como sheet escuro com pílulas alternáveis e faixa de valor.

## Como isso se mistura com o Take One

Decisão do usuário: mistura das duas direções (base escura e Montserrat do Take One + o que as imagens trouxerem).

| Elemento | Take One hoje | Depois da mistura |
|---|---|---|
| Fundo | `#050505` | mantém; superfícies `#111111` a `#1B1B1B` |
| Cor da marca | laranja `#FC9335`, azul `#1915D4` | mantém nos degradês das telas de abertura e nos blobs |
| **Cor de ação** | botão branco com seta | **lima `#E9F344`** nos botões principais e no estado ativo (a confirmar) |
| Vidro | tab bar e pílulas | estende para painéis sobre foto, cards de job e controles |
| Cards | blob colorido | squircle grande, foto de capa quando houver, painel de vidro com as informações |
| Barra inferior | 4 abas em pílula de vidro | pílula de vidro com **botão central "+"** (criar projeto) |
| Tipografia | Montserrat | mantém; títulos maiores e mais leves, com segunda linha em cinza |
| Fundo de cards | cor lisa | **aura de degradê** suave (laranja, rosa, azul) nos cards de destaque |
| Filtros | chips soltos | sheet de filtros com pílulas e faixa de valor |

## Cuidados

- Contraste mínimo de 4,5:1 em texto sobre vidro e sobre lima (texto preto sobre lima passa).
- Estado nunca só por cor: lima sempre acompanhado de texto ou ícone.
- Respeitar "reduzir movimento" e "reduzir transparência".
- A mistura de laranja e lima precisa de equilíbrio: laranja fica nas aberturas e nos degradês, lima fica nas ações. Se parecer carregado, a lima vira a única cor de ação.

## O que foi aplicado

- **Cor de ação:** o laranja continua como cor das ações principais (botões, estado ativo, chips selecionados). A lima das referências **não** foi usada, por decisão do usuário.
- **Barra inferior:** pílula de vidro escuro com Início, Descobrir, botão central "+" (laranja), Cena, Projetos e Perfil. Fora da demo, só aparecem Descobrir, Matches e Perfil.
- **Cards:** squircles grandes com aura de degradê (`AuraCard`). Painel de vidro nas informações do cartão do deck.
- **Títulos:** grandes e leves, com a segunda linha em cinza (`Title`).
- **Controle segmentado de vidro** em Descobrir (Talentos e Projetos) e em Projetos.
- **Ícones:** desenhados em SVG no próprio app, sem biblioteca externa.

## Nova tese (primeira etapa, só na demo)

Início, Descobrir (Talentos e Projetos), Cena, Projetos abertos com funções em aberto, perfil com portfólio em primeiro lugar, disponibilidade em 4 estados e onboarding curto. A Cena usa **dados de exemplo** rotulados; nada nela é um evento, edital ou vaga real.

Não foi implementado: equipes completas, mapa, equipamentos, locações, estúdio de formação, observatório, pagamentos reais e as personas 3D do texto original.

---

## Atualização: redesign claro com vidro e azul elétrico

Substitui a mistura "base escura + laranja" descrita acima. As quatro novas referências (cartões de chat em balão com adesivos e barra preta, cartas em leque, busca de vidro sobre mosaico, blobs) e a decisão do usuário (sem laranja, branco primeiro, azul elétrico, mais vidro) mudaram:

| Elemento | Antes | Agora |
|---|---|---|
| Fundo | `#050505` | `#F6F4F1` com grade fina (`Screen`) |
| Cor de ação | laranja `#FC9335` | azul elétrico `#2F5BFF` (`colors.accent`) |
| Barra inferior | vidro escuro, 5 abas | pílula preta, 4 itens + "+" azul dentro da barra |
| Cartões | squircle com aura laranja | balões coloridos (`colors.bubbles`), foto como adesivo, canto superior esquerdo reto |
| Vidro | branco 8% sobre preto | branco 62% a 82% com blur, borda branca; sobre foto, branco 18% |
| Deck | carta única | leque de 3 cartas, foto de capa e painel de vidro |
| Ícones | glifos de texto | SVG de traço (`Icon.tsx`, 38 ícones) |
| Modo escuro | único | preparado em `palette.dark`, ainda não ligado |

Tokens em `src/theme.ts`: `colors`, `glass`, `shadow`, `gradients`, `auras`, `palette`. Análise de usabilidade em [analise-ux.md](analise-ux.md).
