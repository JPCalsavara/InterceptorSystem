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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Retorna a data no formato 'YYYY-MM-DD' com offset de `dayOffset` em relação
 * ao primeiro dia do mês atual.
 */
const toIso = (date: Date) => date.toISOString().split('T')[0];

const primeiroDiaMesAtual = (): string => {
  const d = new Date();
  d.setDate(1);
  return toIso(d);
};

const diaEspecificoMesAtual = (dia: number): string => {
  const d = new Date();
  d.setDate(dia);
  return toIso(d);
};

const umAnoDepois = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return toIso(d);
};

// ─── Mock base do contrato ───────────────────────────────────────────────────

const BASE_CONTRATO = {
  id: '1',
  clienteId: 'c1',
  descricao: 'Contrato Teste',
  status: 'ATIVO',
  tags: [],
  numeroDePostos: 1,
  quantidadeFuncionarios: 1,
  valorDiariaCobrada: 100,
  valorBeneficiosExtrasMensal: 350,
  percentualEncargosProvisoes: 0.5,
  percentualAdicionalNoturno: 0.2,
  percentualAdicionalFimSemana: 1.0,
  margemLucroPercentual: 0.15,
  margemCoberturaFaltasPercentual: 0.10,
};

// ─── Mocks de serviços ───────────────────────────────────────────────────────

const mockClienteService = { getById: () => of({ id: 'c1', nome: 'Cliente 1' }) };
const mockFuncionarioService = { getByClienteId: () => of([{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }]) };
const mockPostoService = { getByClienteId: () => of([]) };
const mockAlocacaoService = {
  getByContratoId: () => of([
    { id: 'al1', temHorarioNoturno: false },
    { id: 'al2', temHorarioNoturno: true },
  ])
};

const RESUMO_FINANCEIRO_MOCK = {
  contratoId: '1',
  ano: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  totalDiariasNormais: 5,
  totalDiariasExtras: 0,
  totalDiariasFimDeSemana: 8,
  mediaSalarialDiurna: 350,
  mediaSalarialNoturna: 0,
  custoRealDiariasNormais: 500,
  custoRealDiariasExtras: 0,
  custoRealTotal: 1300,
  projecaoCustoPorPosto: [],
  projecaoCustoPorAlocacao: [
    { alocacaoId: 'al1', tipoEscala: 'DOZE_POR_TRINTA_SEIS', temHorarioNoturno: false, totalDiarias: 5, custoTotal: 500, diariasNormais: 5, diariasExtras: 0 },
    { alocacaoId: 'al2', tipoEscala: 'DOZE_POR_TRINTA_SEIS', temHorarioNoturno: true, totalDiarias: 8, custoTotal: 800, diariasNormais: 8, diariasExtras: 0 },
  ],
  projecaoCustoPorFuncionario: [],
};

const mockDiariaService = {
  getResumoFinanceiroByContrato: () => of(RESUMO_FINANCEIRO_MOCK)
};

// Breakdown de retorno da API de cálculo com diárias noturnas
const BREAKDOWN_MOCK = {
  valorTotalMensal: 8437.50,
  custoBaseMensal: 7590,
  custoDireto: 5060,
  custoDiariasNormais: 500,
  custoAdicionalNoturno: 1560,
  custoDiariasFimSemana: 1600,
  valorImpostos: 2530,
  valorMargemLucro: 1138.50,
  valorMargemFaltas: 759,
  valorBeneficios: 1400,
  diariasTotaisMes: 13,
  diariasNoturnasMes: 8,
  diariasFdsMes: 8,
  diariasFeriadosMes: 0,
  funcionariosEstimados: 4,
  funcionariosProjetados: 4,
  custoTotalBeneficios: 1400,
};

// Simulação mês cheio (22 dias úteis)
const SIMULACAO_MES_CHEIO = {
  numeroDePostos: 1,
  alocacoesTotais: 2,
  alocacoesNoturnas: 1,
  funcionariosPorAlocacao: 1,
  diariasPorDia: 2,
  diariasNoturnasPorDia: 1,
  diariasUteisMes: 44,
  diariasFimSemanaMes: 16,
  diariasFeriadosMes: 0,
  diariasTotaisMes: 60,
  custoDiariasNormais: 2200,
  custoAdicionalNoturno: 2640,
  custoDiariasFimSemana: 3200,
  funcionariosProjetados: 4,
  custoTotalBeneficios: 1400,
  custoTotalMensal: 9440,
  valorImpostos: 4720,
  custoBaseMensal: 14160,
  valorMargemLucro: 2124,
  valorMargemFaltas: 1416,
  faturamentoSimulado: 17700,
};

// Simulação meses parciais (10 dias úteis + 4 fins de semana = ~meado de mês)
const SIMULACAO_MES_PARCIAL = {
  ...SIMULACAO_MES_CHEIO,
  diariasUteisMes: 20,
  diariasFimSemanaMes: 8,
  diariasTotaisMes: 28,
  custoDiariasNormais: 1000,
  custoAdicionalNoturno: 1200,
  custoDiariasFimSemana: 1600,
  funcionariosProjetados: 2,
  custoTotalBeneficios: 700,
  custoTotalMensal: 4500,
  valorImpostos: 2250,
  custoBaseMensal: 6750,
  valorMargemLucro: 1012.50,
  valorMargemFaltas: 675,
  faturamentoSimulado: 8437.50,
};

const mockActivatedRoute = {
  snapshot: { paramMap: { get: () => '1' } }
};

const baseProviders = [
  provideRouter([]),
  DatePipe,
  { provide: ActivatedRoute, useValue: mockActivatedRoute },
  { provide: ClienteService, useValue: mockClienteService },
  { provide: FuncionarioService, useValue: mockFuncionarioService },
  { provide: PostoService, useValue: mockPostoService },
  { provide: AlocacaoService, useValue: mockAlocacaoService },
  { provide: DiariaService, useValue: mockDiariaService },
];

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('ContratoDetailComponent', () => {

  // ─── Cenário 1: Mês cheio (dataInicio = 1º do mês corrente ou anterior) ───

  describe('Mês cheio (contrato começa no 1º dia do mês)', () => {
    beforeEach(() => {
      cy.mount(ContratoDetailComponent, {
        providers: [
          ...baseProviders,
          { provide: ContratoService, useValue: { getById: () => of({ ...BASE_CONTRATO, dataInicio: primeiroDiaMesAtual(), dataFim: umAnoDepois() }) } },
          {
            provide: ContratoCalculoService, useValue: {
              calcularValorTotal: () => of(BREAKDOWN_MOCK),
              simularSemAlocacoes: () => of(SIMULACAO_MES_CHEIO),
            }
          },
        ]
      });
    });

    it('renderiza informações gerais do contrato', () => {
      cy.get('.contrato-title').should('contain', 'Contrato Teste');
      cy.get('.cards-grid').should('be.visible');
    });

    it('exibe Relatório Simulado com 44 diárias úteis (22 dias × 2/dia)', () => {
      cy.get('[data-cy="simulado-etapa1"]').should('be.visible');
      cy.get('[data-cy="simulado-total-diarias"]').should('contain', '60');
      cy.get('[data-cy="simulado-diarias-uteis"]').should('contain', '44');
      cy.get('[data-cy="simulado-diarias-fds"]').should('contain', '16');
    });

    it('exibe custo total simulado para mês cheio', () => {
      cy.get('[data-cy="simulado-custo-total"]').invoke('text').should('match', /14[.,]160/);
    });

    it('exibe faturamento simulado', () => {
      cy.get('[data-cy="simulado-faturamento"]').invoke('text').should('match', /17[.,]700/);
    });

    it('exibe Relatório Real com faturamento igual ao simulado', () => {
      cy.get('[data-cy="real-faturamento"]').invoke('text').should('match', /17[.,]700/);
      cy.get('[data-cy="real-custo-total"]').invoke('text').should('match', /7[.,]590/);
    });

    it('exibe adicional noturno real calculado via fallback de alocações', () => {
      // 8 diárias noturnas no resumo → custoAdicionalNoturno = R$1.560
      cy.get('[data-cy="real-adicional-noturno"]').invoke('text').should('match', /1[.,]560/);
    });

    it('exibe médias salariais reais do resumo financeiro', () => {
      cy.get('[data-cy="salario-diurno-real"]').invoke('text').should('match', /350/);
      cy.get('[data-cy="variacao-salario-diurno"]').should('be.visible');
      cy.get('[data-cy="variacao-salario-noturno"]').should('be.visible');
    });
  });

  // ─── Cenário 2: Mês parcial (contrato começa dia 18 do mês corrente) ──────

  describe('Mês parcial (contrato começa no meio do mês corrente)', () => {
    beforeEach(() => {
      cy.mount(ContratoDetailComponent, {
        providers: [
          ...baseProviders,
          { provide: ContratoService, useValue: { getById: () => of({ ...BASE_CONTRATO, dataInicio: diaEspecificoMesAtual(18), dataFim: umAnoDepois() }) } },
          {
            provide: ContratoCalculoService, useValue: {
              calcularValorTotal: () => of(BREAKDOWN_MOCK),
              simularSemAlocacoes: () => of(SIMULACAO_MES_PARCIAL),
            }
          },
        ]
      });
    });

    it('renderiza informações gerais com data de início correta', () => {
      cy.get('.contrato-title').should('contain', 'Contrato Teste');
      cy.get('.info-value').should('contain', 'Cliente 1');
    });

    it('exibe Relatório Simulado com 20 diárias úteis (10 dias úteis × 2/dia — pro-rata)', () => {
      cy.get('[data-cy="simulado-etapa1"]').should('be.visible');
      cy.get('[data-cy="simulado-total-diarias"]').should('contain', '28');
      cy.get('[data-cy="simulado-diarias-uteis"]').should('contain', '20');
      cy.get('[data-cy="simulado-diarias-fds"]').should('contain', '8');
    });

    it('exibe custo total simulado proporcional ao período parcial', () => {
      // Pro-rata: ~R$6.750 em vez de R$14.160 do mês cheio
      cy.get('[data-cy="simulado-custo-total"]').invoke('text').should('match', /6[.,]750/);
    });

    it('custo simulado parcial é menor do que o custo do mês cheio (14.160)', () => {
      cy.get('[data-cy="simulado-custo-total"]').invoke('text').then((text) => {
        // extrai valor numérico
        const valor = parseFloat(text.replace(/[^0-9,]/g, '').replace(',', '.'));
        expect(valor).to.be.lessThan(14160);
      });
    });

    it('exibe faturamento simulado proporcional', () => {
      cy.get('[data-cy="simulado-faturamento"]').invoke('text').should('match', /8[.,]437/);
    });

    it('relatório real reflete dados parciais do mês', () => {
      cy.get('[data-cy="real-faturamento"]').invoke('text').should('match', /8[.,]437/);
      cy.get('[data-cy="real-custo-total"]').invoke('text').should('match', /7[.,]590/);
    });

    it('adicional noturno real aparece quando há alocações noturnas (fallback)', () => {
      cy.get('[data-cy="real-adicional-noturno"]').invoke('text').should('match', /1[.,]560/);
    });
  });

  // ─── Cenário 3: Responsividade ───────────────────────────────────────────

  describe('Responsividade', () => {
    beforeEach(() => {
      cy.mount(ContratoDetailComponent, {
        providers: [
          ...baseProviders,
          { provide: ContratoService, useValue: { getById: () => of({ ...BASE_CONTRATO, dataInicio: primeiroDiaMesAtual(), dataFim: umAnoDepois() }) } },
          {
            provide: ContratoCalculoService, useValue: {
              calcularValorTotal: () => of(BREAKDOWN_MOCK),
              simularSemAlocacoes: () => of(SIMULACAO_MES_CHEIO),
            }
          },
        ]
      });
    });

    it('Mobile: page-header visível em 320px', () => {
      cy.viewport(320, 568);
      cy.get('.page-header').should('be.visible');
    });

    it('Desktop: cards-grid visível em 1280px', () => {
      cy.viewport(1280, 800);
      cy.get('.cards-grid').should('be.visible');
    });
  });
});
