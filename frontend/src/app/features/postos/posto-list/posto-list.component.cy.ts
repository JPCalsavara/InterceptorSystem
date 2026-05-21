import { PostoListComponent } from './posto-list.component';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { DiariaService } from '../../../services/diaria.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusContrato } from '../../../models';

describe('PostoListComponent', () => {
  const mockPostos = [
    {
      id: 'p1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'Portaria Principal',
      cidade: 'São Paulo',
      endereco: 'Rua A, 123'
    }
  ];

  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [{ id: 'ct1', clienteId: 'c1', descricao: 'Contrato A', status: StatusContrato.ATIVO }];

  const mockPostoService = {
    getAll: () => of(mockPostos),
    delete: () => of({})
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const mockDiariaService = {
    getAll: () => of([])
  };

  const mockAlocacaoService = {
    getAll: () => of([])
  };

  const providers = [
    provideRouter([]),
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: AlocacaoService, useValue: mockAlocacaoService }
  ];

  it('Desktop: renderiza a lista de postos corretamente', () => {
    cy.mount(PostoListComponent, { providers });
    cy.get('h1').should('contain', 'Postos de Trabalho');
    cy.get('.posto-card, .card, .employee-card, tbody tr').should('have.length', 1);
    cy.get('.posto-card, .card, .employee-card, tbody tr').first().should('contain', 'Portaria Principal');
  });

  it('Desktop: deleta posto e exibe mensagem de sucesso', () => {
    cy.mount(PostoListComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('.posto-card, .card, .employee-card, tbody tr').first().find('.btn-danger, [title="Excluir"]').click();
    cy.get('.toast-success, .alert-success').should('be.visible').and('contain', 'Posto excluído');
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(PostoListComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
