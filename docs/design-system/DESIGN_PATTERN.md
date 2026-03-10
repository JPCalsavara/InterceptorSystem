# InterceptorSystem — Design Pattern

> **Source of truth** for all frontend components. Every page, feature, and shared component **MUST** follow these rules.

---

## 1. Color Palette

### Light Mode (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#e3f2fd` | Page backgrounds |
| `--bg-secondary` | `#bbdefb` | Secondary surface areas |
| `--bg-tertiary` | `#90caf9` | Hover highlights |
| `--surface-card` | `#f5faff` | Cards, panels, modals |
| `--surface-muted` | `#e1f5fe` | Subtle backgrounds |
| `--text-primary` | `#0d47a1` | Headings, main text |
| `--text-secondary` | `#1565c0` | Descriptions, labels |
| `--text-tertiary` | `#1976d2` | Placeholders, hints |
| `--primary-color` | `#2196f3` | CTA, active states, links |
| `--primary-dark` | `#1976d2` | Hover on primary |
| `--border-subtle` | `#bbdefb` | Card borders, dividers |
| `--border-strong` | `#90caf9` | Input borders, emphasis |
| `--input-bg` | `#ffffff` | Form field backgrounds |

### Dark Mode (`body.dark-mode`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0f1419` | Page backgrounds |
| `--surface-card` | `#1e2738` | Cards, panels |
| `--text-primary` | `#e6edf3` | Headings, main text |
| `--text-secondary` | `#8b949e` | Descriptions |
| `--primary-color` | `#58a6ff` | CTA, active states |
| `--primary-dark` | `#4a8fd8` | Hover on primary |
| `--border-subtle` | `#30363d` | Borders |
| `--input-bg` | `#0d1117` | Form fields |

### Status Colors (used in badges & kanban)

| Status | Border Color | Usage |
|--------|-------------|-------|
| Success | `#10b981` / `#059669` (dark) | CONFIRMADA, ATIVO |
| Warning | `#f59e0b` / `#d97706` (dark) | PENDENTE, FERIAS |
| Error | `#ef4444` / `#dc2626` (dark) | CANCELADA, DEMITIDO |
| Info | `#3b82f6` / `#2563eb` (dark) | SUBSTITUICAO |
| Neutral | `#9ca3af` / `#6b7280` (dark) | FINALIZADO, inactive |

> [!IMPORTANT]
> **NEVER** use raw hex in component styles. Always use `var(--token-name)`.

---

## 2. Typography

**Font:** Inter (Google Fonts)  
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Size Scale

| Token | Size | Use for |
|-------|------|---------|
| `--text-xs` | 12px | Captions, fine print |
| `--text-sm` | 14px | Labels, table cells, badges |
| `--text-base` | 16px | Body text, inputs |
| `--text-lg` | 18px | Card titles |
| `--text-xl` | 20px | Section subtitles |
| `--text-2xl` | 24px | Section titles |
| `--text-3xl` | 30px | Page titles |
| `--text-4xl` | 36px | Hero subtitles |
| `--text-5xl` | 48px | Hero titles |

### Weights

| Token | Weight | Use for |
|-------|--------|---------|
| `--fw-regular` | 400 | Body text |
| `--fw-medium` | 500 | Labels, nav links |
| `--fw-semibold` | 600 | Buttons, subtitles |
| `--fw-bold` | 700 | Section titles, card headings |
| `--fw-extrabold` | 800 | Page titles, hero headings |

### Rules
- **Page titles**: `--text-3xl` + `--fw-extrabold`
- **Section titles**: `--text-2xl` + `--fw-bold`
- **Card titles**: `--text-lg` + `--fw-bold`
- **Body text**: `--text-base` + `--fw-regular`
- **Labels**: `--text-sm` + `--fw-medium` + `color: var(--text-secondary)`
- **Responsive hero**: always use `clamp()` — e.g. `font-size: clamp(2rem, 5vw, 3.5rem)`

---

## 3. Icons

> [!CAUTION]
> **NO EMOJIS.** Every icon must be an inline SVG following these rules exactly.

### SVG Rules

| Rule | Value |
|------|-------|
| Format | Inline `<svg>` in Angular template |
| Style | **Outline/stroke only** — no filled shapes |
| Color | `stroke="currentColor"` — inherits CSS `color` |
| Fill | Always `fill="none"` |
| Stroke width | `1.5` (standard) or `2` (nav hamburger/close only) |
| ViewBox | `0 0 24 24` |
| Sizing | CSS `width: 1em; height: 1em` — scales with `font-size` |
| Max paths | 2–3 `<path>` elements max |
| Source | [Heroicons v2 Outline](https://heroicons.com) |

### Icon Template

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path stroke-linecap="round" stroke-linejoin="round" d="..." />
</svg>
```

### Icon Catalog

| Name | Context |
|------|---------|
| `shield-check` | Security, protection |
| `chart-bar` | Dashboard, analytics |
| `building-office` | Clientes |
| `document-text` | Contratos |
| `user-group` | Funcionários |
| `map-pin` | Postos, location |
| `calendar-days` | Diárias, schedules |
| `currency-dollar` | Financial |
| `bolt` | System product |
| `trophy` | Achievement |
| `banknotes` | Payroll |
| `clipboard-list` | Admin tasks |
| `map` | Consultoria |
| `adjustments` | Settings, config |
| `bars-3` | Mobile menu open |
| `x-mark` | Mobile menu close |
| `exclamation-triangle` | Warnings, errors |
| `check-circle` | Success states |
| `x-circle` | Failure, rejection |
| `arrow-trending-up` | Positive trends |
| `arrow-trending-down` | Negative trends |

### Color Rule

```css
.icon-container {
  color: var(--primary-color);  /* SVG inherits via currentColor */
  font-size: 1.5rem;            /* controls SVG size */
}
```

---

## 4. Buttons

### Variants

| Class | Background | Text | Border | Use for |
|-------|-----------|------|--------|---------|
| `.btn-primary` | `--primary-color` | white | none | Main CTA |
| `.btn-secondary` | `--bg-secondary` | `--text-primary` | `--border-strong` | Secondary actions |
| `.btn-outline` | transparent | `--primary-color` | `--primary-color` | Tertiary actions |
| `.btn-ghost` | transparent | `--text-secondary` | none | Subtle actions |
| `.btn-cta` | white | `--blue-700` | none | Hero CTA (on blue bg) |

### Sizes

| Class | Padding | Font |
|-------|---------|------|
| `.btn-sm` | `--space-1` / `--space-3` | `--text-xs` |
| `.btn-md` | `--space-2` / `--space-4` | `--text-sm` |
| `.btn-lg` | `--space-3` / `--space-6` | `--text-base` |

### Hover Behavior
- `translateY(-1px)` lift
- `box-shadow` glow
- Transition: `all 0.2s ease`
- `:disabled` → `opacity: 0.6`, no transform

---

## 5. Badges

| Class | Usage |
|-------|-------|
| `.badge.badge-success` | ATIVO, CONFIRMADA |
| `.badge.badge-warning` | PENDENTE, FÉRIAS |
| `.badge.badge-error` / `.badge-danger` | CANCELADA, DEMITIDO, FALTA |
| `.badge.badge-info` | SUBSTITUIÇÃO |
| `.badge.badge-neutral` | FINALIZADO |

Style: `border-radius: var(--radius-full)`, `font-size: var(--text-xs)`, `font-weight: var(--fw-semibold)`

---

## 6. Forms

| Element | Background | Border | Focus |
|---------|-----------|--------|-------|
| Inputs | `--input-bg` | `--border-color` | `--primary-color` + `box-shadow: 0 0 0 3px rgba(33,150,243,0.2)` |
| Labels | — | — | `--text-sm`, `--fw-medium`, `color: --text-secondary` |
| Error text | — | — | `--text-xs`, `color: var(--kanban-error-border)` |
| Disabled | `--surface-muted` | — | `opacity: 0.8` |

---

## 7. Spacing

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Icon gaps, inline padding |
| `--space-2` | 8px | Button padding, form gaps |
| `--space-3` | 12px | Small card padding |
| `--space-4` | 16px | Standard padding, margins |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Container padding |
| `--space-12` | 48px | Section spacing |
| `--space-16` | 64px | Large sections |
| `--space-20` | 80px | Hero padding |

---

## 8. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Small chips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Large cards, modals |
| `--radius-2xl` | 24px | Feature cards |
| `--radius-full` | 9999px | Badges, avatars |

---

## 9. Shadows

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-sm` | subtle | Table rows, inputs |
| `--shadow-md` | medium | Cards, dropdowns |
| `--shadow-lg` | strong | Modals, fixed nav |

---

## 10. Responsive

| Breakpoint | Variable | Target |
|------------|----------|--------|
| `$bp-xs` | 480px | Small phones |
| `$bp-sm` | 640px | Large phones |
| `$bp-md` | 768px | Tablets |
| `$bp-lg` | 1024px | Small desktops |
| `$bp-xl` | 1280px | Desktops |
| `$bp-2xl` | 1536px | Wide screens |

### Layout Rules
- **Sidebar**: 260px desktop → 80px (icon-only) at ≤ 768px
- **Grids**: 4-col → 2-col (tablet) → 1-col (mobile)
- **Typography**: use `clamp()` for h1/hero — never fixed px
- **Footer**: flex-row → flex-column at mobile
- **Nav**: full links desktop → hamburger overlay at ≤ 900px

---

## 11. Component Patterns

### Page Header
```html
<div class="page-header">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path stroke-linecap="round" stroke-linejoin="round" d="..." />
  </svg>
  <h1>Page Title</h1>
</div>
```
CSS: icon `color: var(--primary-color)`, h1 `--text-3xl` + `--fw-extrabold`

### Card
```html
<div class="card">
  <div class="card-header"><h3>Title</h3></div>
  <div class="card-body">...</div>
</div>
```
CSS: `background: var(--surface-card)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-sm)`

### Stat Tile
```html
<div class="stat-tile">
  <svg ...></svg>
  <span class="stat-value">15+</span>
  <span class="stat-label">Label</span>
</div>
```
CSS: value `--text-2xl` + `--fw-extrabold`, label `--text-sm` + `--text-secondary`

---

## 12. Do / Don't

| ✅ Do | ❌ Don't |
|-------|----------|
| Use `var(--token)` for all colors | Hardcode hex values in components |
| Use `var(--space-*)` for spacing | Use arbitrary `px` or `rem` values |
| Use `var(--text-*)` for font sizes | Use raw `font-size: 14px` |
| Use inline SVG with `stroke="currentColor"` | Use emojis (🛡️📊📍) |
| Use `var(--radius-*)` for corners | Use `border-radius: 12px` |
| Use `var(--shadow-*)` for elevation | Invent custom shadows per component |
| Use `var(--fw-*)` for font weights | Use `font-weight: 600` directly |
| Control icon size via parent `font-size` | Set `width/height` on `<svg>` directly |
| Use `.badge-success/warning/error` classes | Create custom badge styles per page |
| Use `.btn-primary/secondary/outline` classes | Create custom button styles per page |
| Test dark mode with every change | Assume light-only |
