import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ContratoCalculoService } from './contrato-calculo.service';
import { Contrato, ContratoResumoFinanceiro, StatusContrato } from '../models';
import {
  CalculoValorTotalInput,
  CalculoValorTotalOutput,
  SimulacaoFinanceiraMensalInput,
} from '../models/contrato-calculo.models';
import { buildCalculoValorTotalInput as buildCalculoValorTotalInputHelper } from '../shared/helpers/contrato-calculo.helper';

@Injectable({ providedIn: 'root' })
export class ContratoFinanceiroUiService {
  private readonly DIARIAS_POR_FUNCIONARIO_MES_BASE = 15;
  private calculoService = inject(ContratoCalculoService);

  private normalizarPercentualContrato(valor: number | null | undefined): number {
    const safe = Number(valor ?? 0);
    if (!Number.isFinite(safe) || safe < 0) return 0;
    return safe > 1 ? safe / 100 : safe;
  }

  buildCalculoValorTotalInput(
    contrato: Contrato,
    resumoFinanceiro?: ContratoResumoFinanceiro | null,
  ): CalculoValorTotalInput {
    const numeroDePostos = Math.max(1, contrato.numeroDePostos || 1);
    const funcionariosContrato = Math.max(1, contrato.quantidadeFuncionarios || 1);

    const input = buildCalculoValorTotalInputHelper(
      {
        postos: [
          {
            tipoPosto: 'PERSONALIZADO',
            quantidadeAlocacoes: numeroDePostos,
            quantidadeFuncionariosPorAlocacao: funcionariosContrato,
            alocacoesNoturnas: 0,
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
        PERSONALIZADO: {
          label: 'Personalizado',
          alocacoes: numeroDePostos,
          funcionariosPorAlocacao: funcionariosContrato,
          alocacoesNoturnas: 0,
          diasTrabalhadosPorFuncMes: this.DIARIAS_POR_FUNCIONARIO_MES_BASE,
          operaFimDeSemana: true,
        },
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
      input.diariasFdsMes = Math.max(0, resumoFinanceiro.totalDiariasExtras);
      input.diariasFeriadosMes = 0;
      input.funcionariosEstimados = Math.max(1, contrato.quantidadeFuncionarios || 1);
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
  ): Observable<Map<string, CalculoValorTotalOutput>> {
    const contratosFiltrados = contratos.filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosFiltrados.length === 0) {
      return of(new Map<string, CalculoValorTotalOutput>());
    }

    const requests = contratosFiltrados.map((contrato) =>
      this.calculoService
        .calcularValorTotal(
          this.buildCalculoValorTotalInput(contrato, resumosFinanceiros.get(contrato.id)),
        )
        .pipe(catchError(() => of(null))),
    );

    return forkJoin(requests).pipe(
      map((resultados) => {
        const novoMapa = new Map<string, CalculoValorTotalOutput>();
        resultados.forEach((resultado: CalculoValorTotalOutput | null, index: number) => {
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
    calculosDetalhados: Map<string, CalculoValorTotalOutput>,
  ): number {
    return calculosDetalhados.get(contrato.id)?.valorTotalMensal ?? contrato.valorTotalMensal;
  }

  getCustoDetalhado(
    contrato: Contrato,
    calculosDetalhados: Map<string, CalculoValorTotalOutput>,
  ): number {
    return calculosDetalhados.get(contrato.id)?.custoBaseMensal ?? contrato.custoRealMensal ?? 0;
  }

  getLucroDetalhado(
    contrato: Contrato,
    calculosDetalhados: Map<string, CalculoValorTotalOutput>,
  ): number {
    const calculo = calculosDetalhados.get(contrato.id);
    if (calculo) {
      return calculo.valorTotalMensal - calculo.custoBaseMensal;
    }
    return contrato.lucroRealMensal ?? 0;
  }
}
