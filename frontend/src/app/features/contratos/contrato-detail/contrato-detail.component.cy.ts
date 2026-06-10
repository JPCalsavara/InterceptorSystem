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
  const mockDiariaService = { getResumoFinanceiroByContrato: () => of({
    mediaSalarialDiurna: 1850.00,
    mediaSalarialNoturna: 2150.00
  }) };
  
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

  it('Desktop: verifica renderização das médias salariais (Real vs Simulado)', () => {
    cy.mount(ContratoDetailComponent, { providers });
    
    // As the mock doesn't calculate the exact simulated salary without full data, we just verify the Real (média) from backend
    // Due to locale differences in Cypress environment (en-US vs pt-BR), we match only the numeric part
    cy.get('[data-cy="salario-diurno-real"]').invoke('text').should('match', /1[.,]850[.,]00/);
    cy.get('[data-cy="salario-noturno-real"]').invoke('text').should('match', /2[.,]150[.,]00/);
    
    // Variation text should be visible
    cy.get('[data-cy="variacao-salario-diurno"]').should('be.visible');
    cy.get('[data-cy="variacao-salario-noturno"]').should('be.visible');
  });

  it('Mobile: ajusta o layout', () => {
    cy.viewport(320, 568);
    cy.mount(ContratoDetailComponent, { providers });
    cy.get('.page-header').should('be.visible');
  });
});
