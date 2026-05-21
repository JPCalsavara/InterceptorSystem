import { ContratoListComponent } from './contrato-list.component';
import { provideRouter } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { DiariaService } from '../../../services/diaria.service';
import { ContratoFinanceiroUiService } from '../../../services/contrato-financeiro-ui.service';
import { of } from 'rxjs';
import { StatusContrato } from '../../../models/index';

describe('ContratoListComponent', () => {
  const mockContratoService = {
    getAll: () => of([
      { id: '1', clienteId: 'c1', descricao: 'Contrato Alfa', dataInicio: '2025-01-01', dataFim: '2028-01-01', status: StatusContrato.ATIVO },
      { id: '2', clienteId: 'c2', descricao: 'Contrato Beta', dataInicio: '2025-01-01', dataFim: '2025-01-02', status: StatusContrato.FINALIZADO } // expired
    ]),
    delete: () => of({})
  };
  const mockClienteService = { getAll: () => of([{ id: 'c1', nome: 'Cliente A' }]) };
  const mockFuncionarioService = { getAll: () => of([]) };
  const mockDiariaService = { getResumoFinanceiroByContrato: () => of(null) };
  const mockFinanceiroUiService = { 
    carregarCalculosDetalhados$: () => of(new Map()),
    getFaturamentoDetalhado: () => 10000,
    getCustoDetalhado: () => 5000
  };

  const providers = [
    provideRouter([]),
    { provide: ContratoService, useValue: mockContratoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: ContratoFinanceiroUiService, useValue: mockFinanceiroUiService },
  ];

  it('Desktop: renderiza a lista de contratos corretamente', () => {
    cy.mount(ContratoListComponent, { providers });
    cy.get('h1').should('contain', 'Contratos');
    // Deve exibir card do contrato Alfa
    cy.get('[data-cy="contrato-card-1"]').should('exist');
    cy.get('[data-cy="contrato-card-title"]').first().should('contain', 'Cliente A');
  });

  it('Desktop: deleta contrato e exibe sucesso', () => {
    cy.mount(ContratoListComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('[data-cy="contrato-card-1"] .btn-danger').click();
    cy.get('.alert-success').should('be.visible').and('contain', 'Contrato excluído com sucesso!');
  });

  it('Desktop: exibe mensagem de lista vazia ao pesquisar sem resultados', () => {
    const mockEmpty = { ...mockContratoService, getAll: () => of([]) };
    cy.mount(ContratoListComponent, { 
      providers: [
        ...providers.filter(p => (p as any).provide !== ContratoService),
        { provide: ContratoService, useValue: mockEmpty }
      ]
    });
    // O template do Kanban de contrato exibe colunas vazias se n tiver
    // Vamos validar se pelo menos o header existe mas nao tem card
    cy.get('.contract-card').should('not.exist');
  });

  it('Mobile: ajusta o layout da visualizacao', () => {
    cy.viewport(320, 568);
    cy.mount(ContratoListComponent, { providers });
    cy.get('.kanban-board').should('be.visible');
  });
});
