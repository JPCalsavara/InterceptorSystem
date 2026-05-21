import { AlocacaoListComponent } from './alocacao-list.component';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { TipoEscala, StatusContrato } from '../../../models';

describe('AlocacaoListComponent', () => {
  const mockAlocacoes = [
    {
      id: 'a1',
      postoId: 'p1',
      contratoId: 'ct1',
      horarioInicio: '08:00:00',
      horarioFim: '18:00:00',
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      temHorarioNoturno: false,
      permiteDobrarEscala: true
    }
  ];

  const mockPostos = [{ id: 'p1', clienteId: 'c1', nome: 'Portaria Principal' }];
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [{ id: 'ct1', clienteId: 'c1', descricao: 'Contrato A', status: StatusContrato.ATIVO }];

  const mockAlocacaoService = {
    getAll: () => of(mockAlocacoes),
    delete: () => of({})
  };

  const mockPostoService = {
    getAll: () => of(mockPostos)
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const providers = [
    provideRouter([]),
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService }
  ];

  it('Desktop: renderiza a lista de alocacoes corretamente', () => {
    cy.mount(AlocacaoListComponent, { providers });
    cy.get('.page-header h1').should('contain', 'Alocações');
    cy.get('.alocacao-card, .card, tbody tr').should('have.length', 1);
    cy.get('.alocacao-card, .card, tbody tr').first().should('contain', '08:00').and('contain', '18:00');
  });

  it('Desktop: deleta alocacao', () => {
    cy.mount(AlocacaoListComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('.alocacao-card, .card, tbody tr').first().find('.btn-danger, [title="Excluir"]').click();
    // não há mensagem de sucesso explícita no componente, ele apenas chama loadData
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(AlocacaoListComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
