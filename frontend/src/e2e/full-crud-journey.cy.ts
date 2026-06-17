import { getSafeTestPassword, registerTestUser } from './utils/flow-helper';
import { generateValidCNPJ, generateValidCPF } from './utils/document-helper';
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
    password: getSafeTestPassword(),
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
      cy.get('[data-cy="register-termos"]').check({ force: true });
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
