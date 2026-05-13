declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    createCliente(cliente: any): Chainable<void>;
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="login-email"]').type(email);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createCliente', (cliente) => {
  cy.visit('/clientes/novo');
  const nomeComGuto = `Empresa E2E ${Date.now()}`;
  
  // Interceptar a requisição para garantir sincronismo
  cy.intercept('POST', '**/api/clientes').as('createClienteReq');

  cy.get('[data-testid="cliente-nome"]').type(nomeComGuto);
  cy.get('[data-testid="cliente-cnpj"]').type(cliente.cnpj);
  
  // Selecionar Localização (Obrigatório)
  cy.get('#estado').select('SP');
  cy.get('#cidade', { timeout: 15000 }).should('not.be.disabled');
  cy.get('#cidade').select('São Paulo');

  cy.get('[data-testid="btn-save-cliente"]').click();
  
  // Aguardar a requisição terminar com sucesso antes de prosseguir
  cy.wait('@createClienteReq', { timeout: 15000 }).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
  });

  cy.url({ timeout: 15000 }).should('include', '/clientes');
  cy.contains(nomeComGuto, { timeout: 15000 }).should('be.visible');
});
