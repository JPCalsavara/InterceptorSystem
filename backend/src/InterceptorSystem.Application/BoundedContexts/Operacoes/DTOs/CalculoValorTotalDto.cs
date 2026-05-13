namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

/// <summary>
/// Input para cálculo de valor total do contrato
/// </summary>
public record CalculoValorTotalInput(
    decimal ValorDiariaCobrada,
    decimal DiariasTotaisMes,
    decimal DiariasNoturnasMes,
    decimal DiariasFdsMes,              // Separado: FDS (não inclusos no custo)
    decimal DiariasFeriadosMes,         // Separado: Feriados (não inclusos no custo)
    int FuncionariosEstimados,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualEncargosProvisoes,
    decimal PercentualAdicionalNoturno,
    decimal PercentualAdicionalFimSemana,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual
);

/// <summary>
/// Output com breakdown completo do cálculo
/// </summary>
public record CalculoValorTotalOutput(
    decimal ValorTotalMensal,
    decimal CustoBaseMensal,
    decimal CustoDiariasNormais,
    decimal CustoAdicionalNoturno,
    decimal CustoDiariasFimSemana,
    decimal ValorImpostos,
    decimal ValorMargemLucro,
    decimal ValorMargemFaltas,
    decimal ValorBeneficios,
    decimal CustoDireto,
    // Informações de breakdown
    decimal DiariasTotaisMes,
    decimal DiariasNoturnasMes,
    decimal DiariasFdsMes,              // Novo: Separado como RISCO
    decimal DiariasFeriadosMes,         // Novo: Separado como RISCO
    int FuncionariosEstimados,
    int FuncionariosProjetados,         // Novo: Derivado do cálculo
    decimal CustoTotalBeneficios        // Novo: Custo total de benefícios
);

/// <summary>
/// Input para simulação financeira mensal quando não há alocações/diárias reais.
/// </summary>
public record SimulacaoFinanceiraMensalInput(
    decimal ValorDiaria,
    int NumeroDePostos,
    decimal PercentualAdicionalNoturno,
    decimal PercentualAdicionalFimSemana = 0m,
    decimal PercentualEncargosProvisoes = 0m, // Novo: Encargos e Provisões
    int AlocacoesPorPosto = 2,
    int FuncionariosPorAlocacao = 2,
    int DiasUteisMes = 22,
    int DiasFimSemanaMes = 8,
    int FeriadosAno = 12,
    int DiasTrabalhadosPorFuncionarioMes = 15,
    decimal ValorBeneficioMensalPorFuncionario = 350m,
    decimal MargemLucroPercentual = 0m,
    decimal MargemCoberturaFaltasPercentual = 0m
);

/// <summary>
/// Output da simulação financeira mensal sem alocações reais.
/// </summary>
public record SimulacaoFinanceiraMensalOutput(
    int NumeroDePostos,
    int AlocacoesTotais,
    int AlocacoesNoturnas,
    int FuncionariosPorAlocacao,
    int DiariasPorDia,
    int DiariasNoturnasPorDia,
    decimal DiariasUteisMes,
    decimal DiariasFimSemanaMes,
    decimal DiariasFeriadosMes,          // Separado como RISCO (não incluso no custo)
    decimal DiariasTotaisMes,
    decimal CustoDiariasNormais,
    decimal CustoAdicionalNoturno,
    decimal CustoDiariasFimSemana,
    int FuncionariosProjetados,         // Novo: Derivado do total diárias ÷ diárias/dia
    decimal CustoTotalBeneficios,       // Novo: funcionarios × valor benefício unitário
    decimal CustoTotalMensal,           // Subtotal (Base + Adicionais + Benefícios)
    decimal ValorImpostos,              // Encargos e Provisões
    decimal CustoBaseMensal,            // CustoTotalMensal + ValorImpostos
    decimal ValorMargemLucro,           // Lucro calculado sobre CustoTotalFinal
    decimal ValorMargemFaltas,          // Risco calculado sobre CustoTotalFinal
    decimal FaturamentoSimulado         // CustoTotalFinal + Lucro + Risco
);

