import { DiariaDetailComponent } from './diaria-detail.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusDiaria, TipoDiaria } from '../../../models';

describe('DiariaDetailComponent', () => {
  const mockDiaria = {
    id: 'd1',
    funcionarioId: 'f1',
    alocacaoId: 'a1',
    data: '2026-05-20',
    statusDiaria: StatusDiaria.CONFIRMADA,
    tipoDiaria: TipoDiaria.REGULAR
  };

  const mockFuncionario = { id: 'f1', nome: 'João Diarista' };
  const mockAlocacao = { id: 'a1', postoId: 'p1', horarioInicio: '08:00:00', horarioFim: '18:00:00' };
  const mockPosto = { id: 'p1', clienteId: 'c1', nome: 'Posto Central' };
  const mockCliente = { id: 'c1', nome: 'Cliente A' };

  const mockDiariaService = {
    getById: () => of(mockDiaria),
    delete: () => of({})
  };

  const mockFuncionarioService = {
    getById: () => of(mockFuncionario)
  };

  const mockAlocacaoService = {
    getById: () => of(mockAlocacao)
  };

  const mockPostoService = {
    getById: () => of(mockPosto)
  };

  const mockClienteService = {
    getById: () => of(mockCliente)
  };

  const providers = [
    provideRouter([{ path: 'diarias', component: DiariaDetailComponent }]),
    { provide: DiariaService, useValue: mockDiariaService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: { get: () => 'd1' } } }
    }
  ];

  it('Desktop: renderiza os detalhes da diaria', () => {
    cy.mount(DiariaDetailComponent, { providers });
    cy.get('h1').should('contain', 'Detalhes da Diária');
    
    // Verifica atributos renderizados
    cy.get('.info-group, p, span').should('contain', 'João Diarista');
    cy.get('.info-group, p, span').should('contain', '20/05/2026');
    cy.get('.info-group, p, span').should('contain', 'Confirmada');
    cy.get('.info-group, p, span').should('contain', 'Regular');
    cy.get('.info-group, p, span').should('contain', 'Posto Central');
  });

  it('Desktop: deleta diaria pelo detalhe', () => {
    cy.mount(DiariaDetailComponent, { providers });
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('button.btn-danger').click();
  });

  it('Mobile: ajusta o layout para mobile', () => {
    cy.viewport(320, 568);
    cy.mount(DiariaDetailComponent, { providers });
    cy.get('.detail-container').should('be.visible');
  });
});
