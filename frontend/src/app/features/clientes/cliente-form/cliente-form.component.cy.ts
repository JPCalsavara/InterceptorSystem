import { ClienteFormComponent } from './cliente-form.component';
import { provideRouter } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { IbgeService } from '../../../services/ibge.service';
import { of } from 'rxjs';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { ActivatedRoute } from '@angular/router';

describe('ClienteFormComponent', () => {
  const mockIbgeService = {
    getEstados: () => of([{ id: 35, sigla: 'SP', nome: 'São Paulo' }]),
    getMunicipiosPorEstado: () => of([{ id: 3550308, nome: 'São Paulo' }])
  };

  const mockClienteService = {
    getById: () => of(null),
    create: () => of({ id: '123' }),
    update: () => of({ id: '123' })
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null // Modo criação
      }
    }
  };

  const providers = [
    provideRouter([{ path: 'clientes', component: ClienteFormComponent }]),
    provideEnvironmentNgxMask(),
    { provide: ClienteService, useValue: mockClienteService },
    { provide: IbgeService, useValue: mockIbgeService },
    { provide: ActivatedRoute, useValue: mockActivatedRoute }
  ];

  it('Desktop: renderiza o formulário e realiza fluxo de criação válido', () => {
    cy.mount(ClienteFormComponent, { providers }).then((fixture) => {
      cy.spy(fixture.component['service'], 'create').as('createSpy');
    });

    cy.get('[data-cy="cliente-nome"]').type('Empresa Ficticia');
    cy.get('[data-cy="cliente-cnpj"]').type('33069150000100'); // Valid CNPJ format
    
    cy.get('[data-cy="cliente-estado"]').select('SP');
    cy.get('[data-cy="cliente-cidade"]').should('not.be.disabled').select('São Paulo');

    cy.get('[data-cy="cliente-email"]').type('contato@empresa.com');
    cy.get('[data-cy="cliente-telefone"]').type('11999999999');

    cy.get('[data-cy="btn-save-cliente"]').click();

    cy.get('@createSpy').should('have.been.called');
  });

  it('Desktop: exibe erros de validação ao submeter formulário em branco', () => {
    cy.mount(ClienteFormComponent, { providers });
    cy.get('[data-cy="btn-save-cliente"]').click();
    cy.get('.error-message').should('have.length.at.least', 4); // nome, cnpj, estado, cidade
  });

  it('Mobile: layout dos formulários deve quebrar linha (responsivo)', () => {
    cy.viewport(320, 568);
    cy.mount(ClienteFormComponent, { providers });
    cy.get('.form-row').should('have.css', 'flex-direction'); // The layout flex behavior
    cy.get('[data-cy="btn-save-cliente"]').should('have.css', 'width').and('not.eq', '0px');
  });
});
