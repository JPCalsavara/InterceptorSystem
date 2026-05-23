import { FuncionarioMetricasComponent } from './funcionario-metricas.component';

describe('FuncionarioMetricasComponent', () => {
  it('Exibe as métricas corretamente', () => {
    cy.mount(FuncionarioMetricasComponent, {
      componentProperties: {
        totalDiarias: 10,
        diariasConfirmadas: 8,
        totalFaltas: 1,
        taxaPresenca: 80,
        prejuizoPorFaltas: 150,
        temContrato: true,
        salarioSimulado: 1200,
        salarioMesCompleto: 1500,
        totalCanceladas: 1,
        multaPorCancelamentos: 150
      }
    });

    cy.get('.metrics-grid').should('be.visible');
    cy.get('.metric-card').should('have.length', 9);
    cy.get('.metric-value').contains('10');
    cy.get('.metric-value').contains('8');
    cy.get('.metric-value').contains('80,0%');
  });
});
