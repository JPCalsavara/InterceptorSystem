declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    createCliente(cliente: any): Chainable<void>;
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type(email, { force: true });
  cy.get('[data-cy="login-password"]').type(password, { force: true });
  cy.get('[data-cy="login-submit"]').click({ force: true });
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createCliente', (cliente) => {
  cy.visit('/clientes/novo');
  const nomeComGuto = `Empresa E2E ${Date.now()}`;
  
  // Interceptar a requisição para garantir sincronismo
  cy.intercept('POST', '**/api/clientes').as('createClienteReq');

  cy.get('[data-cy="cliente-nome"]').type(nomeComGuto);
  cy.get('[data-cy="cliente-cnpj"]').type(cliente.cnpj);
  
  // Selecionar Localização (Obrigatório)
  cy.get('#estado').select('SP');
  cy.get('#cidade', { timeout: 15000 }).should('not.be.disabled');
  cy.get('#cidade').select('São Paulo');

  cy.get('[data-cy="btn-save-cliente"]').click();
  
  // Aguardar a requisição terminar com sucesso antes de prosseguir
  cy.wait('@createClienteReq', { timeout: 15000 }).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
  });

  cy.url({ timeout: 15000 }).should('include', '/clientes');
  cy.contains(nomeComGuto, { timeout: 15000 }).should('be.visible');
});
