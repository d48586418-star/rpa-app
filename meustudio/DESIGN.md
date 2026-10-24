# MEU STUDIO v4 — Design System

Documento gerado a partir da análise das imagens de referência fornecidas.
Não alterar manualmente — serve de fonte de verdade para o bloco `:root` do `index.html`.

---

## Análise por referência

### REF-A — Task management (sidebar preta + amarelo)
Fonte de inspiração principal para MEU STUDIO.

| Token | Valor |
|---|---|
| Sidebar background | `#111111` |
| Sidebar texto | `rgba(255,255,255,0.70)` |
| Sidebar activo bg | `#FFFFFF` (no original) → mantemos `#E8C000` |
| Accent (progress bars, calendário) | `#FFBB00` → ajustado para `#E8C000` |
| Card background | `#FFFFFF` |
| Card radius | `12px` |
| Botão CTA radius | `8px` |
| Texto primário | `#111111` |
| Texto secundário | `#8E8E93` |
| Input background | `#F5F5F5` |

### REF-B — Emitly dashboard (sage green)
Referência para cards, radius e espaçamento.

| Token | Valor |
|---|---|
| App background | `#FFFFFF` |
| Sidebar border | `#E8E8E8` |
| Card radius | `12–14px` → `12px` |
| Border geral | `#E5E7EB` |
| Texto secundário | `#6B7280` |
| Event card amarelo | `#FFFAC0` |
| Event card rosa | `#FCEEF5` |
| Chart accent | `#F07060` |

### REF-C — Balloon file manager (blue-accented)
Referência para page background e sidebar hover.

| Token | Valor |
|---|---|
| Page background | `#EEF2FF` → simplificado para `#F5F5FA` |
| Sidebar hover | `#F5F5F7` |
| CTA button | `#4361EE` |
| Texto primário | `#1A1A2E` |

### REF-D — Taskera (dark sidebar + status badges)
Referência principal para paleta de status.

| Token | Valor |
|---|---|
| Sidebar dark | `#1B2037` |
| Status Completo | `#22C55E` bg `#DCFCE7` |
| Status Em Progresso | `#F59E0B` bg `#FEF3C7` |
| Status Pendente | `#6366F1` bg `#EEF2FF` |
| Status Atrasado | `#EF4444` bg `#FEE2E2` |
| Badge radius | `4–6px` |
| Table header bg | `#F1F3F5` |
| Border | `#E2E8F0` |

### REF-E — Portfolio macOS (frosted glass)
Referência para painéis com profundidade e radius generoso.

| Token | Valor |
|---|---|
| Panel radius | `12–16px` |
| Panel bg (vidro) | `rgba(255,255,255,0.85)` |
| Background ambiente | `#7EC8E3` (não adoptado) |

---

## Síntese de decisões

- **Accent**: mantém `#E8C000` (amarelo Débora, validado por REF-A)
- **Sidebar**: `#111111` + activo `#E8C000` texto `#111111` (identidade editorial)
- **Cards**: brancos com `box-shadow` leve (REF-A) e `border-radius: 12px` (REF-B)
- **Page background**: `#F5F5FA` (neutro ligeiramente lavanda, evita branco puro — REF-C)
- **Status badges**: verde/âmbar/vermelho/índigo — semântica de projetos (REF-D)
- **Tipografia**: Inter (já presente), escala em `rem`
- **Dark mode**: superfícies escuras `#0D0D0D` / `#1A1A1A`, accent mantém-se `#E8C000`

---

## Bloco `:root` — copiar para `index.html`

```css
:root {
  /* ── Marca ─────────────────────────────────── */
  --accent:             #E8C000;
  --accent-hover:       #D4AE00;
  --accent-text:        #111111;

  /* ── Superfícies ───────────────────────────── */
  --bg-page:            #F5F5FA;
  --bg-card:            #FFFFFF;
  --bg-input:           #F5F5F7;
  --bg-table-header:    #F1F3F5;

  /* ── Sidebar ───────────────────────────────── */
  --sidebar-bg:         #111111;
  --sidebar-text:       rgba(255,255,255,0.70);
  --sidebar-text-hover: #FFFFFF;
  --sidebar-active-bg:  #E8C000;
  --sidebar-active-text:#111111;

  /* ── Texto ─────────────────────────────────── */
  --text-primary:       #111111;
  --text-secondary:     #6B7280;
  --text-muted:         #9CA3AF;

  /* ── Bordas ────────────────────────────────── */
  --border:             #E5E7EB;
  --border-focus:       #E8C000;

  /* ── Status ────────────────────────────────── */
  --status-ok:          #22C55E;
  --status-ok-bg:       #DCFCE7;
  --status-warn:        #F59E0B;
  --status-warn-bg:     #FEF3C7;
  --status-error:       #EF4444;
  --status-error-bg:    #FEE2E2;
  --status-info:        #6366F1;
  --status-info-bg:     #EEF2FF;

  /* ── Sombras ───────────────────────────────── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,.10);
  --shadow-lg:  0 8px 24px rgba(0,0,0,.12);

  /* ── Raios ─────────────────────────────────── */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-pill:9999px;

  /* ── Tipografia ────────────────────────────── */
  --font:       'Inter', system-ui, -apple-system, sans-serif;
  --text-xs:    0.75rem;   /* 12px */
  --text-sm:    0.875rem;  /* 14px */
  --text-base:  1rem;      /* 16px */
  --text-lg:    1.125rem;  /* 18px */
  --text-xl:    1.25rem;   /* 20px */
  --text-2xl:   1.5rem;    /* 24px */
  --text-3xl:   1.875rem;  /* 30px */

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

  /* ── Transição ─────────────────────────────── */
  --transition: 150ms ease;
}

/* ── Dark mode ─────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-page:          #0D0D0D;
    --bg-card:          #1A1A1A;
    --bg-input:         #242424;
    --bg-table-header:  #1E1E1E;
    --text-primary:     #F5F5F5;
    --text-secondary:   #9CA3AF;
    --text-muted:       #6B7280;
    --border:           #2D2D2D;
    --border-focus:     #E8C000;
    --shadow-sm:  0 1px 3px rgba(0,0,0,.30);
    --shadow-md:  0 4px 12px rgba(0,0,0,.40);
    --shadow-lg:  0 8px 24px rgba(0,0,0,.50);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg-page:          #0D0D0D;
  --bg-card:          #1A1A1A;
  --bg-input:         #242424;
  --bg-table-header:  #1E1E1E;
  --text-primary:     #F5F5F5;
  --text-secondary:   #9CA3AF;
  --text-muted:       #6B7280;
  --border:           #2D2D2D;
  --border-focus:     #E8C000;
  --shadow-sm:  0 1px 3px rgba(0,0,0,.30);
  --shadow-md:  0 4px 12px rgba(0,0,0,.40);
  --shadow-lg:  0 8px 24px rgba(0,0,0,.50);
  color-scheme: dark;
}
```
