/**
 * E2E Tests for InterceptorSystem - Full CRUD & Cascading Delete
 *
 * Framework: Cypress
 * Scope: End-to-end testing of full CRUD lifecycle of entities.
 */

describe('InterceptorSystem E2E - Full CRUD & Deleção Cascata', () => {
  const baseUrl = Cypress.config().baseUrl || 'http://localhost:4200';
  const timestamp = Date.now();
  
  const testUser = {
    email: `admin_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Admin_${timestamp}`,
  };

  const testCliente = {
    nome: `Cliente Caixa Preta ${timestamp}`,
    cnpj: '', // Generated in before
  };

  const testContrato = {
    titulo: `Contrato de Teste ${timestamp}`,
  };

  const testFuncionario = {
    nome: `Robo Guardiao ${timestamp}`,
    cpf: '', // Generated in before
    telefone: '11987654321',
  };

  // Funções auxiliares para gerar documentos válidos
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

  const generateValidCPF = () => {
    const rnd = (n: number) => Math.round(Math.random() * n);
    const mod = (dividendo: number, divisor: number) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));
    const n = 9;
    const n1 = rnd(n); const n2 = rnd(n); const n3 = rnd(n);
    const n4 = rnd(n); const n5 = rnd(n); const n6 = rnd(n);
    const n7 = rnd(n); const n8 = rnd(n); const n9 = rnd(n);
    let d1 = n9*2 + n8*3 + n7*4 + n6*5 + n5*6 + n4*7 + n3*8 + n2*9 + n1*10;
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;
    let d2 = d1*2 + n9*3 + n8*4 + n7*5 + n6*6 + n5*7 + n4*8 + n3*9 + n2*10 + n1*11;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;
    return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
  };

  before(() => {
    testCliente.cnpj = generateValidCNPJ();
    testFuncionario.cpf = generateValidCPF();

    cy.visit(baseUrl);
    cy.clearCookies();
    cy.window().then((win) => win.localStorage.clear());
  });

  describe('Fase 1 e 2: Autenticação e Cliente', () => {
    it('CT-001: Deve registrar, logar e Criar Cliente', () => {
      // Registrar
      cy.visit(`${baseUrl}/cadastro`);
      cy.get('[data-cy="register-name"]').type(testUser.username, { force: true });
      cy.get('[data-cy="cnpj"]').type(testCliente.cnpj, { force: true });
      cy.get('[data-cy="register-email"]').type(testUser.email, { force: true });
      cy.get('[data-cy="register-password"]').type(testUser.password, { force: true });
      
      cy.intercept('POST', '**/api/auth/registrar').as('registerReq');
      cy.get('[data-cy="register-submit"]').click({ force: true });
      cy.wait('@registerReq', { timeout: 10000 }).then((int) => {
        expect(int.response?.statusCode).to.be.oneOf([200, 201]);
      });

      // Logar
      cy.visit(`${baseUrl}/login`);
      cy.get('[data-cy="login-email"]').type(testUser.email, { force: true });
      cy.get('[data-cy="login-password"]').type(testUser.password, { force: true });
      cy.get('[data-cy="login-submit"]').click({ force: true });
      cy.url().should('include', '/dashboard');

      // Criar Cliente Manual
      cy.visit(`${baseUrl}/clientes/novo`);
      cy.intercept('POST', '**/api/clientes').as('createCliente');
      
      cy.get('[data-cy="cliente-nome"]').type(testCliente.nome, { force: true });
      cy.get('[data-cy="cliente-cnpj"]').type(testCliente.cnpj, { force: true });
      cy.get('#estado').select('SP', { force: true });
      cy.get('#cidade', { timeout: 15000 }).should('not.be.disabled');
      cy.get('#cidade').select('São Paulo', { force: true });
      cy.get('[data-cy="btn-save-cliente"]').click({ force: true });

      cy.wait('@createCliente').then((int) => {
        expect(int.response?.statusCode).to.be.oneOf([200, 201]);
      });

      // Leitura na Lista
      cy.url().should('include', '/clientes');
      cy.contains('[data-cy="cliente-card-title"]', testCliente.nome).should('be.visible');
    });
  });

  describe('Fase 3: Contratos e Postos', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('CT-002: Deve criar Contrato, ler na lista', () => {
      // Criar Contrato
      cy.visit(`${baseUrl}/contratos/novo`);
      cy.intercept('POST', '**/api/contratos').as('createContrato');
      cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcTotal');

      cy.get('[data-cy="contrato-cliente"]').select(testCliente.nome, { force: true });
      cy.get('[data-cy="contrato-titulo"]').type(testContrato.titulo, { force: true });
      cy.get('[data-cy="contrato-data-inicio"]').type('2026-01-01', { force: true });
      cy.get('[data-cy="contrato-data-fim"]').type('2026-12-31', { force: true });
      
      // Wait for AutoCalculo to finish before saving
      cy.wait('@calcTotal', { timeout: 10000 });
      
      cy.get('[data-cy="btn-save-contrato"]').click({ force: true });
      cy.wait('@createContrato').then((int) => {
        expect(int.response?.statusCode).to.be.oneOf([200, 201]);
        cy.wrap(int.response?.body.id).as('contratoId');
      });

      // Validar na Lista
      cy.url().should('include', '/contratos');
      cy.contains('[data-cy="contrato-card-title"]', testCliente.nome).should('be.visible');
      cy.contains('.contract-card', testCliente.nome)
        .find('[data-cy="contrato-card-desc"]')
        .should('contain', testContrato.titulo);
    });
  });

  describe('Fase 4: Funcionários e Alocações', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('CT-003: Deve criar Funcionário', () => {
      // 1. Criar Funcionário
      cy.visit(`${baseUrl}/funcionarios/novo`);
      cy.intercept('POST', '**/api/funcionarios').as('createFunc');

      // Select cliente reference
      cy.get('select[formControlName="clienteId"]').select(testCliente.nome, { force: true });
      // Wait for contrato reference to load
      cy.get('select[formControlName="contratoId"]').select(testContrato.titulo, { force: true });

      cy.get('input[formControlName="nome"]').type(testFuncionario.nome, { force: true });
      cy.get('input[formControlName="cpf"]').type(testFuncionario.cpf, { force: true });
      cy.get('input[formControlName="celular"]').type(testFuncionario.telefone, { force: true });
      cy.get('select[formControlName="tipoFuncionario"]').select('CLT', { force: true });
      cy.get('select[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS', { force: true });
      
      cy.get('button[type="submit"]').contains('Cadastrar').click({ force: true });
      
      cy.wait('@createFunc').then((int) => {
         expect(int.response?.statusCode).to.be.oneOf([200, 201]);
      });

      cy.url().should('include', '/funcionarios');
      cy.contains('h3', testFuncionario.nome).should('be.visible');
    });
  });

  describe('Fase 5: Deleção Cascata', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('CT-004: Deve deletar tudo na ordem para validar Foreign Keys (500 -> 400 fix)', () => {
      // Deletar Funcionário
      cy.visit(`${baseUrl}/funcionarios`);
      cy.intercept('DELETE', '**/api/funcionarios/*').as('deleteFuncionario');
      cy.contains('.employee-card', testFuncionario.nome)
        .find('.btn-danger')
        .click({ force: true });
      
      cy.get('body').then($body => {
        if ($body.find('button:contains("Excluir")').length > 0) {
          cy.get('button:contains("Excluir")').click({ force: true });
        }
      });
      
      cy.wait('@deleteFuncionario').then((int) => {
        expect(int.response?.statusCode).to.be.oneOf([200, 204]);
      });
      cy.contains('.employee-card', testFuncionario.nome).should('not.exist');

      // Deletar Contrato
      cy.visit(`${baseUrl}/contratos`);
      cy.intercept('DELETE', '**/api/contratos/*').as('deleteContrato');
      cy.contains('.contract-card', testCliente.nome)
        .find('[data-cy^="btn-delete-contrato-"]')
        .click({ force: true });
        
      cy.get('body').then($body => {
        if ($body.find('button:contains("Excluir")').length > 0) {
          cy.get('button:contains("Excluir")').click({ force: true });
        }
      });
      
      cy.wait('@deleteContrato').then((int) => {
        expect(int.response?.statusCode).to.be.oneOf([200, 204]);
      });
      cy.contains('.contract-card', testCliente.nome).should('not.exist');

      // Deletar Cliente
      cy.visit(`${baseUrl}/clientes`);
      cy.intercept('DELETE', '**/api/clientes/*').as('deleteCliente');
      cy.contains('.card', testCliente.nome)
        .find('[data-cy^="btn-delete-cliente-"]')
        .click({ force: true });
        
      cy.get('body').then($body => {
        if ($body.find('button:contains("Excluir")').length > 0) {
          cy.get('button:contains("Excluir")').click({ force: true });
        }
      });
      
      cy.wait('@deleteCliente').then((int) => {
        if (int.response?.statusCode === 409) {
           throw new Error('DELETE CLIENTE FAILED WITH 409! Response: ' + JSON.stringify(int.response?.body));
        }
        expect(int.response?.statusCode).to.be.oneOf([200, 204]);
      });
      cy.contains('.card', testCliente.nome).should('not.exist');
    });
  });
});
