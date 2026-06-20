import { getSafeTestPassword, registerTestUser, fillWizardClienteStep } from './utils/flow-helper';
import { generateValidCNPJ, generateValidCPF } from './utils/document-helper';
describe('Simulação Visual - Criação Completa e Diárias em Lote', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `simulacao_${timestamp}@example.com`,
    password: getSafeTestPassword(),
    username: `Simulador_${timestamp}`,
  };

  let validCNPJ = '';

  before(() => { validCNPJ = generateValidCNPJ(); registerTestUser(testUser, validCNPJ); });

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
  });

  it('Deve executar todo o fluxo: Criar Cliente, Contrato, 2 Funcionarios e Diárias', () => {
    // 1. Acessa o Wizard de Criação Completa
    cy.visit('/clientes/criar-completo');

    // PASSO 1: Cliente
    fillWizardClienteStep('Construtora Visual S/A', validCNPJ);

    // PASSO 2: Contrato e Alocação (Posto)
    cy.get('[data-cy="wizard-criar-contrato"]').check();
    cy.get('[data-cy="wizard-modo-personalizado"]').check();
    cy.get('[data-cy="wizard-numero-postos"]').clear().type('1');
    cy.get('[data-cy="wizard-posto-tipo-0"]').select('ESCALA_12X36');
    cy.get('[formControlName="quantidadeFuncionariosPorAlocacao"]').clear().type('2');

    // Avançar para Funcionários
    cy.get('[data-cy="wizard-next-step"]').click();

    // PASSO 3: Funcionários
    const adicionarFuncionario = (index: number, nome: string, celular: string) => {
      cy.get('button.btn-secondary').contains('Adicionar Funcionário').click();
      cy.get('.funcionario-card').eq(index).within(() => {
        cy.get('input[id^="nome-"]').type(nome);
        cy.get('input[id^="cpf-"]').type(generateValidCPF());
        cy.get('input[id^="celular-"]').type(celular);
        cy.get('[formControlName="tipoFuncionario"]').select('CLT'); // CLT
        cy.get('[formControlName="tipoEscala"]').select('DOZE_POR_TRINTA_SEIS'); // 12x36
        cy.get('[formControlName="statusFuncionario"]').select('ATIVO'); // ATIVO
      });
    };

    adicionarFuncionario(0, 'Carlos Vigilante', '11999999999');
    adicionarFuncionario(1, 'Roberto Segurança', '11977777777');
    adicionarFuncionario(2, 'Marcos Folguista', '11988888888');
    adicionarFuncionario(3, 'Lucas Cobertura', '11966666666');

    // Finaliza o Wizard
    cy.intercept('POST', '**/api/clientes-completos', (req) => { req.continue(); Cypress.backend("writeFile", {contents: JSON.stringify(req.body, null, 2), filePath: "payload.json"}); }).as('createClienteCompleto');
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

    const gerarDiariaFuncionario = (index: number, isTrabalha: boolean) => {
      cy.get('[formControlName="funcionarioId"]').find('option').eq(index).then($opt => {
          cy.get('[formControlName="funcionarioId"]').select($opt.val() as string);
      });

      const value = isTrabalha ? 'TRABALHA' : 'FOLGA';
      cy.get(`input[type="radio"][value="${value}"]`).check({ force: true });

      cy.intercept('POST', '**/api/diarias/lote').as(`postDiarias${index}`);
      cy.get('button[type="submit"]').contains('Gerar Diárias').click();
      cy.wait(`@postDiarias${index}`, { timeout: 10000 });
      cy.wait(1000);
    };

    // Selecionar primeiro funcionário (Turno A) e lançar
    gerarDiariaFuncionario(1, true);

    // Selecionar segundo funcionário (Turno A) e lançar
    gerarDiariaFuncionario(2, true);

    // Selecionar terceiro funcionário (Turno B) e lançar
    gerarDiariaFuncionario(3, false);

    // Selecionar quarto funcionário (Turno B) e lançar
    gerarDiariaFuncionario(4, false);

    // Ir para a tela de diárias para visualizar
    cy.visit('/diarias');
    cy.get('table').should('exist');
    cy.contains('Carlos Vigilante').should('exist');
    cy.contains('Roberto Segurança').should('exist');
    cy.contains('Marcos Folguista').should('exist');
    cy.contains('Lucas Cobertura').should('exist');
  });
});
