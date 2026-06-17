import { generateValidCNPJ, generateValidCPF } from './utils/document-helper';
describe('Simulação Visual - Criação Completa e Diárias em Lote', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `simulacao_${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `Simulador_${timestamp}`,
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
  });

  it('Deve executar todo o fluxo: Criar Cliente, Contrato, 2 Funcionarios e Diárias', () => {
    // 1. Acessa o Wizard de Criação Completa
    cy.visit('/clientes/criar-completo');

    // PASSO 1: Cliente
    cy.get('[data-cy="wizard-cliente-nome"]').type('Construtora Visual S/A');
    cy.get('[data-cy="wizard-cliente-cnpj"]').type(validCNPJ);
    cy.get('[data-cy="wizard-cliente-estado"]').select('SP');
    cy.intercept('GET', '**/api/v1/localidades/estados/*/municipios*').as('getMunicipios');
    cy.wait('@getMunicipios', { timeout: 10000 });
    cy.get('[data-cy="wizard-cliente-cidade"]').select('São Paulo');
    cy.get('[data-cy="wizard-cliente-ideal"]').clear().type('2');
    cy.get('[data-cy="wizard-cliente-horario"]').type('06:00');

    // Avançar para Contratos
    cy.get('[data-cy="wizard-next-step"]').click();

    // PASSO 2: Contrato e Alocação (Posto)
    cy.get('[data-cy="wizard-criar-contrato"]').check();
    cy.get('[data-cy="wizard-modo-personalizado"]').check();
    cy.get('[data-cy="wizard-numero-postos"]').clear().type('1');
    cy.get('[data-cy="wizard-posto-tipo-0"]').select('ESCALA_12X36');
    cy.get('[formControlName="quantidadeFuncionariosPorAlocacao"]').clear().type('2');

    // Avançar para Funcionários
    cy.get('[data-cy="wizard-next-step"]').click();

    // PASSO 3: Funcionários
    // Adiciona o primeiro funcionário (Turno A)
    cy.get('button.btn-secondary').contains('Adicionar Funcionário').click();
    cy.get('.funcionario-card').eq(0).within(() => {
      cy.get('[formControlName="nome"]').type('Carlos Vigilante');
      cy.get('[formControlName="cpf"]').type(generateValidCPF());
      cy.get('[formControlName="celular"]').type('11999999999');
      cy.get('[formControlName="tipoFuncionario"]').select('CLT'); // CLT
      cy.get('[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS'); // 12x36
      cy.get('[formControlName="statusFuncionario"]').select('ATIVO'); // ATIVO
    });

    // Adiciona o segundo funcionário (Turno A)
    cy.get('button.btn-secondary').contains('Adicionar Funcionário').click();
    cy.get('.funcionario-card').eq(1).within(() => {
      cy.get('[formControlName="nome"]').type('Roberto Segurança');
      cy.get('[formControlName="cpf"]').type(generateValidCPF());
      cy.get('[formControlName="celular"]').type('11977777777');
      cy.get('[formControlName="tipoFuncionario"]').select('CLT'); // CLT
      cy.get('[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS'); // 12x36
      cy.get('[formControlName="statusFuncionario"]').select('ATIVO'); // ATIVO
    });

    // Adiciona o terceiro funcionário (Turno B - Folguista)
    cy.get('button.btn-secondary').contains('Adicionar Funcionário').click();
    cy.get('.funcionario-card').eq(2).within(() => {
      cy.get('[formControlName="nome"]').type('Marcos Folguista');
      cy.get('[formControlName="cpf"]').type(generateValidCPF());
      cy.get('[formControlName="celular"]').type('11988888888');
      cy.get('[formControlName="tipoFuncionario"]').select('CLT'); // CLT
      cy.get('[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS'); // 12x36
      cy.get('[formControlName="statusFuncionario"]').select('ATIVO'); // ATIVO
    });

    // Adiciona o quarto funcionário (Turno B - Folguista)
    cy.get('button.btn-secondary').contains('Adicionar Funcionário').click();
    cy.get('.funcionario-card').eq(3).within(() => {
      cy.get('[formControlName="nome"]').type('Lucas Cobertura');
      cy.get('[formControlName="cpf"]').type(generateValidCPF());
      cy.get('[formControlName="celular"]').type('11966666666');
      cy.get('[formControlName="tipoFuncionario"]').select('CLT'); // CLT
      cy.get('[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS'); // 12x36
      cy.get('[formControlName="statusFuncionario"]').select('ATIVO'); // ATIVO
    });

    // Finaliza o Wizard
    cy.intercept('POST', '**/api/clientes-completos').as('createClienteCompleto');
    cy.get('[data-cy="wizard-submit"]').click();
    cy.wait('@createClienteCompleto', { timeout: 15000 });
    
    // Aguarda um momento visual
    cy.wait(2000);

    // 2. Fluxo de Diárias Múltiplas (Batch)
    cy.visit('/diarias/batch');

    cy.intercept('GET', '**/api/clientes').as('getClientes');
    cy.wait('@getClientes');

    // Selecionar o cliente (deve ser o índice 1, após o placeholder)
    cy.get('[formControlName="clienteId"]').find('option').eq(1).then($opt => {
        cy.get('[formControlName="clienteId"]').select($opt.val() as string);
    });

    // Selecionar contrato
    cy.get('[formControlName="contratoId"]').find('option').eq(1).then($opt => {
        cy.get('[formControlName="contratoId"]').select($opt.val() as string);
    });

    // Selecionar alocação
    cy.get('[formControlName="alocacaoId"]').find('option').eq(1).then($opt => {
        cy.get('[formControlName="alocacaoId"]').select($opt.val() as string);
    });

    // Preencher as datas - Removido pois o batch pega do contrato

    
    // Selecionar primeiro funcionário (Turno A) e lançar
    cy.get('[formControlName="funcionarioId"]').find('option').eq(1).then($opt => {
        cy.get('[formControlName="funcionarioId"]').select($opt.val() as string);
    });

    // Dia de partida (Turno A)
    cy.get('input[type="radio"][value="TRABALHA"]').check({ force: true });

    cy.intercept('POST', '**/api/diarias/lote').as('postDiarias1');
    cy.get('button[type="submit"]').contains('Gerar Diárias').click();
    cy.wait('@postDiarias1', { timeout: 10000 });
    cy.wait(1000);

    // Selecionar segundo funcionário (Turno A) e lançar
    cy.get('[formControlName="funcionarioId"]').find('option').eq(2).then($opt => {
        cy.get('[formControlName="funcionarioId"]').select($opt.val() as string);
    });
    
    // Dia de partida (Turno A) - Garante que está como trabalha
    cy.get('input[type="radio"][value="TRABALHA"]').check({ force: true });

    cy.intercept('POST', '**/api/diarias/lote').as('postDiarias2');
    cy.get('button[type="submit"]').contains('Gerar Diárias').click();
    cy.wait('@postDiarias2', { timeout: 10000 });
    cy.wait(1000);

    // Selecionar terceiro funcionário (Turno B) e lançar
    cy.get('[formControlName="funcionarioId"]').find('option').eq(3).then($opt => {
        cy.get('[formControlName="funcionarioId"]').select($opt.val() as string);
    });

    // Dia de partida para FOLGA (Turno B)
    cy.get('input[type="radio"][value="FOLGA"]').check({ force: true });

    cy.intercept('POST', '**/api/diarias/lote').as('postDiarias3');
    cy.get('button[type="submit"]').contains('Gerar Diárias').click();
    cy.wait('@postDiarias3', { timeout: 10000 });
    cy.wait(1000);

    // Selecionar quarto funcionário (Turno B) e lançar
    cy.get('[formControlName="funcionarioId"]').find('option').eq(4).then($opt => {
        cy.get('[formControlName="funcionarioId"]').select($opt.val() as string);
    });

    // Dia de partida para FOLGA (Turno B)
    cy.get('input[type="radio"][value="FOLGA"]').check();

    cy.intercept('POST', '**/api/diarias/lote').as('postDiarias4');
    cy.get('button[type="submit"]').contains('Gerar Diárias').click();
    cy.wait('@postDiarias4', { timeout: 10000 });

    // Ir para a tela de diárias para visualizar
    cy.visit('/diarias');
    cy.get('table').should('exist');
    cy.contains('Carlos Vigilante').should('exist');
    cy.contains('Roberto Segurança').should('exist');
    cy.contains('Marcos Folguista').should('exist');
    cy.contains('Lucas Cobertura').should('exist');
  });
});
