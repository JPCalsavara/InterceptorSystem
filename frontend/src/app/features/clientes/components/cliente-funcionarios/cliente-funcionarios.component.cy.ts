import { ClienteFuncionariosComponent } from './cliente-funcionarios.component';
import { provideRouter } from '@angular/router';

describe('ClienteFuncionariosComponent', () => {
  const providers = [provideRouter([])];

  it('Exibe painel vazio para funcionários', () => {
    cy.mount(ClienteFuncionariosComponent, {
      providers,
      componentProperties: {
        clienteId: '1',
        funcionarios: [],
        diarias: [],
        salariosPorFuncionario: new Map()
      }
    });

    cy.get('.section-funcionarios .empty-state').should('contain', 'Nenhum funcionário cadastrado');
  });

  it('Exibe lista de funcionários', () => {
    const salarios = new Map<string, number>();
    salarios.set('f1', 1500);

    cy.mount(ClienteFuncionariosComponent, {
      providers,
      componentProperties: {
        clienteId: '1',
        funcionarios: [{ id: 'f1', nome: 'João', cpf: '123', tipoFuncionario: 'CLT', statusFuncionario: 'ATIVO' } as any],
        diarias: [],
        salariosPorFuncionario: salarios
      }
    });

    cy.get('.data-table tbody tr').should('have.length', 1);
    cy.get('.data-table').should('contain', 'João');
    cy.get('.data-table').should('contain', 'R$ 1.500,00'); // Note: NBSP might be tricky to test perfectly, assuming generic match
  });
});
