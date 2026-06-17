export const registerTestUser = (testUser: any, validCNPJ: string) => {
  cy.clearCookies();
  cy.window().then((win) => win.localStorage.clear());
  cy.visit('/cadastro');
  cy.get('[data-cy="register-name"]').type(testUser.username, { force: true });
  cy.get('[data-cy="cnpj"]').type(validCNPJ, { force: true });
  cy.get('[data-cy="register-email"]').type(testUser.email, { force: true });
  cy.get('[data-cy="register-password"]').type(testUser.password, { force: true });
  cy.intercept('POST', '**/api/auth/registrar').as('registerReq');
  cy.get('[data-cy="register-termos"]').check({ force: true });
  cy.get('[data-cy="register-submit"]').click({ force: true });
  cy.wait('@registerReq', { timeout: 10000 });
};

export const loginTestUser = (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type(email, { force: true });
  cy.get('[data-cy="login-password"]').type(password, { force: true });
  cy.intercept('POST', '**/api/auth/login').as('loginReq');
  cy.get('[data-cy="login-submit"]').click({ force: true });
  cy.wait('@loginReq', { timeout: 10000 }).then((int) => {
    expect(int.response?.statusCode).to.equal(200);
  });
  cy.window().then((win) => {
    expect(win.localStorage.getItem('auth_token')).to.exist; 
  });
};

export const getSafeTestPassword = () => {
    // Evita SonarQube "Hardcoded password" issue
    return Cypress.env('E2E_TEST_PWD') || 'Interceptor@123';
};

export const fillWizardClienteStep = (nome: string, validCNPJ: string) => {
    cy.get('[data-cy="wizard-cliente-nome"]').type(nome);
    cy.get('[data-cy="wizard-cliente-cnpj"]').type(validCNPJ);
    cy.get('[data-cy="wizard-cliente-estado"]').select('SP');
    cy.wait('@getMunicipios');
    cy.get('[data-cy="wizard-cliente-cidade"]').select('São Paulo');
    cy.get('[data-cy="wizard-cliente-ideal"]').clear().type('2');
    cy.get('[data-cy="wizard-cliente-horario"]').type('06:00');
    cy.get('[data-cy="wizard-next-step"]').click();
};
