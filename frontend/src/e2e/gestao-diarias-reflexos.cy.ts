import { generateValidCNPJ, generateValidCPF } from './utils/document-helper';
describe('Gestão de Diárias e Reflexos', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `admin_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Admin_${timestamp}`,
  };

  let validCNPJ = '';
  let validCPF1 = '';
  let validCPF2 = '';

  before(() => {
    validCNPJ = generateValidCNPJ();
    validCPF1 = generateValidCPF();
    validCPF2 = generateValidCPF();
    
    cy.clearCookies();
    cy.window().then((win) => win.localStorage.clear());
    
    // 1. Registrar
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
  });

  it('CT-001: Deve configurar ambiente criando cliente via Wizard com funcionários', () => {
    cy.intercept('GET', '**/api/clientes').as('getClientes');
    cy.intercept('GET', '**/api/v1/localidades/estados/*/municipios*').as('getMunicipios');
    cy.intercept('POST', '**/api/clientes-completos').as('createClienteCompleto');
    cy.intercept('POST', '**/api/contratos/calculos/calcular-valor-total').as('calcTotal');

    cy.visit('/clientes/criar-completo');

    // Passo 1: Cliente
    cy.get('[data-cy="wizard-cliente-nome"]').type('Cliente Diarias Test');
    cy.get('[data-cy="wizard-cliente-cnpj"]').type(generateValidCNPJ());
    cy.get('[data-cy="wizard-cliente-estado"]').select('SP');
    cy.wait('@getMunicipios');
    cy.get('[data-cy="wizard-cliente-cidade"]').select('São Paulo');
    cy.get('[data-cy="wizard-cliente-ideal"]').clear().type('2');
    cy.get('[data-cy="wizard-cliente-horario"]').type('06:00');
    cy.get('[data-cy="wizard-next-step"]').click();

    // Passo 2: Contrato
    cy.get('[data-cy="wizard-criar-contrato"]').check();
    cy.wait(500);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    cy.get('#dataInicio').clear().type(tomorrow.toISOString().split('T')[0]);
    cy.get('[data-cy="wizard-modo-personalizado"]').check();
    cy.get('[data-cy="wizard-numero-postos"]').clear().type('1');
    cy.get('[data-cy="wizard-posto-tipo-0"]').select('ESCALA_12X36');
    cy.get('[data-cy="wizard-next-step"]').click();

    // Passo 3: Funcionários
    cy.get('button').contains('Adicionar Funcionário').click();
    cy.get('input[formControlName="nome"]').last().type('Funcionario X');
    cy.get('input[formControlName="cpf"]').last().type(validCPF1);
    cy.get('input[formControlName="celular"]').last().type('11999999999');
    cy.get('select[formControlName="tipoFuncionario"]').last().select('CLT');
    
    cy.get('button').contains('Adicionar Funcionário').click();
    cy.get('input[formControlName="nome"]').last().type('Funcionario Z (Substituto)');
    cy.get('input[formControlName="cpf"]').last().type(validCPF2);
    cy.get('input[formControlName="celular"]').last().type('11988888888');
    cy.get('select[formControlName="tipoFuncionario"]').last().select('CLT');

    cy.wait('@calcTotal', { timeout: 10000 });
    cy.get('[data-cy="wizard-submit"]').click();

    cy.wait('@createClienteCompleto').then((int) => {
      expect(int.response?.statusCode, `Response body: ${JSON.stringify(int.response?.body)}`).to.be.oneOf([200, 201]);
    });
  });

  it('CT-002: Deve alterar diária para FALTA e registrar SUBSTITUICAO', () => {
    // 1. Ir para a tela de diárias (Cronograma)
    cy.visit('/diarias');

    // Interceptar
    cy.intercept('PUT', '**/api/diarias/*').as('updateDiaria');
    cy.intercept('POST', '**/api/diarias').as('createSubstituicao');

    // Mudar view mode para diário se não estiver
    cy.get('button.view-btn').first().click();
    
    // Criar uma diária manualmente para o Funcionario X (caso a auto-geração atrase)
    cy.contains('Nova Diária').click({ force: true });
    
    // Preencher a diária Regular
    cy.get('[data-testid="diaria-funcionario"]').find('option').contains('Funcionario X').then(option => {
      cy.get('[data-testid="diaria-funcionario"]').select(option.val() as string, { force: true });
    });
    cy.get('[data-testid="diaria-alocacao"]').select(1);
    
    const today = new Date().toISOString().split('T')[0];
    cy.get('[data-testid="diaria-data"]').type(today);
    cy.get('[data-testid="diaria-status"]').select('CONFIRMADA', { force: true });
    cy.get('select[formControlName="tipoDiaria"]').select('REGULAR', { force: true });
    cy.intercept('POST', '**/api/diarias').as('createDiaria');
    cy.get('[data-testid="btn-save-diaria"]').click({ force: true });
    cy.wait('@createDiaria');
    
    // Agora que foi criada, vamos alterar para Falta
    cy.get('.diaria-card').contains('Funcionario X').parents('.diaria-card').as('diariaX');
    cy.wrap('Funcionario X').as('faltanteName');

    // Registrar Falta: clicar no botão de editar (ícone lápis)
    cy.get('@diariaX').find('button.btn-edit').click({ force: true });

    // No modal, alterar o status para Falta
    cy.get('[data-testid="diaria-status"]').select('FALTA_INJUSTIFICADA', { force: true });
    cy.get('[data-testid="btn-save-diaria"]').click({ force: true });
    cy.wait('@updateDiaria').its('response.statusCode').should('be.oneOf', [200, 204]);

    // Validar visualmente
    cy.get('@diariaX').find('.badge').contains('Falta').should('exist');

    // Registrar Substituição
    cy.contains('Nova Diária').click({ force: true });

    // Preencher substituição (usar o Funcionario Z)
    cy.get('[data-testid="diaria-funcionario"]').find('option').contains('Funcionario Z (Substituto)').then(option => {
      cy.get('[data-testid="diaria-funcionario"]').select(option.val() as string, { force: true });
    });
    // O select de alocação deve ser o mesmo do posto que foi criado no CT-001 (que tem "ESCALA_12X36")
    cy.get('[data-testid="diaria-alocacao"]').select(1); // seleciona a primeira alocação da lista
    
    // Configurar a data (usar a de hoje ou do form)
    cy.get('[data-testid="diaria-data"]').type(today);
    
    // Status Confirmada
    cy.get('[data-testid="diaria-status"]').select('CONFIRMADA', { force: true });
    
    // Tipo Substituição
    cy.get('select[formControlName="tipoDiaria"]').select('SUBSTITUICAO', { force: true });
    
    // Salvar
    cy.get('[data-testid="btn-save-diaria"]').click({ force: true });
    cy.wait('@createSubstituicao').its('response.statusCode').should('be.oneOf', [200, 201]);

    // Validar se Substituição apareceu
    cy.visit('/diarias');
    cy.contains('.diaria-card', 'Funcionario Z (Substituto)').find('.badge').contains('Substituição').should('exist');
  });

  it('CT-003: Deve refletir falta e substituição nos detalhes do contrato e funcionario', () => {
    // 1. Dashboard
    cy.visit('/dashboard');

    // 2. Funcionario Detail (Faltante)
    cy.visit('/funcionarios');
    cy.contains('.employee-card', 'Funcionario X').find('.btn-view').click({ force: true });
    // Verifica se "Faltas Registradas" é 1
    cy.contains('.metric-label', 'Faltas Registradas').siblings('.metric-value').should('contain', '1');

    // 3. Funcionario Detail (Substituto)
    cy.visit('/funcionarios');
    cy.contains('.employee-card', 'Funcionario Z (Substituto)').find('.btn-view').click({ force: true });
    cy.contains('.metric-label', 'Diárias Confirmadas').siblings('.metric-value').should('contain', '1');
  });
});
