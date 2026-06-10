describe('Autenticação - Login (E2E)', () => {
  const baseUrl = Cypress.config().baseUrl || 'http://localhost:4200';
  const timestamp = Date.now();
  
  const testUser = {
    email: `teste_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Teste_${timestamp}`,
  };

  const generateValidCNPJ = () => {
    const rnd = (n: number) => Math.round(Math.random() * n);
    const mod = (dividendo: number, divisor: number) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));
    const n = 9;
    const n1 = rnd(n); const n2 = rnd(n); const n3 = rnd(n);
    const n4 = rnd(n); const n5 = rnd(n); const n6 = rnd(n);
    const n7 = rnd(n); const n8 = rnd(n);
    const n9 = 0; const n10 = 0; const n11 = 0; const n12 = 1;
    let d1 = n12*2 + n11*3 + n10*4 + n9*5 + n8*6 + n7*7 + n6*8 + n5*9 + n4*2 + n3*3 + n2*4 + n1*5;
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;
    let d2 = d1*2 + n12*3 + n11*4 + n10*5 + n9*6 + n8*7 + n7*8 + n6*9 + n5*2 + n4*3 + n3*4 + n2*5 + n1*6;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;
    return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${n10}${n11}${n12}${d1}${d2}`;
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
