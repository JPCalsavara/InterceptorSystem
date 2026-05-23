import { FuncionarioPostosComponent } from './funcionario-postos.component';

describe('FuncionarioPostosComponent', () => {
  it('Exibe postos corretamente', () => {
    cy.mount(FuncionarioPostosComponent, {
      componentProperties: {
        diariasPorPosto: [
          { posto: { id: 'p1', nome: 'Posto Alpha', cidade: 'SP' }, total: 5 }
        ]
      }
    });

    cy.get('.posto-card').should('have.length', 1);
    cy.get('.posto-horario').should('contain', 'Posto Alpha - SP');
    cy.get('.posto-total').should('contain', '5 diárias');
  });

  it('Não exibe seção quando array for vazio', () => {
    cy.mount(FuncionarioPostosComponent, {
      componentProperties: {
        diariasPorPosto: []
      }
    });

    cy.get('.postos-section').should('not.exist');
  });
});
