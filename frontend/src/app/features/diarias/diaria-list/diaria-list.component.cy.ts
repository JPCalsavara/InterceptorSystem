import { DiariaListComponent } from './diaria-list.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FeriadosService } from '../../../services/feriados.service';
import { StatusDiaria, TipoDiaria } from '../../../models';

describe('DiariaListComponent', () => {
  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const mockDiarias = [
    {
      id: 'd1',
      alocacaoId: 'a1',
      funcionarioId: 'f1',
      data: getToday(),
      statusDiaria: StatusDiaria.CONFIRMADA,
      tipoDiaria: TipoDiaria.REGULAR
    }
  ];

  const mockFuncionarios = [{ id: 'f1', nome: 'João Diarista' }];
  const mockPostos = [{ id: 'p1', clienteId: 'c1', nome: 'Posto Central' }];
  const mockClientes = [{ id: 'c1', nome: 'Cliente A' }];
  const mockAlocacoes = [{ id: 'a1', postoId: 'p1' }];

  const mockDiariaService = {
    getAll: () => of(mockDiarias),
    getByClienteId: () => of(mockDiarias),
    delete: () => of({})
  };

  const mockFuncionarioService = {
    getAll: () => of(mockFuncionarios),
    getByClienteId: () => of(mockFuncionarios)
  };

  const mockPostoService = {
    getAll: () => of(mockPostos),
    getByClienteId: () => of(mockPostos)
  };

  const mockClienteService = {
    getAll: () => of(mockClientes)
  };

  const mockAlocacaoService = {
    getAll: () => of(mockAlocacoes),
    getByClienteId: () => of(mockAlocacoes)
  };

  const mockFeriadosService = {
    getDayCellClasses: () => ({}),
    getFeriadoNome: () => null
  };

  const providers = [
    provideRouter([]),
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: FeriadosService, useValue: mockFeriadosService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => null } } }
    }
  ];

  it('Desktop: renderiza a lista de diarias corretamente na view daily', () => {
    cy.mount(DiariaListComponent, { providers });
    cy.get('h1').should('contain', 'Diárias');
    cy.get('.diaria-card').should('have.length', 1);
    cy.get('.diaria-card').first().should('contain', 'João Diarista');
  });

  it('Desktop: deleta diaria e exibe mensagem de sucesso', () => {
    cy.mount(DiariaListComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('.diaria-card').first().find('.btn-danger, [title="Excluir"]').click();
    cy.get('.toast-success, .alert-success').should('be.visible').and('contain', 'Diária excluída');
  });

  it('Mobile: ajusta o layout para telas pequenas', () => {
    cy.viewport(320, 568);
    cy.mount(DiariaListComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
