import { PostoTiposComponent } from './posto-tipos.component';

describe('PostoTiposComponent', () => {
  it('Exibe distribuição de tipos', () => {
    cy.mount(PostoTiposComponent, {
      componentProperties: {
        diariasPorTipo: [
          { tipo: 'Regular', count: 10, icon: 'R' },
          { tipo: 'Dobra', count: 2, icon: 'D' }
        ]
      }
    });

    cy.get('.tipo-card').should('have.length', 2);
    cy.get('.tipo-label').contains('Regular');
    cy.get('.tipo-count').contains('10');
  });
});
