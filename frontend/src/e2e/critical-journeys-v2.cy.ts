/**
 * E2E Tests for InterceptorSystem - Critical User Journeys
 *
 * Framework: Cypress
 * Scope: End-to-end testing of critical user workflows
 */

describe('InterceptorSystem E2E - Critical User Journeys', () => {
  const baseUrl = Cypress.config().baseUrl || 'http://localhost:4200';
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: 'test_user',
  };

  const testCliente = {
    nome: `Empresa Teste E2E ${Date.now()}`,
    cnpj: '', // Generated in before
    email: 'contato@empresateste.com',
    telefone: '1133334444',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
  };

  const testPosto = {
    nome: 'Portaria Principal',
    endereco: 'Rua Teste, 123 - Portaria',
    tipoAcesso: 'BIOMETRICO',
    capacidadeMaxima: 50,
  };

  const testFuncionario = {
    nome: 'João Silva da Costa',
    cpf: '12345678901',
    telefone: '11987654321',
    email: 'joao@example.com',
    tipoEscala: 'DOZE_POR_TRINTA_SEIS',
    tipoFuncionario: 'CLT',
  };

  const testContrato = {
    id: 'test-id',
    titulo: 'Contrato Vigência 2026',
    dataInicio: '2026-01-01',
    dataFim: '2026-12-31',
    status: 'ATIVO',
    percentualEncargos: 50,
    margemLucroPercentual: 20,
    margemCoberturaFaltasPercentual: 10,
  };

  before(() => {
    // CNPJ será gerado pelo custom command cy.createCliente
    testCliente.cnpj = '';
  });

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.clearCookies();
    cy.window().then((win) => win.localStorage.clear());
  });

  describe('Jornada 1: Autenticação e Login', () => {
    it('CT-001: Usuário novo deve registrar-se com sucesso', () => {
      // 1. Visitar página de registro (corrigida para /cadastro)
      cy.visit(`${baseUrl}/cadastro`);

      // 2. Preencher formulário de registro
      cy.get('[data-cy="register-name"]').type('Novo Usuário');
      cy.get('[data-cy="register-email"]').type(testUser.email);
      cy.get('[data-cy="register-password"]').type(testUser.password);
      
      // 3. Submeter formulário (campos confirm password e terms removidos pois não existem no componente)
      cy.get('[data-cy="register-submit"]').click();

      // 4. Verificar redirecionamento para dashboard
      cy.url().should('include', '/dashboard');
    });

    it('CT-002: Usuário registrado deve fazer login', () => {
      // 1. Visitar página de login (corrigida para /login)
      cy.visit(`${baseUrl}/login`);

      // 2. Preencher credenciais
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // 3. Submeter login
      cy.get('[data-cy="login-submit"]').click();

      // 4. Verificar sucesso e redirecionamento
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Jornada 2: Criar Novo Cliente', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('CT-004: Usuário deve criar novo cliente com dados válidos', () => {
      cy.createCliente(testCliente);
    });
  });

  describe('Jornada 3: Criar Contrato com Cálculo de Valores', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
      // Usar um CNPJ diferente para não colidir com o teste anterior
      cy.createCliente({ ...testCliente, cnpj: '19131243000197' });
    });

    it('CT-006: Usuário deve criar novo contrato', () => {
      // 1. Navegar para contratos
      cy.visit(`${baseUrl}/contratos`);

      // 2. Clicar em "Novo Contrato"
      cy.get('[data-cy="btn-new-contrato"]').click();

      // 3. Preencher dados básicos
      cy.get('[data-cy="contrato-titulo"]').type(`${testContrato.titulo} ${Date.now()}`);
      
      // 4. Submeter contrato
      cy.get('[data-cy="btn-save-contrato"]').click();
    });
  });
});
