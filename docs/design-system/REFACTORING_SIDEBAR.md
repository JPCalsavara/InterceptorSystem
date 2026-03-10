# Refactoring: Sidebar Component

> **Source:** [DESIGN_PATTERN.md](./DESIGN_PATTERN.md)  
> **File:** `frontend/src/app/core/layout/sidebar.component.ts` (134 lines)

---

## Current Problems

| Issue | Line(s) | Details |
|-------|---------|---------|
| Emoji icons | 126–131 | `📊 🏢 📄 👥 📍 📅` as plain strings |
| Template renders emoji via `{{ item.icon }}` | 25 | Cannot render SVG through interpolation |
| Hardcoded spacing | 43, 52, 58–59, 79, 85, 109, 118 | `1.5rem`, `0.5rem`, `1rem`, `0.75rem` instead of `var(--space-*)` |
| Hardcoded radius | 60 | `8px` instead of `var(--radius-md)` |
| Hardcoded font-weight | 63 | `500` instead of `var(--fw-medium)` |
| Hardcoded font-size | 79, 85 | `1.5rem`, `0.9375rem` instead of `var(--text-*)` |

---

## Proposed Changes

### 1. Change `NavItem` interface

The `icon` field currently holds an emoji string. Since inline SVGs cannot be rendered via Angular interpolation `{{ }}`, the approach is to store the **SVG path `d` attribute** in the data and render a shared `<svg>` wrapper in the template.

```diff
 interface NavItem {
   label: string;
   route: string;
-  icon: string;
+  svgPath: string;
 }
```

### 2. Replace emoji data with Heroicons SVG paths

| Label | Emoji | Heroicons Icon | SVG `d` path |
|-------|-------|----------------|-------------|
| Resumo | 📊 | `chart-bar` | `M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z` |
| Clientes | 🏢 | `building-office` | `M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z` |
| Contratos | 📄 | `document-text` | `M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z` |
| Funcionários | 👥 | `user-group` | `M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z` |
| Postos | 📍 | `map-pin` | `M15 10.5a3 3 0 11-6 0 3 3 0 016 0z` + `M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z` |
| Diárias | 📅 | `calendar-days` | `M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5` |

### 3. Update template

Replace interpolation with a shared SVG wrapper:

```diff
-<span class="icon">{{ item.icon }}</span>
+<span class="icon">
+  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
+    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.svgPath" />
+  </svg>
+</span>
```

> **Note:** `map-pin` has 2 paths. Handle with a second optional `svgPath2` field or use a combined single path.

### 4. Replace hardcoded CSS values with tokens

```diff
 .sidebar {
-  padding: 1.5rem 1rem;
+  padding: var(--space-6) var(--space-4);
 }

 .nav {
-  gap: 0.5rem;
+  gap: var(--space-2);
 }

 .nav-item {
-  gap: 1rem;
-  padding: 0.75rem 1rem;
-  border-radius: 8px;
-  font-weight: 500;
+  gap: var(--space-4);
+  padding: var(--space-3) var(--space-4);
+  border-radius: var(--radius-md);
+  font-weight: var(--fw-medium);
 }

 .icon {
-  font-size: 1.5rem;
+  font-size: var(--text-2xl);
+  color: currentColor;
 }

+.icon svg {
+  width: 1em;
+  height: 1em;
+}

 .label {
-  font-size: 0.9375rem;
+  font-size: var(--text-sm);
 }

 @media (max-width: 768px) {
   .sidebar {
-    padding: 1rem 0.5rem;
+    padding: var(--space-4) var(--space-2);
   }
   .nav-item {
-    padding: 0.75rem;
+    padding: var(--space-3);
   }
 }
```

---

## Execution Prompt

Copy-paste this into a **new context window** to execute:

```
## Persona
You are a senior UX/UI designer and frontend developer.

## Context
Read docs/design-system/DESIGN_PATTERN.md for the full design system rules.
Read docs/design-system/REFACTORING_SIDEBAR.md for the specific plan.

## Task
Refactor frontend/src/app/core/layout/sidebar.component.ts:

1. Change NavItem interface: rename `icon: string` to `svgPath: string`, add optional `svgPath2?: string` for icons with 2 paths (map-pin).
2. Replace 6 emoji strings in navItems array with Heroicons v2 Outline SVG `d` paths:
   - 📊 → chart-bar
   - 🏢 → building-office
   - 📄 → document-text
   - 👥 → user-group
   - 📍 → map-pin (2 paths)
   - 📅 → calendar-days
3. Update template: replace `{{ item.icon }}` with an inline `<svg>` using `[attr.d]="item.svgPath"`. For map-pin, render a second `<path>` if `item.svgPath2` exists.
4. Replace all hardcoded CSS values with design tokens:
   - padding → var(--space-*)
   - gap → var(--space-*)
   - border-radius → var(--radius-md)
   - font-weight → var(--fw-medium)
   - font-size → var(--text-*)
5. Add `.icon svg { width: 1em; height: 1em; }` rule so SVGs scale with font-size.
6. Run `ng build --configuration=production` to verify zero errors.

## Rules
- SVGs: stroke="currentColor", fill="none", stroke-width="1.5", viewBox="0 0 24 24"
- NO emojis anywhere
- All colors via var(--token)
- All spacing via var(--space-*)
```

---

## Checklist

- [ ] `NavItem.icon` → `NavItem.svgPath` + `svgPath2?`
- [ ] 6 emoji strings → SVG `d` paths
- [ ] Template `{{ item.icon }}` → `<svg>` with `[attr.d]`
- [ ] All hardcoded spacing → `var(--space-*)`
- [ ] All hardcoded radius → `var(--radius-*)`
- [ ] All hardcoded font-size → `var(--text-*)`
- [ ] All hardcoded font-weight → `var(--fw-*)`
- [ ] SVG sizing rule `.icon svg { width: 1em; height: 1em; }`
- [ ] `ng build` passes
- [ ] Dark mode verified
- [ ] Mobile collapse (80px) verified with SVG icons
