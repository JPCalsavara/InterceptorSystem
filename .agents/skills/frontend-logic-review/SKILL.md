---
name: frontend-logic-review
description: Revisa os pull requests do frontend Angular focando exclusivamente no desempenho, roteamento, chamadas HTTP, uso do RxJS e Signals para gerenciamento de estado.
---

# Frontend Logic Review

## Propósito
Revisar o código TypeScript (`.ts`) dos componentes e serviços Angular, garantindo que não há vazamento de lógicas complexas no HTML e que a arquitetura Standalone está limpa.

## Foco do Review
- **Injeção do HttpClient:** Reprove Componentes UI que injetem o HttpClient. O componente deve sempre consumir um Service.
- **Gerenciamento de Estado:** Recomende ou exija a refatoração de subscrições puras para o uso de `Signals` ou pipes `async` do RxJS para evitar memory leaks.
- **Tratamento de Erros:** O interceptor global ou o Service devem lidar com exceções de domínio e formatá-las (ex: 400 Bad Request) em vez de lançar "undefined errors" no console.
- **Testabilidade:** Analise se o componente tem dependências injetadas de forma isolável, permitindo um fácil teste no Cypress.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
