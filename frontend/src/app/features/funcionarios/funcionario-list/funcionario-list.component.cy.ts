import { FuncionarioListComponent } from './funcionario-list.component';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StatusFuncionario, TipoFuncionario, TipoEscala } from '../../../models';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { TagService } from '../../../services/tag.service';

describe('FuncionarioListComponent', () => {
  const mockFuncionarios = [
    {
      id: 'f1',
      clienteId: 'c1',
      contratoId: 'ct1',
      nome: 'João da Silva',
      cpf: '111.111.111-11',
      status: StatusFuncionario.ATIVO,
      tipoFuncionario: TipoFuncionario.CLT,
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      tags: [{ id: 't1', nome: 'Líder' }]
    }
  ];

  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockContratos = [{ id: 'ct1', valorDiariaCobrada: 150, valorBeneficiosExtrasMensal: 300 }];
  const mockTags = [{ id: 't1', nome: 'Líder' }];

  const mockFuncionarioService = {
    getAll: () => of(mockFuncionarios),
    delete: () => of({})
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockContratoService = {
    getAll: () => of(mockContratos)
  };

  const mockTagService = {
    getAll: () => of(mockTags)
  };

  const providers = [
    provideRouter([]),
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: TagService, useValue: mockTagService }
  ];

  it('Desktop: renderiza a lista de funcionarios corretamente', () => {
    cy.mount(FuncionarioListComponent, { providers });
    cy.get('h1').should('contain', 'Funcionários');
    cy.get('.employee-card').should('have.length', 1);
    cy.get('.employee-card').first().should('contain', 'João da Silva');
  });

  it('Desktop: deleta funcionario e exibe mensagem de sucesso', () => {
    cy.mount(FuncionarioListComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    // Seletor que assume a existência de um botão de exclusão
    cy.get('.employee-card').first().find('.btn-danger, [title="Excluir"]').click();
    cy.get('.toast-success, .alert-success').should('be.visible').and('contain', 'Funcionário excluído');
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(FuncionarioListComponent, { providers });
    cy.get('.page-header').should('be.visible');
    cy.get('.cards-grid').should('be.visible');
  });
});
