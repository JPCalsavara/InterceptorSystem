import { generateValidCNPJ, generateValidCPF } from './utils/document-helper';
describe('Criação de Contratos com Vários Tipos de Posto (Wizard)', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `admin_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Admin_${timestamp}`,
  };

  let validCNPJ = '';

  before(() => {
    validCNPJ = generateValidCNPJ();
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
  });

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);

    // Interceptar rotas para manter a estabilidade do E2E
    cy.intercept('GET', '**/api/clientes').as('getClientes');
    cy.intercept('GET', '**/api/tags').as('getTags');
    cy.intercept('GET', '**/api/v1/localidades/estados*').as('getEstados');
    cy.intercept('GET', '**/api/v1/localidades/estados/*/municipios*').as('getMunicipios');
    cy.intercept('POST', '**/api/clientes-completos').as('createClienteCompleto');
    cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcTotal');
  });

  it('Deve criar um cliente e contrato configurando diferentes tipos de postos', () => {
    cy.visit('/clientes/criar-completo');



    // PASSO 1: Cliente
    cy.get('[data-cy="wizard-cliente-nome"]').type('Cliente E2E Test Cypress');
    
    cy.get('[data-cy="wizard-cliente-cnpj"]').type(validCNPJ);
    
    cy.get('[data-cy="wizard-cliente-estado"]').select('SP');
    cy.wait('@getMunicipios');
    cy.get('[data-cy="wizard-cliente-cidade"]').select('São Paulo');
    
    cy.get('[data-cy="wizard-cliente-ideal"]').clear().type('2');
    cy.get('[data-cy="wizard-cliente-horario"]').type('06:00');

    // Vai para o passo 2
    cy.get('[data-cy="wizard-next-step"]').click();

    // PASSO 2: Contrato
    cy.get('[data-cy="wizard-criar-contrato"]').check();

    // Configurando 6 tipos de postos para cobrir as opções
    cy.get('[data-cy="wizard-modo-personalizado"]').check();
    cy.get('[data-cy="wizard-numero-postos"]').clear().type('6');

    const tipos = [
      'ESCALA_12X36',
      'ESCALA_12X36_DUPLA',
      'ESCALA_8H_3TURNOS',
      'ESCALA_5X2_DIURNO',
      'ESCALA_24H_UNICO',
      'PERSONALIZADO'
    ];

    tipos.forEach((tipo, index) => {
      cy.get(`[data-cy="wizard-posto-tipo-${index}"]`).select(tipo);
    });

    // Vai para o passo 3 (Funcionários)
    cy.get('[data-cy="wizard-next-step"]').click();

    // Aguarda pelo menos 1 recálculo terminar para ter valor monetário > 0
    cy.wait('@calcTotal', { timeout: 10000 });

    // Vamos finalizar, sem adicionar funcionários.
    cy.get('[data-cy="wizard-submit"]').click();

    // Aguardar requisição e validar payload
    cy.wait('@createClienteCompleto').then((interception) => {
      expect(interception.response?.statusCode, `Response body: ${JSON.stringify(interception.response?.body)}`).to.be.oneOf([200, 201]);
      const reqBody = interception.request.body;
      
      expect(reqBody.cliente.nome).to.eq('Cliente E2E Test Cypress');
      expect(reqBody.contrato).to.exist;
      expect(reqBody.postoConfigs).to.exist;
      expect(reqBody.postoConfigs).to.have.length(6);
      expect(reqBody.postoConfigs[0].tipoPosto).to.eq('ESCALA_12X36');
      expect(reqBody.postoConfigs[5].tipoPosto).to.eq('PERSONALIZADO');
    });
    
    // Opcional: verificar se fomos redirecionados.
    cy.url().should('include', '/clientes');
  });
});
