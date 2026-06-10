declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    createCliente(cliente: any): Chainable<void>;
  }
}

function generateCnpj(): string {
  const rnd = (n: number) => Math.round(Math.random() * n);
  const base = [rnd(9), rnd(9), rnd(9), rnd(9), rnd(9), rnd(9), rnd(9), rnd(9), 0, 0, 0, 1];
  
  const calcDigit = (b: number[], weights: number[]) => {
    const sum = b.reduce((acc, val, i) => acc + val * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  
  const d1 = calcDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit([...base, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  
  return [...base, d1, d2].join('');
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
  const nomeCliente = cliente.nome || `Empresa E2E ${Date.now()}`;
  
  // Interceptar a requisição para garantir sincronismo
  cy.intercept('POST', '**/api/clientes').as('createClienteReq');

  cy.get('[data-cy="cliente-nome"]').type(nomeCliente);
  const cnpjUnico = cliente.cnpj || generateCnpj();
  cy.get('[data-cy="cliente-cnpj"]').type(cnpjUnico);
  
  // Selecionar Localização (Obrigatório)
  cy.get('#estado option').should('have.length.gt', 1);
  cy.get('#estado').select('SP');
  cy.get('#cidade', { timeout: 15000 }).should('not.be.disabled');
  cy.get('#cidade option').should('have.length.gt', 1);
  cy.get('#cidade').select('São Paulo');

  cy.get('[data-cy="btn-save-cliente"]').click();
  
  // Aguardar a requisição terminar com sucesso antes de prosseguir
  cy.wait('@createClienteReq', { timeout: 15000 }).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
  });

  cy.url({ timeout: 15000 }).should('include', '/clientes');
  cy.contains(nomeCliente, { timeout: 15000 }).should('be.visible');
});
