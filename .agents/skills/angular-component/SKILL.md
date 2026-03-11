---
name: angular-component
description: Best practices for implementing a new Angular 21 Standalone component, enforcing separation of concerns and styling rules.
---

# Angular Component Skill

Follow these InterceptorSystem guidelines when creating Angular UI elements:

## 1. Architecture (Angular 21)
- **Standalone Only**: Use `@Component({ standalone: true, imports: [...] })`. Avoid `ngModule` entirely.
- **Business Logic Separation**: Never call `HttpClient` directly inside a component. Inject a service from the `services/` folder to manage data fetching.

## 2. Reactive Patterns & Memory Management
- **Forms**: Use `FormBuilder` for complex forms. Include localized masks (`ngx-mask` for CNPJ, CPF, Phone) and display validation errors block on invalid inputs.
- **RxJS Unsubscription**: Prevent memory leaks. Use `| async` pipe in HTML, or `takeUntilDestroyed()`, `takeUntil()`, or Angular Signals (`toSignal`) when subscribing explicitly in the component.

## 3. Data Loading
- Populate data asynchronously via Service methods.
- Explicitly handle loading states (spinners/skeleton loaders) and bind them to the template.
- Parse HTTP errors gracefully and show user-friendly feedback (using toast notifications/snackbars).

## 4. UI & Styling (CSS/SCSS)
- **Design Tokens**: Do NOT hardcode colors like `#FF0000` or `#fff`. Use the CSS variables defined in global styles (e.g., `var(--primary-color)`, `var(--surface)`).
- **Responsive-UI Integration**: Ensure components are fully responsive down to `375px` viewport width, utilizing flexbox/grid layout and relative units rather than fixed pixel dimensions.
- Ensure Dark Mode compatibility.
