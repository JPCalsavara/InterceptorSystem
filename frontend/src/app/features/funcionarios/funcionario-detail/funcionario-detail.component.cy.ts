import { FuncionarioDetailComponent } from './funcionario-detail.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StatusFuncionario, TipoFuncionario, TipoEscala } from '../../../models';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { DiariaService } from '../../../services/diaria.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';

describe('FuncionarioDetailComponent', () => {
  const mockFuncionario = {
    id: 'f1',
    clienteId: 'c1',
    contratoId: 'ct1',
    nome: 'João Edit',
    cpf: '11111111111',
    celular: '11999999999',
    statusFuncionario: StatusFuncionario.ATIVO,
    tipoFuncionario: TipoFuncionario.CLT,
    tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
    tags: [{ id: 't1', nome: 'Tag 1' }]
  };

  const mockFuncionarioService = {
    getById: () => of(mockFuncionario)
  };

  const mockClienteService = {
    getById: () => of({ id: 'c1', nome: 'Cliente A' })
  };

  const mockContratoService = {
    getById: () => of({ id: 'ct1', descricao: 'Contrato Alfa' })
  };

  const mockDiariaService = {
    getAll: () => of([])
  };

  const mockAlocacaoService = {
    getAll: () => of([])
  };

  const mockPostoService = {
    getAll: () => of([])
  };

  const providers = [
    provideRouter([]),
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: PostoService, useValue: mockPostoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => 'f1' } } }
    }
  ];

  it('Desktop: renderiza os detalhes do funcionario', () => {
    cy.mount(FuncionarioDetailComponent, { providers });
    cy.get('h1').should('contain', 'João Edit');
    cy.get('.meta-item').should('contain', 'Cliente A');
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(FuncionarioDetailComponent, { providers });
    cy.get('.detail-header').should('be.visible');
  });
});
