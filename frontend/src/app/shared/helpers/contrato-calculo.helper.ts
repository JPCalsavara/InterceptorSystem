import { CalculoValorTotalInput } from '../../models/contrato-calculo.models';

export const DIAS_UTEIS_PADRAO = 22;
export const DIAS_FIM_SEMANA_PADRAO = 8;
export const DIAS_TOTAL_MES_PADRAO = 30;

export interface TipoPostoCalculoConfig {
  label: string;
  alocacoes: number;
  funcionariosPorAlocacao: number;
  alocacoesNoturnas: number;
  diasTrabalhadosPorFuncMes: number;
  operaFimDeSemana: boolean;
}

export interface PostoCalculoInput {
  tipoPosto?: string | null;
  quantidadeAlocacoes?: number | null;
  quantidadeFuncionariosPorAlocacao?: number | null;
  alocacoesNoturnas?: number | null;
}

export interface CalculoContratoPercentuaisInput {
  percentualEncargosProvisoes: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
}

export interface ResumoPostoCalculo {
  tipoPosto: string;
  config: TipoPostoCalculoConfig;
  alocacoes: number;
  funcionariosPorAlocacao: number;
  alocacoesNoturnas: number;
  diariasPorDia: number;
  diariasNoturnasPorDia: number;
  diariasUteisMes: number;
  diariasFdsMes: number;
  diariasFeriadosMes: number;
  diariasTotaisMes: number;
  diariasNoturnasMes: number;
  funcionariosEstimados: number;
}

export interface ResumoCalculoContrato {
  postos: ResumoPostoCalculo[];
  totalAlocacoes: number;
  totalAlocacoesNoturnas: number;
  diariasPorDia: number;
  diariasNoturnasPorDia: number;
  diariasUteisMes: number;
  diariasFdsMes: number;
  diariasFeriadosMes: number;
  diariasTotaisMes: number;
  diariasNoturnasMes: number;
  funcionariosEstimados: number;
}

export interface PostoConfigAutoGerado {
  tipoPosto: string;
  quantidadeAlocacoes: number;
  quantidadeFuncionariosPorAlocacao: number;
  alocacoesNoturnas: number;
}

type ConfigMap = Record<string, TipoPostoCalculoConfig>;

function normalizarNumero(valor: unknown, fallback = 0): number {
  if (valor === null || valor === undefined || valor === '') return fallback;
  const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);
  return Number.isFinite(num) ? num : fallback;
}

export function resolverTipoPostoConfig(
  tipoPosto: string | null | undefined,
  configs: ConfigMap,
  fallbackTipoPosto = 'PERSONALIZADO',
): TipoPostoCalculoConfig {
  let cleanTipo = tipoPosto ?? fallbackTipoPosto;
  // Fallback para Angular stringified objects (ex: "3: ESCALA_8H_3TURNOS")
  if (typeof cleanTipo === 'string' && cleanTipo.includes(': ')) {
    const parts = cleanTipo.split(': ');
    if (parts.length >= 2) {
      cleanTipo = parts.slice(1).join(': ').trim();
    }
  }

  const fallbackConfig = configs[fallbackTipoPosto] ?? Object.values(configs)[0];
  return configs[cleanTipo] ?? fallbackConfig;
}

export function calcularResumoPosto(
  posto: PostoCalculoInput,
  configs: ConfigMap,
): ResumoPostoCalculo {
  const tipoPosto = String(posto.tipoPosto ?? 'PERSONALIZADO');
  const config = resolverTipoPostoConfig(tipoPosto, configs);
  const alocacoes = Math.max(0, normalizarNumero(posto.quantidadeAlocacoes, config.alocacoes));
  const funcionariosPorAlocacao = Math.max(
    0,
    normalizarNumero(posto.quantidadeFuncionariosPorAlocacao, config.funcionariosPorAlocacao),
  );
  const alocacoesNoturnas = Math.max(
    0,
    normalizarNumero(posto.alocacoesNoturnas, config.alocacoesNoturnas),
  );

  const diariasPorDia = alocacoes * funcionariosPorAlocacao;
  const diariasNoturnasPorDia = alocacoesNoturnas * funcionariosPorAlocacao;
  const diariasUteisMes = diariasPorDia * DIAS_UTEIS_PADRAO;
  const diariasFdsMes = config.operaFimDeSemana ? diariasPorDia * DIAS_FIM_SEMANA_PADRAO : 0;
  const diariasFeriadosMes = 0; // Feriados não são calculados aqui (são risco)
  const diariasTotaisMes = diariasUteisMes + diariasFdsMes; // total real: úteis + FDS (backend subtrai FDS para achar úteis)
  const diasOperacao = config.operaFimDeSemana ? DIAS_TOTAL_MES_PADRAO : DIAS_UTEIS_PADRAO;
  const diariasNoturnasMes = diariasNoturnasPorDia * diasOperacao;
  const divisorFuncionarios = Math.max(1, config.diasTrabalhadosPorFuncMes);
  const funcionariosEstimados = Math.ceil(diariasTotaisMes / divisorFuncionarios); // cobre todos os turnos (úteis + FDS)

  return {
    tipoPosto,
    config,
    alocacoes,
    funcionariosPorAlocacao,
    alocacoesNoturnas,
    diariasPorDia,
    diariasNoturnasPorDia,
    diariasUteisMes,
    diariasFdsMes,
    diariasFeriadosMes,
    diariasTotaisMes,
    diariasNoturnasMes,
    funcionariosEstimados,
  };
}

export function calcularResumoContrato(
  postos: PostoCalculoInput[],
  configs: ConfigMap,
): ResumoCalculoContrato {
  const postosCalculados = postos.map((posto) => calcularResumoPosto(posto, configs));

  return postosCalculados.reduce<ResumoCalculoContrato>(
    (acc, resumo) => ({
      postos: [...acc.postos, resumo],
      totalAlocacoes: acc.totalAlocacoes + resumo.alocacoes,
      totalAlocacoesNoturnas: acc.totalAlocacoesNoturnas + resumo.alocacoesNoturnas,
      diariasPorDia: acc.diariasPorDia + resumo.diariasPorDia,
      diariasNoturnasPorDia: acc.diariasNoturnasPorDia + resumo.diariasNoturnasPorDia,
      diariasUteisMes: acc.diariasUteisMes + resumo.diariasUteisMes,
      diariasFdsMes: acc.diariasFdsMes + resumo.diariasFdsMes,
      diariasFeriadosMes: acc.diariasFeriadosMes + resumo.diariasFeriadosMes,
      diariasTotaisMes: acc.diariasTotaisMes + resumo.diariasTotaisMes,
      diariasNoturnasMes: acc.diariasNoturnasMes + resumo.diariasNoturnasMes,
      funcionariosEstimados: acc.funcionariosEstimados + resumo.funcionariosEstimados,
    }),
    {
      postos: [],
      totalAlocacoes: 0,
      totalAlocacoesNoturnas: 0,
      diariasPorDia: 0,
      diariasNoturnasPorDia: 0,
      diariasUteisMes: 0,
      diariasFdsMes: 0,
      diariasFeriadosMes: 0,
      diariasTotaisMes: 0,
      diariasNoturnasMes: 0,
      funcionariosEstimados: 0,
    },
  );
}

export function buildCalculoValorTotalInput(
  params: {
    postos: PostoCalculoInput[];
    valorDiariaCobrada: number | null | undefined;
    valorBeneficiosExtrasMensal: number | null | undefined;
  } & CalculoContratoPercentuaisInput,
  configs: ConfigMap,
): CalculoValorTotalInput {
  const resumo = calcularResumoContrato(params.postos, configs);

  return {
    valorDiariaCobrada: normalizarNumero(params.valorDiariaCobrada),
    diariasTotaisMes: resumo.diariasTotaisMes,
    diariasNoturnasMes: resumo.diariasNoturnasMes,
    diariasFdsMes: resumo.diariasFdsMes,
    diariasFeriadosMes: resumo.diariasFeriadosMes,
    funcionariosEstimados: resumo.funcionariosEstimados,
    valorBeneficiosExtrasMensal: normalizarNumero(params.valorBeneficiosExtrasMensal),
    percentualEncargosProvisoes: params.percentualEncargosProvisoes,
    percentualAdicionalNoturno: params.percentualAdicionalNoturno,
    percentualAdicionalFimSemana: params.percentualAdicionalFimSemana,
    margemLucroPercentual: params.margemLucroPercentual,
    margemCoberturaFaltasPercentual: params.margemCoberturaFaltasPercentual,
  };
}

/**
 * Gera uma lista de postos respeitando a quantidade ideal por turno.
 *
 * Regra:
 * - Cada tipo selecionado gera ao menos 1 posto.
 * - Quando a configuracao do tipo suporta menos pessoas por alocacao que o ideal,
 *   replica o posto para aproximar o alvo.
 */
export function computePostosByQuantidadeIdeal(
  quantidadeIdealPorTurno: number,
  tiposEscolhidos: string[],
  configs: ConfigMap,
  fallbackTipoPosto = 'PERSONALIZADO',
): PostoConfigAutoGerado[] {
  const ideal = Math.max(1, Math.floor(normalizarNumero(quantidadeIdealPorTurno, 1)));

  return tiposEscolhidos.flatMap((tipo) => {
    const config = resolverTipoPostoConfig(tipo, configs, fallbackTipoPosto);
    const capacidadePorPosto = Math.max(1, config.funcionariosPorAlocacao);
    const replicas = Math.max(1, Math.ceil(ideal / capacidadePorPosto));

    return Array.from({ length: replicas }, () => ({
      tipoPosto: tipo,
      quantidadeAlocacoes: config.alocacoes,
      quantidadeFuncionariosPorAlocacao: config.funcionariosPorAlocacao,
      alocacoesNoturnas: config.alocacoesNoturnas,
    }));
  });
}

/**
 * Calcula o valor estimado de uma diária com base na data (fim de semana)
 * e nas configurações da alocação (adicional noturno).
 */
export function calcularValorDiariaEstimada(
  dataOriginal: string | Date,
  valorBaseDiaria: number,
  percentualNoturno: number | null | undefined,
  percentualFimDeSemana: number | null | undefined,
  temHorarioNoturno: boolean
): number {
  let valor = valorBaseDiaria;
  
  // Normalizar a data para o meio-dia UTC para evitar problemas de fuso horário
  const data = typeof dataOriginal === 'string' 
    ? new Date(dataOriginal.includes('T') ? dataOriginal : `${dataOriginal}T12:00:00`)
    : dataOriginal;
    
  const diaSemana = data.getDay();
  
  // Adicional de Fim de Semana (padrão é 100% para domingo e 50% para sábado, 
  // mas se o backend enviar algo diferente, usamos a lógica do sistema)
  if (diaSemana === 0) {
    // Domingo
    const percDomingo = percentualFimDeSemana != null ? percentualFimDeSemana : 1.0; // 100%
    valor *= (1 + percDomingo);
  } else if (diaSemana === 6) {
    // Sábado
    const percSabado = percentualFimDeSemana != null ? percentualFimDeSemana / 2 : 0.5; // 50%
    valor *= (1 + percSabado);
  }

  // Adicional Noturno
  if (temHorarioNoturno) {
    const percNoturno = percentualNoturno || 0;
    valor *= (1 + percNoturno);
  }

  return valor;
}
