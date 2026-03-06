# Responsive Design Pattern

Design guide for mobile responsiveness across all pages of the InterceptorSystem frontend.

---

## Table of Contents

1. [Current State Audit](#current-state-audit)
2. [Breakpoint System](#breakpoint-system)
3. [Using Responsive Mixins](#using-responsive-mixins)
4. [Layout Patterns](#layout-patterns)
5. [Page-by-Page Audit](#page-by-page-audit)
6. [Anti-Patterns](#anti-patterns)
7. [Migration Guide](#migration-guide)

---

## Current State Audit

### Summary

| Page              | Responsive? | Method           | Breakpoints Used     | Gaps                              |
| ----------------- | ----------- | ---------------- | -------------------- | --------------------------------- |
| `dashboard`       | Partial     | Separate `.scss` | 1024px, 768px, 640px | Sidebar not mobile-adapted        |
| `landing`         | Good        | Inline styles    | 1024px, 900px, 600px | Inconsistent with other pages     |
| `login`           | Intrinsic   | Inline styles    | None needed          | OK                                |
| `cadastro`        | Partial     | Inline styles    | 900px                | Missing 768px layout              |
| `perfil`          | Partial     | Inline styles    | 768px                | No xs/touch target adjustments    |
| `conta`           | Partial     | Inline styles    | 768px                | Same as perfil                    |
| `plano`           | Partial     | Inline styles    | 768px                | Table not horizontally scrollable |
| `esqueci-senha`   | Intrinsic   | Inline styles    | None needed          | OK                                |
| `nova-senha`      | Intrinsic   | Inline styles    | None needed          | OK                                |
| `verificar-email` | Intrinsic   | Inline styles    | None needed          | OK                                |

### Critical Issues Found

1. **`_responsive.scss` was dead code** — the file existed but was never imported by `index.scss` or any component. All media queries were raw hardcoded pixels. **Fixed:** file is now imported and enhanced.

2. **Inconsistent breakpoints** — 7 different pixel values used across the codebase with no standard:

   ```
   Before: 480 / 600 / 640 / 768 / 900 / 1024 / 1280 / 1400px (scattered)
   After:  standardized to named breakpoints via mixins
   ```

3. **Inline styles in `.ts` files** — 9 of 10 pages embed CSS as plain strings inside the component `styles: [...]` array. SCSS mixins cannot be used here; only raw CSS works.

4. **Plans table at 768px** — `.plans-table` has no horizontal scroll, causing overflow on small screens.

5. **No `min-width: 44px / min-height: 44px` on touch targets** — buttons and links on mobile don't meet WCAG 2.5.5 (Target Size).

---

## Breakpoint System

All breakpoints are defined in `src/styles/_responsive.scss`.

```
$bp-xs:  480px   Extra-small   kanban/calendar single-col collapse
$bp-sm:  640px   Small mobile  metrics grid single-col fallback
$bp-md:  768px   Mobile        ← MOST USED — page layouts stack
$bp-ph:  900px   Phablet       landing nav hide, hero 1-col
$bp-lg:  1024px  Tablet/large  dashboard 3-col grid collapses
$bp-xl:  1280px  Desktop       wide content areas
$bp-2xl: 1536px  Ultra-wide    (reserved)
```

### Visual Scale

```
0         480       640      768      900      1024     1280
|—— xs ———|—— sm ———|—— md ———|—— ph ——|—— lg ——|—— xl ——|
```

---

## Using Responsive Mixins

### Constraint: Inline Styles vs Separate SCSS Files

Angular component styles come in two forms:

**Inline (most pages — cannot use SCSS mixins):**

```ts
@Component({
  styles: [`
    /* plain CSS only — no SCSS mixins available */
    @media (max-width: 768px) { ... }  ← use raw values here
  `]
})
```

**Separate `.scss` file (dashboard, new pages):**

```ts
@Component({
  styleUrl: './my.component.scss'  ← SCSS with full mixin support
})
```

> For new pages or when migrating existing ones, always prefer a separate `.scss` file.

### Mixin Reference

```scss
// At the top of any component .scss file:
@use '../../../styles/responsive' as r;
// (adjust path depth: ../../../ from pages/, ../../../../ from deeper folders)
```

#### Desktop-first (max-width) — matches current codebase style

```scss
// Extra-small: < 480px — kanban, dense UIs
@include r.xs { ... }

// Small mobile: < 640px — fallback grid collapse
@include r.mobile { ... }

// Mobile: < 768px — STANDARD for most page stacking
@include r.tablet { ... }

// Phablet: < 900px — nav hide, hero 1-col
@include r.phablet { ... }

// Below desktop: < 1024px — main grid collapse
@include r.below-desktop { ... }
```

#### Mobile-first (min-width) — use for new components

```scss
@include r.from-tablet  { ... }  // >= 768px
@include r.from-phablet { ... }  // >= 900px
@include r.from-desktop { ... }  // >= 1024px
@include r.from-xl      { ... }  // >= 1280px
```

#### Escape hatch for one-off values

```scss
@include r.bp(1400px)     { ... }  // min-width: 1400px
@include r.bp-max(1400px) { ... }  // max-width: 1400px
```

### Usage Example (separate SCSS file)

```scss
@use '../../../styles/responsive' as r;

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);

  @include r.tablet {
    padding: var(--space-4) var(--space-3);
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);

  @include r.below-desktop {
    grid-template-columns: repeat(2, 1fr);
  }

  @include r.tablet {
    grid-template-columns: 1fr;
  }
}
```

### Usage Example (inline styles in .ts — raw CSS only)

```ts
@Component({
  styles: [`
    .page-container {
      max-width: 1400px;
      padding: var(--space-8) var(--space-6);
    }
    /* Use raw values matching the breakpoint scale: 1024px, 768px, 640px */
    @media (max-width: 1024px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .page-container { padding: var(--space-4) var(--space-3); }
      .cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
```

---

## Layout Patterns

### 1. Page Container (standard inner-page layout)

```scss
// SCSS mixin version
@use '../../../styles/responsive' as r;

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);

  @include r.tablet {
    padding: 0 var(--space-2);
  }
}

// OR inline CSS version
// @media (max-width: 768px) {
//   .page-container { padding: 0 var(--space-2); }
// }
```

### 2. Page Header (title + action button row)

Always stacks at 768px:

```scss
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);

  h1 {
    font-size: var(--text-3xl);
    font-weight: var(--fw-extrabold);
  }

  @include r.tablet {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);

    h1 {
      font-size: var(--text-2xl);
    }

    .header-actions {
      width: 100%;
      .btn-primary {
        width: 100%;
      }
    }
  }
}
```

### 3. Cards Grid (auto-responsive)

Prefer `auto-fill` with `minmax()` — no breakpoints needed for moderate sizing:

```scss
// Intrinsically responsive — wraps at ~600px wide
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
```

For more controlled behavior:

```scss
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 3-col desktop

  @include r.below-desktop {
    grid-template-columns: repeat(2, 1fr);
  }
  @include r.tablet {
    grid-template-columns: 1fr;
  }
}
```

### 4. Auth / Centered Card Layout

No breakpoints needed — use `clamp()` and `max-width`:

```scss
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: clamp(var(--space-6), 8vw, var(--space-10));
  background: var(--surface-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
}
```

### 5. Full-width Buttons on Mobile

All primary actions should go full-width at 768px:

```scss
.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;

  @include r.tablet {
    flex-direction: column-reverse;

    .btn-primary,
    .btn-secondary {
      width: 100%;
      text-align: center;
    }
  }
}
```

### 6. Scrollable Table on Mobile

For data tables (`plano`, lists), always wrap in a scroll container:

```html
<div class="table-scroll">
  <table class="data-table">
    ...
  </table>
</div>
```

```scss
.table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; // smooth scroll on iOS
  border-radius: var(--radius-lg);

  .data-table {
    min-width: 600px; // forces scroll instead of squishing
    width: 100%;
  }
}
```

### 7. Navigation (Landing Page Pattern)

```html
<nav class="nav">
  <ul class="nav-links">
    <li><a class="nav-link hide-mobile">Features</a></li>
    <li><a class="nav-link hide-mobile">Pricing</a></li>
  </ul>
  <button class="mobile-menu-btn" aria-label="Toggle menu">
    <!-- hamburger icon -->
  </button>
</nav>
```

```scss
.hide-mobile {
  display: block;
}
.mobile-menu-btn {
  display: none;
}

@include r.phablet {
  // < 900px
  .hide-mobile {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
}
```

---

## Page-by-Page Audit

### dashboard — ✅ Well covered

- 3-column main grid collapses at 1024px → 1-col
- Metrics grid: 3-col → 2-col (1024px) → 1-col (640px)
- Header stacks at 768px
- **Gap:** no mobile sidebar adaptation

### landing — ✅ Well covered

- Nav links hide and hamburger shows at 900px
- Hero 2-col stacks at 900px and 600px
- Uses `clamp()` for fluid font sizes
- **Gap:** breakpoints (900px, 600px) don't align with the standard scale

### login / esqueci-senha / nova-senha / verificar-email — ✅ Intrinsically responsive

- Centered card with `max-width: 420px`
- Fluid `clamp()` padding
- No explicit breakpoints needed — already mobile-first

### cadastro — ⚠️ Partial

- Hero stacks at 900px
- **Gap:** missing standard 768px block (padding, font sizes)

### perfil / conta — ⚠️ Partial

- Layout stacks at 768px, buttons go full-width
- **Gap:** no `min-height: 44px` on touch targets

### plano — ⚠️ Partial

- Card padding reduces at 768px
- **Gap:** `.plans-table` is not wrapped in a horizontal scroll container — will overflow on narrow screens

---

## Anti-Patterns

### Don't use raw pixel values in new code

```scss
// BAD
@media (max-width: 768px) { ... }

// GOOD — in a separate .scss file
@include r.tablet { ... }

// ACCEPTABLE — in inline styles (.ts files)
@media (max-width: 768px) { ... }
// (inline styles can't use SCSS mixins — raw values are unavoidable here)
```

### Don't use `!important` to override responsive grids

```scss
// BAD — brittle, hard to override downstream
.metricas-grid {
  grid-template-columns: repeat(3, 1fr) !important;
  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
  }
}

// GOOD — specificity through nesting or a wrapping class
.dashboard-main-grid .metricas-grid {
  grid-template-columns: repeat(3, 1fr);
  @include r.tablet {
    grid-template-columns: 1fr;
  }
}
```

### Don't mix breakpoint strategies

```scss
// BAD — inconsistent, hard to reason about
@media (max-width: 900px) { ... }
@media (max-width: 768px) { ... }
@media (min-width: 640px) { ... }

// GOOD — consistent desktop-first per file
@include r.phablet { ... }   // < 900px
@include r.tablet  { ... }   // < 768px
@include r.mobile  { ... }   // < 640px
```

### Don't forget `overflow-x: auto` on tables

```scss
// BAD — table squishes and becomes unreadable
.plans-table {
  width: 100%;
}

// GOOD
.table-scroll {
  width: 100%;
  overflow-x: auto;
}
.plans-table {
  min-width: 560px;
  width: 100%;
}
```

---

## Migration Guide

### Migrating an inline-styles page to a separate SCSS file

1. **Create the SCSS file** next to the component:

   ```
   src/app/pages/plano/plano.component.scss
   ```

2. **Update the component decorator:**

   ```ts
   // Before
   @Component({
     styles: [`...all CSS here...`]
   })

   // After
   @Component({
     styleUrl: './plano.component.scss'
   })
   ```

3. **Move the CSS to the new file and add the `@use` import:**

   ```scss
   @use '../../../styles/responsive' as r;

   // ... all existing CSS ...

   // Replace raw @media queries:
   @include r.tablet {
     .page-container {
       padding: 0 var(--space-2);
     }
     // ...
   }
   ```

### Standardizing existing raw breakpoints

When touching a file, replace the raw values with the correct mixin:

| Raw value                    | Mixin to use               |
| ---------------------------- | -------------------------- |
| `@media (max-width: 479px)`  | `@include r.xs`            |
| `@media (max-width: 639px)`  | `@include r.mobile`        |
| `@media (max-width: 767px)`  | `@include r.tablet`        |
| `@media (max-width: 768px)`  | `@include r.tablet`        |
| `@media (max-width: 899px)`  | `@include r.phablet`       |
| `@media (max-width: 900px)`  | `@include r.phablet`       |
| `@media (max-width: 1023px)` | `@include r.below-desktop` |
| `@media (max-width: 1024px)` | `@include r.below-desktop` |
| `@media (min-width: 768px)`  | `@include r.from-tablet`   |
| `@media (min-width: 1024px)` | `@include r.from-desktop`  |

---

## Files Changed

| File                                               | Change                                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/styles/_responsive.scss`                      | Added `phablet`, `xs`, `below-desktop`, `from-*` mobile-first mixins; `bp-max` escape hatch; full JSDoc comments                                 |
| `src/styles/index.scss`                            | Added `@use 'responsive'` to register the module in the barrel                                                                                   |
| `src/app/pages/dashboard/dashboard.component.scss` | Added `@use '../../../styles/responsive' as r`; replaced all 4 raw `@media` queries with mixin calls (`r.below-desktop`, `r.mobile`, `r.tablet`) |
