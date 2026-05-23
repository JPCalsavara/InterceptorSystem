import { PostoAlocacoesComponent } from './posto-alocacoes.component';

describe('PostoAlocacoesComponent', () => {
  it('Exibe alocações corretamente', () => {
    cy.mount(PostoAlocacoesComponent, {
      componentProperties: {
        alocacoes: [
          { 
            id: 'a1', 
            horarioInicio: '08:00', 
            horarioFim: '18:00', 
            tipoEscala: '12x36', 
            temHorarioNoturno: false, 
            permiteDobrarEscala: true 
          } as any
        ]
      }
    });

    cy.get('.alocacao-card').should('have.length', 1);
    cy.get('.horario').should('contain', '08:00 - 18:00');
    cy.get('.escala-badge').should('contain', '12x36');
  });

  it('Exibe estado vazio', () => {
    cy.mount(PostoAlocacoesComponent, {
      componentProperties: {
        alocacoes: []
      }
    });

    cy.get('.empty-state').should('contain', 'Nenhuma alocação');
  });
});
