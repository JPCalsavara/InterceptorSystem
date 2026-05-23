import { ClienteDetailComponent } from './cliente-detail.component';
import { provideRouter } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ContratoService } from '../../../services/contrato.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { DiariaService } from '../../../services/diaria.service';
import { TagService } from '../../../services/tag.service';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

describe('ClienteDetailComponent', () => {
  const mockClienteService = {
    getById: () => of({
      id: '1',
      nome: 'Cliente Alpha',
      cnpj: '11.111.111/0001-11',
      cidade: 'São Paulo',
      estado: 'SP',
      ativo: true,
      emailGestor: 'gestor@alpha.com'
    })
  };

  const mockPostoService = { getByClienteId: () => of([]) };
  const mockFuncionarioService = { getByClienteId: () => of([]) };
  const mockContratoService = { getByClienteId: () => of([]) };
  const mockAlocacaoService = { getByClienteId: () => of([]) };
  const mockDiariaService = { getByClienteId: () => of([]) };
  const mockTagService = { getResumoByCliente: () => of([]) };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '1'
      }
    }
  };

  const providers = [
    provideRouter([]),
    { provide: ActivatedRoute, useValue: mockActivatedRoute },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: TagService, useValue: mockTagService },
    DatePipe
  ];

  it('Desktop: renderiza o detalhe do cliente corretamente', () => {
    cy.mount(ClienteDetailComponent, { providers });
    
    // The loading spinner goes away and content renders
    cy.get('h1').should('contain', 'Cliente Alpha');
    cy.get('.meta-item').should('contain', '11.111.111/0001-11');
    cy.get('.meta-item').should('contain', 'São Paulo - SP');
    cy.get('.stat-value').should('contain', 'gestor@alpha.com');
  });



  it('Mobile: ajusta o layout das sessões de métricas', () => {
    cy.viewport(320, 568);
    cy.mount(ClienteDetailComponent, { providers });
    cy.get('.metrics-grid').should('have.css', 'display', 'grid');
  });
});
