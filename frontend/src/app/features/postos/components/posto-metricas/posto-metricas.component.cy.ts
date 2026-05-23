import { PostoMetricasComponent } from './posto-metricas.component';

describe('PostoMetricasComponent', () => {
  it('Renderiza todas as métricas', () => {
    cy.mount(PostoMetricasComponent, {
      componentProperties: {
        alocacoesLength: 5,
        totalDiarias: 100,
        diariasConfirmadas: 90,
        totalFaltas: 5,
        diariasCanceladas: 5,
        taxaPresenca: 90
      }
    });

    cy.get('.metric-card').should('have.length', 6);
    cy.get('.metric-value').contains('5');
    cy.get('.metric-value').contains('100');
    cy.get('.metric-value').contains('90');
    cy.get('.metric-value').contains('90,0%');
  });
});
