import { AlocacaoDetailComponent } from './alocacao-detail.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { TipoEscala } from '../../../models';

describe('AlocacaoDetailComponent', () => {
  const mockAlocacao = {
    id: 'a1',
    postoId: 'p1',
    contratoId: 'ct1',
    horarioInicio: '08:00:00',
    horarioFim: '18:00:00',
    tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
    permiteDobrarEscala: true,
    temHorarioNoturno: false
  };

  const mockPosto = { id: 'p1', clienteId: 'c1', nome: 'Portaria Principal' };
  const mockCliente = { id: 'c1', nome: 'Cliente A' };

  const mockAlocacaoService = {
    getById: () => of(mockAlocacao)
  };

  const mockPostoService = {
    getById: () => of(mockPosto)
  };

  const mockClienteService = {
    getById: () => of(mockCliente)
  };

  const mockDiariaService = {
    getAll: () => of([])
  };

  const mockFuncionarioService = {
    getAll: () => of([])
  };

  const providers = [
    provideRouter([]),
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => 'a1' } } }
    }
  ];

  it('Desktop: renderiza os detalhes da alocacao', () => {
    cy.mount(AlocacaoDetailComponent, { providers });
    cy.get('h1').should('contain', 'Turno: 08:00').and('contain', '18:00');

  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(AlocacaoDetailComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
