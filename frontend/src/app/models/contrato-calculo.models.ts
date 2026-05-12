// DTOs para cálculo de valor total do contrato

export interface CalculoValorTotalInput {
  valorDiariaCobrada: number;
  diariasTotaisMes: number;
  diariasNoturnasMes: number;
  diariasFdsMes: number; // Separado: FDS (não inclusos no custo)
  diariasFeriadosMes: number; // Separado: Feriados (não inclusos no custo)
  funcionariosEstimados: number;
  valorBeneficiosExtrasMensal: number;
  percentualEncargosProvisoes: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
}

export interface CalculoValorTotalOutput {
  valorTotalMensal: number;
  custoBaseMensal: number;
  custoDiariasNormais: number;
  custoAdicionalNoturno: number;
  custoDiariasFimSemana: number;
  valorImpostos: number;
  valorMargemLucro: number;
  valorMargemFaltas: number;
  valorBeneficios: number;
  custoDireto: number;
  diariasTotaisMes: number;
  diariasNoturnasMes: number;
  diariasFdsMes: number; // Novo: Separado como RISCO
  diariasFeriadosMes: number; // Novo: Separado como RISCO
  funcionariosEstimados: number;
  funcionariosProjetados: number; // Novo
  custoTotalBeneficios: number; // Novo
  quantidadeFuncionarios?: number;
  quantidadeDiarias?: number;
}

export interface CalculoFinanceiroDetalhadoOutput extends CalculoValorTotalOutput {
  faturamentoSimulado?: number;
  custoTotalMensalSimulado?: number;
  simulacao?: SimulacaoFinanceiraMensalOutput | null;
}

export interface SimulacaoFinanceiraMensalInput {
  valorDiaria: number;
  numeroDePostos: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana?: number;
  alocacoesPorPosto?: number;
  funcionariosPorAlocacao?: number;
  diasUteisMes?: number;
  diasFimSemanaMes?: number;
  feriadosAno?: number;
  diasTrabalhadosPorFuncionarioMes?: number;
  valorBeneficioMensalPorFuncionario?: number;
  percentualEncargosProvisoes?: number;
  margemLucroPercentual?: number;
  margemCoberturaFaltasPercentual?: number;
}

export interface SimulacaoFinanceiraMensalOutput {
  numeroDePostos: number;
  alocacoesTotais: number;
  alocacoesNoturnas: number;
  funcionariosPorAlocacao: number;
  diariasPorDia: number;
  diariasNoturnasPorDia: number;
  diariasUteisMes: number;
  diariasFimSemanaMes: number;
  diariasFeriadosMes: number; // Separado como RISCO
  diariasTotaisMes: number;
  custoDiariasNormais: number;
  custoAdicionalNoturno: number;
  custoDiariasFimSemana: number;
  funcionariosProjetados: number; // Novo: Derivado do cálculo
  custoTotalBeneficios: number; // Novo: Custo total de benefícios
  custoTotalMensal: number;
  valorImpostos: number;
  custoBaseMensal: number;
  valorMargemLucro: number;
  valorMargemFaltas: number;
  faturamentoSimulado: number;
}
