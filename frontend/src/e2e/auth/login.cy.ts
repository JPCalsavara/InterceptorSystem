import { generateValidCNPJ, generateValidCPF } from '../utils/document-helper';
describe('Autenticação - Login (E2E)', () => {
  const baseUrl = Cypress.config().baseUrl || 'http://localhost:4200';
  const timestamp = Date.now();
  
  const testUser = {
    email: `teste_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Teste_${timestamp}`,
  };

  before(() => {
    // Registra um usuário para usar nos testes de login
    cy.visit(`${baseUrl}/cadastro`);
    cy.get('[data-cy="register-name"]').type(testUser.username, { force: true });
    cy.get('[data-cy="cnpj"]').type(generateValidCNPJ(), { force: true });
    cy.get('[data-cy="register-email"]').type(testUser.email, { force: true });
    cy.get('[data-cy="register-password"]').type(testUser.password, { force: true });
    
    // Garantir que os campos foram preenchidos
    cy.get('.field-error').should('not.exist');

    cy.intercept('POST', '**/api/auth/registrar').as('registerReq');
    cy.get('[data-cy="register-termos"]').check({ force: true });
      cy.get('[data-cy="register-submit"]').click({ force: true });
    
    cy.wait('@registerReq', { timeout: 10000 }).then(() => {
      cy.url().should('include', '/dashboard');
      cy.clearCookies();
      cy.window().then((win) => win.localStorage.clear());
    });
  });

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  it('CT-LOGIN-01: Deve realizar login com sucesso (Caminho Feliz)', () => {
    cy.get('[data-cy="login-email"]').type(testUser.email, { force: true });
    cy.get('[data-cy="login-password"]').type(testUser.password, { force: true });
    cy.get('[data-cy="login-submit"]').click({ force: true });

    cy.url().should('include', '/dashboard');
    
    // Verifica se os dados de sessão foram salvos
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.exist; 
    });
  });

  it('CT-LOGIN-02: Deve exibir erro de validação ao tentar logar sem preencher campos', () => {
    cy.get('[data-cy="login-submit"]').click({ force: true });

    // Como o form usa forms reativos sem disabled, esperamos que as mensagens de erro apareçam
    cy.get('.field-error').should('have.length.at.least', 2);
  });

  it('CT-LOGIN-03: Deve exibir erro de credenciais inválidas', () => {
    cy.get('[data-cy="login-email"]').type(testUser.email, { force: true });
    cy.get('[data-cy="login-password"]').type('SenhaIncorreta123', { force: true });
    
    cy.intercept('POST', '**/api/auth/login').as('loginReq');
    cy.get('[data-cy="login-submit"]').click({ force: true });

    cy.wait('@loginReq').then((int) => {
      expect(int.response?.statusCode).to.equal(401);
    });

    // Validar mensagem de erro no UI (supondo alert-error ou toast)
    cy.get('.alert-error, .toast-error, nz-message, .error-message').should('be.visible');
  });
});
