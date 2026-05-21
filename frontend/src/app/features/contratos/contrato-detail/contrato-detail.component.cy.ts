import { ContratoDetailComponent } from './contrato-detail.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { DiariaService } from '../../../services/diaria.service';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('ContratoDetailComponent', () => {
  const mockContratoService = {
    getById: () => of({
      id: '1',
      clienteId: 'c1',
      descricao: 'Contrato Alfa',
      dataInicio: '2025-01-01',
      dataFim: '2028-01-01',
      status: 'ATIVO',
      tags: [],
      postosConfig: [
        {
          id: 'p1',
          tipoPosto: 'ESCALA_12X36',
          quantidadeAlocacoes: 1,
          quantidadeFuncionariosPorAlocacao: 2,
          valorDiariaCobrada: 200,
          valorBeneficiosExtrasMensal: 100
        }
      ]
    })
  };

  const mockClienteService = { getById: () => of({ id: 'c1', nome: 'Cliente A' }) };
  const mockFuncionarioService = { getByClienteId: () => of([]) };
  const mockPostoService = { getByClienteId: () => of([]) };
  const mockAlocacaoService = { getByContratoId: () => of([]) };
  const mockDiariaService = { getResumoFinanceiroByContrato: () => of(null) };
  
  const mockCalculoService = {
    calcularValorTotal: () => of({ valorTotalMensal: 10000, custoBaseMensal: 5000, valorMargemLucro: 2000 }),
    simularSemAlocacoes: () => of({ custoBaseMensal: 5000, faturamentoSimulado: 10000 })
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '1' // Modo Detalhe
      }
    }
  };

  const providers = [
    provideRouter([]),
    DatePipe,
    { provide: ActivatedRoute, useValue: mockActivatedRoute },
    { provide: ContratoService, useValue: mockContratoService },
    { provide: ContratoCalculoService, useValue: mockCalculoService },
    { provide: ClienteService, useValue: mockClienteService },
    { provide: FuncionarioService, useValue: mockFuncionarioService },
    { provide: PostoService, useValue: mockPostoService },
    { provide: AlocacaoService, useValue: mockAlocacaoService },
    { provide: DiariaService, useValue: mockDiariaService }
  ];

  it('Desktop: renderiza o detalhe do contrato', () => {
    cy.mount(ContratoDetailComponent, { providers });
    cy.get('.contrato-title').should('contain', 'Contrato Alfa');
    cy.get('.info-value').should('contain', 'Cliente A');
    cy.get('.cards-grid').should('be.visible');
  });

  it('Mobile: ajusta o layout', () => {
    cy.viewport(320, 568);
    cy.mount(ContratoDetailComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
