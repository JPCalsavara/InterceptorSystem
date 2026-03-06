# Frontend Refactoring Plan

> Apply [DESIGN_PATTERN.md](./DESIGN_PATTERN.md) to every component. Each section = one context window prompt.

---

## Refactoring Scope

| # | Component | File | Lines | Emojis | Priority |
|---|----------|------|-------|--------|----------|
| 1 | Sidebar | `core/layout/sidebar.component.ts` | 134 | 6 | 🔴 High |
| 2 | Navbar | `core/layout/navbar.component.ts` | ~150 | 0 | 🟡 Med |
| 3 | Login | `pages/login/login.component.ts` | 371 | 0 | 🟡 Med |
| 4 | Cadastro | `pages/cadastro/cadastro.component.ts` | 567 | 0 | 🟡 Med |
| 5 | Esqueci Senha | `pages/esqueci-senha/esqueci-senha.component.ts` | 223 | 0 | 🟢 Low |
| 6 | Nova Senha | `pages/nova-senha/nova-senha.component.ts` | 260 | 0 | 🟢 Low |
| 7 | Verificar Email | `pages/verificar-email/verificar-email.component.ts` | 181 | 2 | 🟡 Med |
| 8 | Dashboard | `pages/dashboard/dashboard.component.ts` | 471 | 8 | 🔴 High |
| 9 | Perfil | `pages/perfil/perfil.component.ts` | 685 | 0 | 🟡 Med |
| 10 | Conta | `pages/conta/conta.component.ts` | 375 | 0 | 🟡 Med |
| 11 | Plano | `pages/plano/plano.component.ts` | 285 | 1 | 🟡 Med |
| 12 | Condomínios List | `features/condominios/condominios.component.ts` | 66 | 1 | 🟡 Med |
| 13 | Condomínio Form | `features/condominios/condominio-form/` | 221 | 4 | 🟡 Med |
| 14 | Condomínio Detail | `features/condominios/condominio-detail/` | 605 | 4 | 🔴 High |
| 15 | Condomínio Wizard | `features/condominios/condominio-wizard/` | 601 | 10 | 🔴 High |
| 16 | Condomínio List | `features/condominios/condominio-list/` | 78 | 0 | 🟢 Low |
| 17 | Contratos Parent | `features/contratos/contratos.component.ts` | 119 | 2 | 🟡 Med |
| 18 | Contrato Form | `features/contratos/contrato-form/` | 335 | 0 | 🟡 Med |
| 19 | Contrato Detail | `features/contratos/contrato-detail/` | 196 | 0 | 🟢 Low |
| 20 | Contrato List | `features/contratos/contrato-list/` | 216 | 0 | 🟢 Low |
| 21 | Funcionários Parent | `features/funcionarios/funcionarios.component.ts` | 66 | 1 | 🟡 Med |
| 22 | Funcionário Form | `features/funcionarios/funcionario-form/` | 226 | 0 | 🟡 Med |
| 23 | Funcionário Detail | `features/funcionarios/funcionario-detail/` | 387 | 0 | 🟡 Med |
| 24 | Funcionário List | `features/funcionarios/funcionario-list/` | 205 | 0 | 🟢 Low |
| 25 | Postos Parent | `features/postos/postos.component.ts` | 66 | 1 | 🟡 Med |
| 26 | Posto Form | `features/postos/posto-form/` | 200 | 0 | 🟡 Med |
| 27 | Posto Detail | `features/postos/posto-detail/` | 205 | 2 | 🟡 Med |
| 28 | Posto List | `features/postos/posto-list/` | 157 | 0 | 🟢 Low |
| 29 | Alocação Form | `features/alocacoes/alocacao-form/` | 232 | 0 | 🟡 Med |
| 30 | Alocação Batch | `features/alocacoes/alocacao-batch-form/` | 258 | 0 | 🟡 Med |
| 31 | Alocação Detail | `features/alocacoes/alocacao-detail/` | 158 | 0 | 🟢 Low |
| 32 | Alocação List | `features/alocacoes/alocacao-list/` | 558 | 0 | 🔴 High |
| 33 | Alocações View | `shared/components/alocacoes-view/` | 326 | 0 | 🟡 Med |
| 34 | Email Banner | `shared/components/email-verification-banner/` | 101 | 1 | 🟢 Low |

**Total: 34 components · ~45 emojis to replace**

---

## Execution Order (8 Batches)

Each batch = **one context window** with its own planning + execution prompt.

---

### Batch 1: Core Layout (Sidebar + Navbar)

**Files:**
- `core/layout/sidebar.component.ts` (134 lines, 6 emojis)
- `core/layout/navbar.component.ts` (~150 lines)
- `core/layout/app-shell.component.ts`

**Tasks:**
- [ ] Replace 6 sidebar emojis (📊🏢📄👥📍📅) with inline SVGs
- [ ] Change sidebar `icon` field from `string` emoji to inline SVG template approach
- [ ] Apply design tokens to navbar/sidebar styles
- [ ] Test sidebar collapse at ≤768px (icon-only mode with SVGs)
- [ ] Verify dark mode toggle

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor core/layout/sidebar.component.ts: replace 6 emoji icons (📊🏢📄👥📍📅) with inline SVGs from Heroicons v2 Outline (single-color, stroke="currentColor", stroke-width="1.5"). Also review navbar.component.ts and app-shell.component.ts for token compliance. All colors must use var(--token), all spacing var(--space-*). Verify ng build passes.
```

---

### Batch 2: Auth Pages (Login + Cadastro)

**Files:**
- `pages/login/login.component.ts` (371 lines)
- `pages/cadastro/cadastro.component.ts` (567 lines)

**Tasks:**
- [ ] Apply Inter font + typography tokens
- [ ] Apply form tokens (`--input-bg`, `--border-color`, focus ring)
- [ ] Apply button tokens (`.btn-primary`, `.btn-outline`)
- [ ] Replace any hardcoded hex/px with `var(--*)` tokens
- [ ] Responsive: ensure works at 375px mobile
- [ ] Verify dark mode

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor pages/login/login.component.ts and pages/cadastro/cadastro.component.ts to use the design system. Replace all hardcoded colors with var(--token), all spacing with var(--space-*), all font sizes with var(--text-*), all radii with var(--radius-*). Forms must use --input-bg, --border-color, focus ring. Buttons must use .btn-primary/.btn-outline classes. Test mobile at 375px. Verify ng build passes.
```

---

### Batch 3: Auth Pages (Esqueci Senha + Nova Senha + Verificar Email)

**Files:**
- `pages/esqueci-senha/esqueci-senha.component.ts` (223 lines)
- `pages/nova-senha/nova-senha.component.ts` (260 lines)
- `pages/verificar-email/verificar-email.component.ts` (181 lines, 2 emojis: ✓ ✕)

**Tasks:**
- [ ] Apply design tokens to all 3 pages
- [ ] Replace ✓ and ✕ characters with `check-circle` and `x-circle` SVGs
- [ ] Consistent form styling with Batch 2
- [ ] Responsive mobile layout

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor pages/esqueci-senha, pages/nova-senha, and pages/verificar-email to use the design system. Replace ✓ with check-circle SVG and ✕ with x-circle SVG (Heroicons v2, stroke="currentColor"). Apply all token rules. Verify ng build passes.
```

---

### Batch 4: Dashboard

**Files:**
- `pages/dashboard/dashboard.component.ts` (471 lines, 8 emojis)
- `pages/dashboard/` (3 files total)

**Tasks:**
- [ ] Replace 8 emojis (🏢👥📍📅📄💰📈📉) with SVGs
- [ ] Apply stat tile pattern from DESIGN_PATTERN
- [ ] Apply card pattern to financial summary
- [ ] Typography tokens for all headings/values
- [ ] Responsive grid: 4-col → 2-col → 1-col

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor pages/dashboard/dashboard.component.ts: replace 8 emojis (🏢👥📍📅📄💰📈📉) with Heroicons v2 SVGs. Apply stat-tile, card, and page-header patterns. All colors var(--token), spacing var(--space-*), typography var(--text-*). Responsive grid. Verify ng build passes.
```

---

### Batch 5: Account Pages (Perfil + Conta + Plano)

**Files:**
- `pages/perfil/perfil.component.ts` (685 lines)
- `pages/conta/conta.component.ts` (375 lines)
- `pages/plano/plano.component.ts` (285 lines, 1 emoji: ✓)

**Tasks:**
- [ ] Apply design tokens to all 3 pages
- [ ] Replace ✓ in plano with `check` SVG
- [ ] Form styling consistency
- [ ] Card patterns for plan cards
- [ ] Responsive layouts

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor pages/perfil, pages/conta, and pages/plano to use the design system. Replace ✓ in plano with check SVG. Apply form, card, button, and typography tokens. Responsive mobile layout. Verify ng build passes.
```

---

### Batch 6: Condomínios Feature

**Files:**
- `features/condominios/condominios.component.ts` (66 lines, 1 emoji)
- `features/condominios/condominio-list/` (78 lines)
- `features/condominios/condominio-form/` (221 lines, 4 emojis in error messages)
- `features/condominios/condominio-detail/` (605 lines, 4 emojis)
- `features/condominios/condominio-wizard/` (601 lines, 10 emojis)

**Tasks:**
- [ ] Replace 🏢 in parent component title with `building-office` SVG
- [ ] Replace 4 emojis in condominio-form error messages (⚠️❌) with SVGs or remove
- [ ] Replace 4 emojis in condominio-detail (📅⚠️🔄👤) with SVGs
- [ ] Replace 10 emojis in wizard (🏢📄👥⚠️📤✅❌) with SVGs / remove from console.log
- [ ] Apply tokens to all styling
- [ ] Detail page: card pattern + stat tiles
- [ ] Wizard: step indicator with SVG icons instead of emojis

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor all files under features/condominios/: replace all emojis with Heroicons v2 SVGs. condominios.component.ts (🏢→building-office), condominio-form (remove ⚠️❌ from error strings or replace with SVG), condominio-detail (📅⚠️🔄👤→calendar/exclamation/arrow-path/user SVGs), condominio-wizard (🏢📄👥→building/document/user-group SVGs in steps, remove emojis from console.log). Apply all design tokens. Verify ng build passes.
```

---

### Batch 7: Contratos + Funcionários + Postos Features

**Files:**
- `features/contratos/contratos.component.ts` (119 lines, 2 emojis)
- `features/contratos/contrato-form/` (335 lines)
- `features/contratos/contrato-detail/` (196 lines)
- `features/contratos/contrato-list/` (216 lines)
- `features/funcionarios/funcionarios.component.ts` (66 lines, 1 emoji)
- `features/funcionarios/funcionario-form/` (226 lines)
- `features/funcionarios/funcionario-detail/` (387 lines)
- `features/funcionarios/funcionario-list/` (205 lines)
- `features/postos/postos.component.ts` (66 lines, 1 emoji)
- `features/postos/posto-form/` (200 lines)
- `features/postos/posto-detail/` (205 lines, 2 emojis)
- `features/postos/posto-list/` (157 lines)

**Tasks:**
- [ ] Replace emojis: 📄💼 (contratos), 👥 (funcionarios), 📍 (postos), 📅🔄 (posto-detail)
- [ ] Apply design tokens to all list/form/detail components
- [ ] Consistent table styling across all lists
- [ ] Card + stat patterns on details
- [ ] Badge patterns for status fields

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor features/contratos (replace 📄💼 with SVGs), features/funcionarios (replace 👥), and features/postos (replace 📍📅🔄). Apply design tokens to all list, form, and detail components. Tables: header --bg-secondary, rows --surface-card, hover --hover-bg. Badges: use .badge-success/.badge-warning/.badge-error for status fields. Verify ng build passes.
```

---

### Batch 8: Alocações Feature + Shared Components

**Files:**
- `features/alocacoes/alocacao-list/` (558 lines)
- `features/alocacoes/alocacao-form/` (232 lines)
- `features/alocacoes/alocacao-batch-form/` (258 lines)
- `features/alocacoes/alocacao-detail/` (158 lines)
- `shared/components/alocacoes-view/` (326 lines)
- `shared/components/email-verification-banner/` (101 lines, 1 emoji: ⚠️)

**Tasks:**
- [ ] Replace ⚠️ in email-verification-banner with `exclamation-triangle` SVG
- [ ] Apply design tokens to alocação list (kanban, calendar, daily views)
- [ ] Apply badge tokens for alocação status
- [ ] Responsive kanban board
- [ ] Consistent card/table patterns

**Prompt:**
```
Read docs/design-system/DESIGN_PATTERN.md. Refactor features/alocacoes (all 4 sub-components) and shared/components (alocacoes-view, email-verification-banner). Replace ⚠️ in banner with exclamation-triangle SVG. Apply kanban status colors (--kanban-success/warning/error/info). Apply design tokens to all styling. Badge classes for TipoAlocacao and StatusAlocacao. Verify ng build passes.
```

---

## Final Verification

After all 8 batches:

- [ ] `ng build --configuration=production` passes
- [ ] Browser test at 375px / 768px / 1280px
- [ ] Dark mode toggle works on every page
- [ ] Zero emojis remaining: `grep -rnP '[\x{1F300}-\x{1FAD6}]' frontend/src/app/`
- [ ] All styles use `var(--token)` — no hardcoded hex
