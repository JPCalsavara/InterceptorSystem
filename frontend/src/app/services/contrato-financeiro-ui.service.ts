import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ContratoCalculoService } from './contrato-calculo.service';
import { Contrato, ContratoResumoFinanceiro, StatusContrato } from '../models';
import {
  CalculoFinanceiroDetalhadoOutput,
  CalculoValorTotalInput,
  SimulacaoFinanceiraMensalInput,
} from '../models/contrato-calculo.models';
import {
  TipoPostoCalculoConfig,
  buildCalculoValorTotalInput as buildCalculoValorTotalInputHelper,
  resolverTipoPostoConfig,
} from '../shared/helpers/contrato-calculo.helper';

@Injectable({ providedIn: 'root' })
export class ContratoFinanceiroUiService {
  private readonly DIARIAS_POR_FUNCIONARIO_MES_BASE = 15;
  private readonly TIPO_POSTO_CONFIGS: Record<string, TipoPostoCalculoConfig> = {
    ESCALA_12X36: {
      label: '12x36',
      alocacoes: 2,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 15,
      operaFimDeSemana: true,
    },
    ESCALA_12X36_DUPLA: {
      label: '12x36 dupla',
      alocacoes: 2,
      funcionariosPorAlocacao: 2,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 15,
      operaFimDeSemana: true,
    },
    ESCALA_8H_3TURNOS: {
      label: '8h 3 turnos',
      alocacoes: 3,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 24,
      operaFimDeSemana: true,
    },
    ESCALA_5X2_DIURNO: {
      label: '5x2 diurno',
      alocacoes: 1,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 0,
      diasTrabalhadosPorFuncMes: 22,
      operaFimDeSemana: false,
    },
    ESCALA_24H_UNICO: {
      label: '24h unico',
      alocacoes: 1,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 15,
      operaFimDeSemana: true,
    },
    PERSONALIZADO: {
      label: 'Personalizado',
      alocacoes: 2,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 15,
      operaFimDeSemana: true,
    },
  };
  private calculoService = inject(ContratoCalculoService);

  private inferirTipoPostoContrato(contrato: Contrato): string {
    const contratoComTipo = contrato as Contrato & { tipoPosto?: string | null };
    return contratoComTipo.tipoPosto ?? 'PERSONALIZADO';
  }

  private normalizarPercentualContrato(valor: number | null | undefined): number {
    const safe = Number(valor ?? 0);
    if (!Number.isFinite(safe) || safe < 0) return 0;
    return safe > 1 ? safe / 100 : safe;
  }

  buildCalculoValorTotalInput(
    contrato: Contrato,
    resumoFinanceiro?: ContratoResumoFinanceiro | null,
    funcionariosReais?: number,
  ): CalculoValorTotalInput {
    const numeroDePostos = Math.max(1, contrato.numeroDePostos || 1);
    const funcionariosContrato = Math.max(
      1,
      (funcionariosReais ?? contrato.quantidadeFuncionarios) || 1,
    );
    const tipoPosto = this.inferirTipoPostoContrato(contrato);
    const tipoPostoConfig = resolverTipoPostoConfig(tipoPosto, this.TIPO_POSTO_CONFIGS);

    const input = buildCalculoValorTotalInputHelper(
      {
        postos: [
          {
            tipoPosto,
            quantidadeAlocacoes: numeroDePostos,
            quantidadeFuncionariosPorAlocacao: funcionariosContrato,
            alocacoesNoturnas: tipoPostoConfig.alocacoesNoturnas,
          },
        ],
        valorDiariaCobrada: contrato.valorDiariaCobrada || 0,
        valorBeneficiosExtrasMensal: contrato.valorBeneficiosExtrasMensal || 0,
        percentualEncargosProvisoes: contrato.percentualEncargosProvisoes || 0,
        percentualAdicionalNoturno: this.normalizarPercentualContrato(
          contrato.percentualAdicionalNoturno,
        ),
        percentualAdicionalFimSemana: this.normalizarPercentualContrato(
          contrato.percentualAdicionalFimSemana,
        ),
        margemLucroPercentual: this.normalizarPercentualContrato(contrato.margemLucroPercentual),
        margemCoberturaFaltasPercentual: this.normalizarPercentualContrato(
          contrato.margemCoberturaFaltasPercentual,
        ),
      },
      {
        ...this.TIPO_POSTO_CONFIGS,
      },
    );

    if (resumoFinanceiro) {
      input.diariasTotaisMes = Math.max(
        0,
        resumoFinanceiro.totalDiariasNormais + resumoFinanceiro.totalDiariasExtras,
      );
      input.diariasNoturnasMes = resumoFinanceiro.projecaoCustoPorAlocacao
        .filter((alocacao) => alocacao.temHorarioNoturno)
        .reduce((total: number, alocacao) => total + (alocacao.totalDiarias || 0), 0);
      input.diariasFdsMes = Math.max(0, resumoFinanceiro.totalDiariasFimDeSemana || 0);
      input.diariasFeriadosMes = 0;
      input.funcionariosEstimados = funcionariosContrato;
    }

    return input;
  }

  buildSimulacaoInput(contrato: Contrato): SimulacaoFinanceiraMensalInput {
    const numeroDePostos = Math.max(1, contrato.numeroDePostos || 1);
    const funcionariosContrato = Math.max(1, contrato.quantidadeFuncionarios || 1);
    const alocacoesPorPosto = 2;

    return {
      valorDiaria: contrato.valorDiariaCobrada || 0,
      numeroDePostos,
      percentualAdicionalNoturno: this.normalizarPercentualContrato(
        contrato.percentualAdicionalNoturno,
      ),
      percentualAdicionalFimSemana: this.normalizarPercentualContrato(
        contrato.percentualAdicionalFimSemana,
      ),
      alocacoesPorPosto,
      funcionariosPorAlocacao: Math.max(1, Math.ceil(funcionariosContrato / alocacoesPorPosto)),
      diasTrabalhadosPorFuncionarioMes: this.DIARIAS_POR_FUNCIONARIO_MES_BASE,
      valorBeneficioMensalPorFuncionario: contrato.valorBeneficiosExtrasMensal || 0,
      percentualEncargosProvisoes: this.normalizarPercentualContrato(
        contrato.percentualEncargosProvisoes,
      ),
      margemLucroPercentual: this.normalizarPercentualContrato(contrato.margemLucroPercentual),
      margemCoberturaFaltasPercentual: this.normalizarPercentualContrato(
        contrato.margemCoberturaFaltasPercentual,
      ),
    };
  }

  carregarCalculosDetalhados$(
    contratos: Contrato[],
    resumosFinanceiros = new Map<string, ContratoResumoFinanceiro>(),
    funcionariosReaisPorCliente = new Map<string, number>(),
  ): Observable<Map<string, CalculoFinanceiroDetalhadoOutput>> {
    const contratosFiltrados = contratos.filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosFiltrados.length === 0) {
      return of(new Map<string, CalculoFinanceiroDetalhadoOutput>());
    }

    const requests = contratosFiltrados.map((contrato) =>
      forkJoin({
        real: this.calculoService
          .calcularValorTotal(
            this.buildCalculoValorTotalInput(
              contrato,
              resumosFinanceiros.get(contrato.id),
              funcionariosReaisPorCliente.get(contrato.clienteId),
            ),
          )
          .pipe(catchError(() => of(null))),
        simulacao: this.calculoService
          .simularSemAlocacoes(this.buildSimulacaoInput(contrato))
          .pipe(catchError(() => of(null))),
      }).pipe(
        map(({ real, simulacao }) => {
          if (real === null) {
            return null;
          }

          const faturamentoSimulado = simulacao?.faturamentoSimulado ?? real.valorTotalMensal;

          return {
            ...real,
            faturamentoSimulado,
            custoTotalMensalSimulado: simulacao?.custoTotalMensal,
            simulacao,
          } as CalculoFinanceiroDetalhadoOutput;
        }),
      ),
    );

    return forkJoin(requests).pipe(
      map((resultados) => {
        const novoMapa = new Map<string, CalculoFinanceiroDetalhadoOutput>();
        resultados.forEach((resultado: CalculoFinanceiroDetalhadoOutput | null, index: number) => {
          if (resultado !== null) {
            novoMapa.set(contratosFiltrados[index].id, resultado);
          }
        });
        return novoMapa;
      }),
    );
  }

  getFaturamentoDetalhado(
    contrato: Contrato,
    calculosDetalhados: Map<string, CalculoFinanceiroDetalhadoOutput>,
  ): number {
    const calculo = calculosDetalhados.get(contrato.id);
    return calculo?.faturamentoSimulado ?? calculo?.valorTotalMensal ?? 0;
  }

  getCustoDetalhado(
    contrato: Contrato,
    calculosDetalhados: Map<string, CalculoFinanceiroDetalhadoOutput>,
  ): number {
    return calculosDetalhados.get(contrato.id)?.custoBaseMensal ?? 0;
  }

  getLucroDetalhado(
    contrato: Contrato,
    calculosDetalhados: Map<string, CalculoFinanceiroDetalhadoOutput>,
  ): number {
    const calculo = calculosDetalhados.get(contrato.id);
    if (calculo) {
      const faturamento = calculo.faturamentoSimulado ?? calculo.valorTotalMensal;
      return faturamento - calculo.custoBaseMensal;
    }
    return 0;
  }
}
