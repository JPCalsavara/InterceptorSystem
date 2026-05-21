# Findings & Regras

- **Arquitetura Atual:** Os testes E2E ficam em `frontend/src/e2e/`. Usamos comandos customizados Cypress em `support.ts` e `commands.ts` quando repetitivos.
- **Regras Cypress:** Sempre usar `data-cy` ou `data-testid` para resiliência (não usar classes CSS ou estrutura DOM frágil).
- **Setup:** A base de dados precisa estar limpa ou o teste precisa usar dados com strings randômicas (`Date.now()`) para não colidir CPFs/CNPJs já existentes de outros testes.
- **Component Tests (Angular 17+):** 
  - Sempre declarar mocks de services como objetos simples de métodos de retorno antes de `cy.mount`.
  - Mocks do Angular Signals dependentes de outputs devem usar `.then((fixture) => ...)` para acesso à instância do componente ou, na ausência de outputs explicitos, injetar os spys no objeto mockado usando `cy.spy(obj, 'método')` no bloco `it`.
  - Evitar invocar `cy.spy()` na raiz/escopo global do arquivo `.cy.ts` para evitar o erro `Cannot call cy.spy() outside a running test`.
  - Checagem de storage ou manipulações assíncronas do DOM vindas de signals/effects (`effect()`) no Cypress podem demandar encadeamentos automáticos como `cy.window().its('localStorage').invoke('getItem', 'key')` ou asserções manuais garantindo o estado da fixture caso não renderizem sincronamente.
