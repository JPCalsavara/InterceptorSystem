import { ClienteListComponent } from './cliente-list.component';
import { provideRouter } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { of, throwError } from 'rxjs';
import { Cliente } from '../../../models/cliente.model';

describe('ClienteListComponent', () => {
  const mockClientes: Cliente[] = [
    {
      id: '1',
      nome: 'Cliente Alpha',
      cnpj: '11.111.111/0001-11',
      cidade: 'São Paulo',
      estado: 'SP',
      ativo: true,
      emailGestor: 'alpha@email.com',
      telefoneEmergencia: '11999999999'
    },
    {
      id: '2',
      nome: 'Cliente Beta',
      cnpj: '22.222.222/0001-22',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      ativo: false,
      emailGestor: 'beta@email.com',
      telefoneEmergencia: '21999999999'
    }
  ];

  const mockService = {
    getAll: () => of(mockClientes),
    delete: (id: string) => of({}),
    forceRefresh: () => of(mockClientes.filter(c => c.id !== '1'))
  };

  const providers = [
    provideRouter([]),
    { provide: ClienteService, useValue: mockService }
  ];

  it('Desktop: renderiza a lista de clientes corretamente', () => {
    cy.mount(ClienteListComponent, { providers });
    cy.get('h1').should('contain', 'Clientes');
    cy.get('[data-cy="cliente-card-title"]').should('have.length', 2);
    cy.get('[data-cy="cliente-card-title"]').first().should('contain', 'Cliente Alpha');
  });

  it('Desktop: navega para criação de cliente', () => {
    cy.mount(ClienteListComponent, { providers });
    cy.get('[data-cy="btn-new-cliente"]').should('be.visible').and('not.be.disabled');
  });

  it('Desktop: deleta cliente e exibe sucesso', () => {
    cy.mount(ClienteListComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['service'], 'delete').as('deleteSpy');
      // Stub the native confirm dialog to return true
      cy.stub(window, 'confirm').returns(true);
    });

    cy.get('[data-cy="btn-delete-cliente-1"]').click();
    cy.get('@deleteSpy').should('have.been.calledWith', '1');
    cy.get('.alert-success').should('contain', 'sucesso');
    // After force refresh, only 1 client should remain based on our mock
    cy.get('[data-cy="cliente-card-title"]').should('have.length', 1);
  });

  it('Desktop: exibe mensagem de lista vazia', () => {
    const emptyMockService = {
      getAll: () => of([])
    };
    cy.mount(ClienteListComponent, {
      providers: [
        provideRouter([]),
        { provide: ClienteService, useValue: emptyMockService }
      ]
    });
    cy.get('.empty-state').should('be.visible').and('contain', 'Nenhum cliente cadastrado');
  });

  it('Mobile: ajusta o layout das divs e botoes', () => {
    cy.viewport(320, 568);
    cy.mount(ClienteListComponent, { providers });
    cy.get('.cards-grid').should('have.css', 'display', 'grid'); // Grid adjusts in mobile via CSS
    cy.get('[data-cy="btn-new-cliente"]').should('have.css', 'width').and('not.eq', '0px');
  });
});
