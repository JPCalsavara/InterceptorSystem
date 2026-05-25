---
name: angular-component
description: Best practices for implementing a new Angular 21 Standalone component, enforcing Single-File Components (.ts only), subfolder organization, and strict responsive design rules.
---

# Angular Component Skill

Follow these InterceptorSystem guidelines when creating Angular UI elements. We prioritize highly modular, component-driven architectures over monolithic page files.

## 1. Architecture (Angular 21) & Single-File Components
- **Standalone Only**: Use `@Component({ standalone: true, imports: [...] })`. Avoid `ngModule` entirely.
- **Single-File Components**: Do NOT generate separate `.html` and `.css`/`.scss` files para sub-componentes. Use inline `template: \`...\`` e inline `styles: [\`...\`]` dentro de um único arquivo `.ts`. 
  - *Exemplo:* `botao-acao.component.ts` contendo a classe, o HTML e o CSS.
- **Componentização**: Quebre páginas grandes (que usam o trio html/css/ts) em múltiplos componentes menores. A Página deve funcionar mais como um orquestrador de layout e estado.
- **Folder Structure**: Quando criar componentes específicos de uma página, crie uma subpasta `components/` dentro do diretório da página e coloque os arquivos únicos `.ts` ali dentro. (Exemplo: `src/app/pages/dashboard/components/card-estatistica.component.ts`).

## 2. UI & High-Quality Styling (CSS)
- **Não Confie em Bibliotecas Padrão Ruins**: Não dependa de CSS de bibliotecas prontas que quebram a responsividade. Escreva CSS robusto, customizado e moderno focado em `Flexbox` e `CSS Grid`.
- **Responsivo por Padrão**: 
  - Garanta que o componente não quebra a tela até `320px` (mobile small).
  - Use unidades relativas (`rem`, `%`, `gap`, `fr`) ao invés de fixar larguras absolutas em `px`.
  - Use Media Queries para re-arranjar blocos horizontais para verticais no mobile (`flex-direction: column`).
- **Design Tokens**: NUNCA "hardcode" cores (ex: `#FFFFFF` ou `red`). Sempre utilize as variáveis globais do sistema (`var(--primary-color)`, `var(--surface-color)`, etc).
- **Aesthetics & Premium UI**: Use micro-interações (`transition: all 0.2s ease`), estados de `:hover`, sombras e cantos arredondados condizentes com um design system moderno e premium.

## 3. Reactive Patterns & Memory Management
- **Business Logic Separation**: Nunca chame `HttpClient` direto no componente. Ejete o dado via Service.
- **Forms**: Use `FormBuilder` para formulários. Mostre blocos de erro para campos inválidos.
- **RxJS Unsubscription**: Evite vazamento de memória usando pipe `| async` no HTML, ou Angular Signals (`toSignal`), ou `takeUntilDestroyed()`.

## 4. Data Loading
- Gerencie estados de UI explicitamente (`isLoading`, `hasError`).
- Mostre Skeleton Loaders ou Spinners enquanto dados chegam via Service.
- Trate erros de API exibindo feedback amigável pro usuário (Toast/Snackbar).

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
