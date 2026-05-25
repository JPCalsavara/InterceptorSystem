---
name: backend-test-workflow
description: Automatically generates Unit, Component, and E2E tests for both Backend (C#) and Frontend (Angular/Cypress) enforcing project standards and visual responsiveness.
---

# Generate Tests Skill

When creating or updating tests, enforce the following InterceptorSystem standards across the stack.

## 1. A Estratégia da Pirâmide de Testes (Por que precisamos de todos?)
- **Backend Unit/Integration (xUnit)**: Garante que a regra de negócio, cálculos e banco de dados funcionam. Mas o backend não sabe se o botão na tela está clicável ou invisível.
- **Frontend Component Tests (Cypress Component)**: Isola um componente de UI (ex: um botão ou card) e testa se ele está responsivo e quebrando o CSS corretamente em telas pequenas.
- **Frontend E2E Tests (Cypress E2E)**: Simula o usuário real abrindo o navegador, navegando nas rotas, preenchendo formulários e vendo se a união (Front + Back) funciona. Se a API mudou o nome de um campo e quebrou o Frontend, apenas o E2E vai pegar isso.

---

## 2. Frontend Component & Responsive Tests (Cypress Component)

Quando gerar testes para componentes de UI Angular (dentro das pastas `components/`), foque em **Responsividade** e **Estado**.

- **Viewport Testing**: Teste obrigatoriamente os componentes nas resoluções `mobile` (320px) e `desktop` (1024px).
- **CSS Assertions**: Afirme matematicamente que as propriedades Flexbox/Grid se adaptaram.
  ```typescript
  it('deve empilhar os elementos verticalmente no mobile', () => {
    cy.viewport(320, 568);
    cy.mount(MeuCardComponent);
    cy.get('.container').should('have.css', 'flex-direction', 'column');
  });
  ```
- **Acessibilidade e Interação**: Teste se botões disparam os eventos (`@Output`) corretos e se estados de erro (como bordas vermelhas) aparecem quando o form é inválido.

---

## 3. Frontend E2E Tests (Cypress E2E)

Utilizado para a jornada completa do usuário na tela principal.
- **Mock vs Real**: Utilize `cy.intercept()` para isolar falhas de front, mas mantenha testes críticos consumindo a API real.
- **Seletores Resilientes**: Nunca selecione elementos por classes de estilização (ex: `.btn-blue`). Sempre crie e utilize `data-cy="submit-button"`.

---

## 4. Backend Tests (Cypress) ➡️ C# / xUnit

Regras estritas para testes do .NET:
- **Regra de Cobertura**: Toda funcionalidade exige **3 casos de teste** no mínimo:
  1. **Good Case** (Valores válidos, sucesso).
  2. **Edge Case** (Valores limitrofes ou campos opcionais faltando).
  3. **Bad Case** (Input inválido, deve lançar exceção).
- **Moq**: Sempre mocke o `ICurrentTenantService` para garantir o `EmpresaId` fixo, pois o sistema é Multi-Tenant.
- **AppServices**: São o alvo primário de testes de escrita/orquestração. Teste o Sucesso, o Not Found (lança KeyNotFoundException) e a Violação de Domínio (lança DomainException).
- **Domain Entities & Value Objects**: Garanta que as mudanças de estado ocorram apenas por métodos comportamentais (ex: `AtualizarDados()`). Teste se entradas ruins (ex: CPF com 10 dígitos) disparam erro no VO imediatamente.
- **Domain Events**: Sempre teste se a entidade emitiu o evento correto após uma ação importante (ex: `Assert.IsType<ClienteCreatedEvent>(cliente.DomainEvents.First());`).

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
