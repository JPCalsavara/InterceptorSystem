import { PostoDetailComponent } from './posto-detail.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { DiariaService } from '../../../services/diaria.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { StatusContrato } from '../../../models';

describe('PostoDetailComponent', () => {
  const mockPosto = {
    id: 'p1',
    clienteId: 'c1',
    contratoId: 'ct1',
    nome: 'Portaria Principal',
    cidade: 'São Paulo',
    endereco: 'Rua Direita'
  };

  const mockPostoService = {
    getById: () => of(mockPosto)
  };

  const mockClienteService = {
    getById: () => of({ id: 'c1', nome: 'Cliente A' })
  };

  const mockContratoService = {
    getAll: () => of([{ id: 'ct1', clienteId: 'c1', status: StatusContrato.ATIVO, descricao: 'Contrato A' }])
  };

  const mockAlocacaoService = {
    getByPostoId: () => of([])
  };

  const mockDiariaService = {
    getAll: () => of([])
  };

  const mockFuncionarioService = {
    getAll: () => of([])
  };

  const providers = [
    provideRouter([]),
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => 'p1' } } }
    }
  ];

  it('Desktop: renderiza os detalhes do posto', () => {
    cy.mount(PostoDetailComponent, { providers });
    cy.get('h1').should('contain', 'Posto de Trabalho');
    cy.get('.horario-badge').should('contain', 'Portaria Principal');
    cy.get('.meta-item, .info-value, p, span').should('contain', 'Cliente A');
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(PostoDetailComponent, { providers });
    cy.get('.detail-header, .page-header').should('be.visible');
  });
});
