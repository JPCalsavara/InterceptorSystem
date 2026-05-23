import { ClientePostosComponent } from './cliente-postos.component';
import { provideRouter } from '@angular/router';

describe('ClientePostosComponent', () => {
  const providers = [provideRouter([])];

  it('Exibe painel vazio para postos', () => {
    cy.mount(ClientePostosComponent, {
      providers,
      componentProperties: {
        clienteId: '1',
        postos: [],
        alocacoes: [],
        postosMaisFaltas: [],
        periodoLabel: 'Mensal'
      }
    });

    cy.get('.section-postos .empty-state').should('contain', 'Nenhum posto cadastrado');
  });

  it('Exibe lista de postos quando houver', () => {
    cy.mount(ClientePostosComponent, {
      providers,
      componentProperties: {
        clienteId: '1',
        postos: [{ id: 'p1', nome: 'Posto Alpha', cidade: 'SP', estado: 'SP' } as any],
        alocacoes: [],
        postosMaisFaltas: [],
        periodoLabel: 'Mensal'
      }
    });

    cy.get('.posto-card').should('have.length', 1);
    cy.get('.posto-header h3').should('contain', 'Posto Alpha');
  });
});
