# MEU STUDIO v4 — Design System

Gerado a partir da análise pixel-a-pixel das 6 imagens de referência (pasta `./referencias/`).
Fonte de verdade para o bloco `:root` do `index.html`. Não alterar manualmente.

---

## Análise das 6 referências

### REF-A "Céu macOS"
Fundo de céu com nuvens (não copiado como imagem). Perfil com **foto redonda** + bio curta + "mais sobre mim". Grade de ícones de apps. Widgets à direita. Dock embaixo.

| Elemento | Valor amostrado |
|---|---|
| Foto de perfil | redonda, sombra suave |
| Grade de apps | ícones com legenda abaixo, espaçamento uniforme |
| Widget lateral | card branco com raio 14px |
| Fonte | sans-serif geométrica, peso 400–700 |

### REF-B "Balloon"
Gerenciador de arquivos claro. Sidebar de pastas com hierarquia. Faixa "Quick Access" com cards de ícone colorido. Tabela "Recent" com busca. Azul como cor de destaque de links e ícones ativos.

| Elemento | Valor amostrado |
|---|---|
| Page background | `#F7F7F7` |
| Sidebar background | `#FFFFFF` |
| Sidebar border | `#E8E8E8` |
| Card Quick Access | `#FFFFFF`, raio `12px`, sombra leve |
| Azul destaque | `#2E7CF6` |
| Texto tabela header | `#8A8A8A`, `text-transform: uppercase`, `font-size: 12px` |
| Border tabela | `#EBEBEB` |

### REF-C "Tino"
Dashboard amarelo/preto. Saudação grande no topo. Cards de projeto com barra de progresso — **um branco, um preto** (para destacar projeto principal). Faixa semanal de atividades. Botão preto "+ Add task". Linha do tempo do dia.

| Elemento | Valor amostrado |
|---|---|
| Saudação | `font-size: 28–32px`, `font-weight: 700` |
| Card branco | `#FFFFFF`, raio `16px`, sombra suave |
| Card escuro (destaque) | `#111111`, texto `#FFFFFF` |
| Barra de progresso | altura `6px`, raio `3px`, bg `#E8E8E8`, fill `#111111` (card branco) / `#E8C000` (card escuro) |
| Botão "+ Add" | `#111111`, texto `#FFFFFF`, raio `8px` |
| Faixa semanal | fundo `#F5F5F0`, células com raio `8px` |

### REF-D "Emitly" — CASCA PRINCIPAL
Dashboard creme/verde. **Sidebar clara** com logo, item ativo em **pílula verde-limão**. Botão primário verde-escuro. Faixa de KPIs com selos de variação (▲▼). Gráfico de barras com **uma barra laranja** destacada e linha de média pontilhada. Agenda com cards pastel (amarelo, rosa). **Botão flutuante de chat verde-escuro** no canto inferior direito.

| Elemento | Valor amostrado |
|---|---|
| Page background | `#F4F4EF` |
| Sidebar background | `#FAFAF8` (branco-creme) |
| Sidebar border | `#E8E8E1` |
| Item ativo — pílula | bg `#CFE88B`, texto `#1B2A26` |
| Item inativo — texto | `#4A5568`, hover bg `#F0F0EB` |
| Botão primário | bg `#1F4D45`, texto `#FFFFFF`, raio `10px` |
| Botão primário hover | `#17403A` |
| KPI card | bg `#FFFFFF`, raio `16px`, sombra `0 2px 8px rgba(0,0,0,.06)` |
| Selo positivo (▲) | texto `#22C55E`, bg `#DCFCE7` |
| Selo negativo (▼) | texto `#EF4444`, bg `#FEE2E2` |
| Barra padrão no gráfico | `#CFE88B` |
| Barra destaque laranja | `#F07060` |
| Linha de média | `#9CA3AF` tracejada |
| Card evento amarelo | bg `#FFF7C0`, raio `10px` |
| Card evento rosa | bg `#F5D5F0`, raio `10px` |
| Botão chat flutuante | bg `#1F4D45`, ícone `#FFFFFF`, tamanho `56px`, raio `50%` |
| Texto primário | `#1B2A26` |
| Texto secundário | `#6B7280` |
| Borda geral | `#E8E8E1` |
| Card background | `#FFFFFF` / `#FBFBF8` |

### REF-E "Apple Business"
Layout mestre-detalhe em 3 colunas (menu lateral | lista com busca | painel de detalhe com abas). Visual muito limpo, flat, sem sombras visíveis. Tipografia de sistema (SF Pro appearance). Abas com sublinhado escuro no item ativo.

| Elemento | Valor amostrado |
|---|---|
| Sidebar (1ª coluna) | `#F5F5F7` |
| Painel lista (2ª coluna) | `#FFFFFF` com divisória `#E8E8ED` |
| Painel detalhe (3ª coluna) | `#FFFFFF` |
| Item ativo na lista | bg `#E8E8ED`, raio `8px` |
| Tab ativa (sublinhado) | border-bottom `2px solid #1D1D1F` |
| Texto primário | `#1D1D1F` |
| Texto secundário | `#6E6E73` |
| Input de busca | raio `8px`, bg `#F5F5F7` |
| Botão destrutivo | `#FF3B30` |
| Divisórias | hairline `1px solid #E8E8ED` |

### REF-F "Taskera"
Tabela de projeto agrupada por marcos. Pílulas coloridas de status e prioridade. Abas internas (Overview, Milestones & Tasks, Financials…). Sidebar azul-marinho.

| Elemento | Valor amostrado |
|---|---|
| Sidebar dark | `#1B2037` |
| Status Concluído | texto `#22C55E`, bg `#DCFCE7` |
| Status Em andamento | texto `#F59E0B`, bg `#FEF3C7` |
| Status Pendente | texto `#6366F1`, bg `#EEF2FF` |
| Status Atrasado | texto `#EF4444`, bg `#FEE2E2` |
| Prioridade Baixa | texto `#22C55E`, bg `#DCFCE7` |
| Prioridade Média | texto `#F59E0B`, bg `#FEF3C7` |
| Prioridade Alta | texto `#EF4444`, bg `#FEE2E2` |
| Badge radius | `6px` |
| Table header bg | `#F1F3F5` |
| Table border | `#E2E8F0` |
| Aba ativa | bg `#FFFFFF`, border-bottom `2px solid #1B2037` |

---

## Decisões de síntese

| Decisão | Justificativa |
|---|---|
| Casca principal = REF-D Emitly | Único dashboard de gestão profissional entre as 6; sidebar clara, KPIs e calendário combinam com o fluxo de carreira |
| Fundo `#F4F4EF` (creme) | Sampled de REF-D; evita branco puro, cria personalidade editorial |
| Pílula activa `#CFE88B` | Cor de marca de REF-D; aprovada no SPEC 2.3 |
| Verde-escuro `#1F4D45` | Botões primários e ícones ativos (REF-D) |
| Laranja `#F07060` | Barra de destaque do gráfico (REF-D); único acento quente |
| Layout mestre-detalhe (REF-E) | Para Diagnóstico, Estratégia, Posicionamento, Conteúdo, Assistente IA |
| Status badges (REF-F) | Semântica clara de projetos: verde/âmbar/azul/vermelho |
| Card escuro `#111111` (REF-C) | Um projeto destacado na Início, como no Tino |
| Saudação grande 28–32px (REF-C) | Início com personalidade; peso 700 |
| Acesso rápido em cards de ícone (REF-B) | Navegação visual sem abas extras |
| Sem dark mode | SPEC não menciona; complexidade desnecessária agora |

---

## Tabela: elemento da imagem → onde foi aplicado no MEU STUDIO

| Elemento da referência | REF | Aplicado em |
|---|---|---|
| Foto redonda + bio curta + "mais sobre mim" | REF-A | Início > card de perfil; tela Perfil |
| Grade de ícones com legenda | REF-A | Início > Acesso rápido (links rápidos para abas) |
| Widget lateral em card branco | REF-A | Início > KPI cards laterais |
| Sidebar de pastas hierárquica | REF-B | Sidebar do app com grupos de abas |
| "Quick access" com cards de ícone colorido | REF-B | Início > Acesso rápido; Oportunidades, Notas, Aprendizado |
| Tabela "Recent" com busca | REF-B | Oportunidades > tabela; Aprendizado > tabela |
| Azul de destaque `#2E7CF6` | REF-B | *Não adoptado* — substituído pelo verde-escuro `#1F4D45` para coerência |
| Saudação grande 28px+ peso 700 | REF-C | Início > "Olá, Débora! Você tem N tarefas hoje" |
| Card escuro `#111111` com texto branco | REF-C | Início > card do projeto principal |
| Barra de progresso fina (6px) | REF-C | Início > cards de projeto; Projetos > lista |
| Faixa semanal de atividades | REF-C | Calendário > faixa de dias com pontos de evento |
| Botão preto "+ Add task" | REF-C | Adaptado para "+ Adicionar" em verde-escuro `#1F4D45` |
| Sidebar clara com item ativo em pílula | REF-D | Sidebar de todas as telas |
| Botão primário verde-escuro | REF-D | Todos os CTAs principais do app |
| KPIs com selos de variação ▲▼ | REF-D | Início > faixa de KPIs; Financeiro > topo |
| Gráfico de barras com barra laranja destacada | REF-D | Financeiro > gráfico mensal |
| Linha de média pontilhada | REF-D | Financeiro > gráfico |
| Cards pastel de agenda (amarelo, rosa) | REF-D | Calendário > eventos; Início > próximos eventos |
| Botão flutuante de chat no canto inf. direito | REF-D | Assistente IA em todas as telas |
| Fundo creme `#F4F4EF` | REF-D | Page background de todas as telas |
| Layout 3 colunas mestre-detalhe | REF-E | Diagnóstico, Estratégia, Posicionamento, Conteúdo, Assistente IA |
| Abas com sublinhado no item ativo | REF-E | Detalhe de projetos, perfil, assistente IA |
| Input de busca arredondado | REF-E | Barra de busca no topo; listas com filtro |
| Visual flat sem sombras | REF-E | *Não adoptado integralmente* — mantidas sombras suaves (REF-D) para hierarquia |
| Tabela agrupada por marcos | REF-F | Projetos > visualização de tarefas |
| Pílulas de status coloridas | REF-F | Projetos, Oportunidades, Checklist |
| Abas internas (Overview, Tasks…) | REF-F | Projetos > abas internas |
| Sidebar azul-marinho `#1B2037` | REF-F | *Não adoptado* — sidebar clara de REF-D é mais suave para uso prolongado |

---

## Bloco `:root` — copiar para `index.html` (sem dark mode)

```css
:root {
  /* ── Marca ─────────────────────────────────── */
  --primary:            #1F4D45;
  --primary-hover:      #17403A;
  --primary-text:       #FFFFFF;
  --accent-pill:        #CFE88B;
  --accent-pill-text:   #1B2A26;
  --accent-warm:        #F07060;

  /* ── Superfícies ───────────────────────────── */
  --bg-page:            #F4F4EF;
  --bg-card:            #FFFFFF;
  --bg-card-alt:        #FBFBF8;
  --bg-card-dark:       #111111;
  --bg-input:           #F5F5F7;
  --bg-table-header:    #F1F3F5;
  --bg-sidebar:         #FAFAF8;
  --bg-sidebar-hover:   #F0F0EB;

  /* ── Texto ─────────────────────────────────── */
  --text-primary:       #1B2A26;
  --text-secondary:     #6B7280;
  --text-muted:         #9CA3AF;
  --text-on-dark:       #FFFFFF;
  --text-on-accent:     #1B2A26;

  /* ── Bordas ────────────────────────────────── */
  --border:             #E8E8E1;
  --border-focus:       #1F4D45;
  --border-table:       #E2E8F0;
  --divider:            #E8E8ED;

  /* ── Status (REF-F Taskera) ─────────────────── */
  --status-ok:          #22C55E;
  --status-ok-bg:       #DCFCE7;
  --status-warn:        #F59E0B;
  --status-warn-bg:     #FEF3C7;
  --status-error:       #EF4444;
  --status-error-bg:    #FEE2E2;
  --status-info:        #6366F1;
  --status-info-bg:     #EEF2FF;

  /* ── Eventos pastel (REF-D Emitly) ──────────── */
  --event-yellow:       #FFF7C0;
  --event-pink:         #F5D5F0;

  /* ── Sombras ───────────────────────────────── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:  0 2px 8px rgba(0,0,0,.08);
  --shadow-lg:  0 4px 16px rgba(0,0,0,.10);

  /* ── Raios ─────────────────────────────────── */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --radius-pill:9999px;

  /* ── Tipografia (Inter; fallback sistema) ───── */
  --font:       'Inter', system-ui, -apple-system, sans-serif;
  --text-xs:    0.75rem;   /* 12px */
  --text-sm:    0.875rem;  /* 14px */
  --text-base:  1rem;      /* 16px */
  --text-lg:    1.125rem;  /* 18px */
  --text-xl:    1.25rem;   /* 20px */
  --text-2xl:   1.5rem;    /* 24px */
  --text-3xl:   1.875rem;  /* 30px — títulos de página */

  /* ── Espaçamentos ──────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ── Sidebar ───────────────────────────────── */
  --sidebar-width:      240px;
  --sidebar-bg:         var(--bg-sidebar);
  --sidebar-border:     var(--border);
  --sidebar-text:       #4A5568;
  --sidebar-text-hover: var(--text-primary);
  --sidebar-active-bg:  var(--accent-pill);
  --sidebar-active-text:var(--accent-pill-text);

  /* ── Transição ─────────────────────────────── */
  --transition: 150ms ease;

  /* ── Chat flutuante (REF-D) ─────────────────── */
  --fab-bg:    var(--primary);
  --fab-size:  56px;
}
```
