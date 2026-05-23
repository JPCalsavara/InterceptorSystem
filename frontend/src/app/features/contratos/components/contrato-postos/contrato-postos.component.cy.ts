import { ContratoPostosComponent } from './contrato-postos.component';
import { provideRouter } from '@angular/router';

describe('ContratoPostosComponent', () => {
  const providers = [provideRouter([])];

  it('Exibe painel vazio para postos', () => {
    cy.mount(ContratoPostosComponent, {
      providers,
      componentProperties: {
        postos: [],
        alocacoes: [],
        quantidadeFuncionarios: 2
      }
    });

    cy.get('.empty-state').should('contain', 'Nenhum posto de trabalho vinculado ainda.');
  });

  it('Exibe lista de postos quando houver', () => {
    cy.mount(ContratoPostosComponent, {
      providers,
      componentProperties: {
        postos: [{ id: 'p1', nome: 'Posto Alpha', cidade: 'SP', estado: 'SP' } as any],
        alocacoes: [{ id: 'a1', postoId: 'p1' } as any],
        quantidadeFuncionarios: 5
      }
    });

    cy.get('.postos-table tbody tr').should('have.length', 1);
    cy.get('.postos-table').should('contain', 'Posto Alpha');
    cy.get('.postos-table').should('contain', '1'); // 1 alocacao
    cy.get('.postos-table').should('contain', '5'); // capacidade
  });
});
