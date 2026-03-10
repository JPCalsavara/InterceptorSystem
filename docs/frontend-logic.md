# Frontend System Logic Overview (InterceptorSystem)

## 1. System Architecture
- **Framework**: Angular 21 (Standalone Components Architecture).
- **Design System**: Fully componentized with utility-based or token-based styling (TailwindCSS or modular CSS).
- **Core Directories**:
  - `core/`: Singleton services, Guards (`auth.guard.ts`), Interceptors (`auth.interceptor.ts`).
  - `features/`: Business domain modules/components (e.g., `clientes`, `funcionarios`, `diarias`).
  - `shared/`: Generic, reusable UI components (UI layout, Navigation bars, Modals).
  - `pages/`: Top-level route views that aggregate features.
  - `services/`: API communication wrappers and state managers.

## 2. Standard Logic and Patterns
- **Standalone Components**: Legacy `ngModule` is mostly deprecated. Use direct `imports` arrays in `@Component` decorators.
- **Authentication**: JWT tokens are stored securely (localStorage/sessionStorage). The `AuthInterceptor` attaches `Authorization: Bearer <token>` to all HTTP API requests automatically.
- **Routing & Navigation Guards**: Protected routes reliably implement `AuthGuard` or `CanActivate` mechanisms to prevent unauthenticated user access.
- **Reactive Forms**: All complex forms utilize `FormBuilder` and reactive form strategies.
- **Dark Mode**: UI dynamically checks user preferences or OS preferences for applying CSS custom property themes.

## 3. Best Practices
- **API Call Isolation**: Never call `HttpClient` directly inside `.component.ts` logic. Always use a dedicated service injected from the `services/` folder.
- **Design Tokens**: Raw hex colors (`#FF0000`) should be completely avoided in the components. Rely on CSS variables defined in global styles (e.g., `var(--primary-color)` or utility classes).
- **Environment Driven**: Do not hardcode API base URLs. Inject the global `environment.apiUrl`.
- **Memory Management (RxJS)**: Strictly avoid memory leaks by heavily utilizing `takeUntil`, Async pipes in HTML templates (`| async`), or Angular's standard signal paradigms (`toSignal`).

## 4. Key Files and Search Documents
- **`auth.interceptor.ts`** (`src/app/core/interceptors`): The backbone of attaching credentials to API requests.
- **`clientes.service.ts`** (`src/app/services`): Examples of standard CRUD API consumption and Observable data flows.
- **`app.routes.ts`** (`src/app`): The central mapping index of all pages and guards.
- **`styles.css`** (or relevant global style): The source of truth for the application's design system tokens and variables.

## 5. Acceptance Criteria for Validating UI Features (Checklist)
- [ ] Is the data populated asynchronously via a component Service method, managing loading states (e.g., displaying spinners or skeleton loaders)?
- [ ] Does the UI correctly parse, handle, and display HTTP error responses to the final user in a friendly manner?
- [ ] Is the component fully responsive (mobile-friendly scaling down to at least 375px viewport widths)?
- [ ] Do forms include necessary localized masks (Cnpj, Cpf, Phone) and validation error text for invalid inputs?
- [ ] Are overarching design tokens utilized for colors, spacing, and typography instead of ad-hoc CSS implementation?
