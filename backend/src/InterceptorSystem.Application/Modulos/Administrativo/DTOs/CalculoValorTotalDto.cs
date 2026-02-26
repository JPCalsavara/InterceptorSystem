namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

/// <summary>
/// Input para cálculo de valor total do contrato
/// </summary>
public record CalculoValorTotalInput(
    decimal ValorDiariaCobrada,
    int QuantidadeFuncionarios,
    int NumeroDePostos, // Quantidade de turnos/postos (ex: 2 = 12x36)
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    decimal PercentualAdicionalNoturno,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual
);

/// <summary>
/// Output com breakdown completo do cálculo
/// </summary>
public record CalculoValorTotalOutput(
    decimal ValorTotalMensal,
    decimal CustoBaseMensal,
    decimal ValorAdicionalNoturno,
    decimal ValorImpostos,
    decimal ValorMargemLucro,
    decimal ValorMargemFaltas,
    decimal ValorBeneficios,
    decimal BaseParaSalarios,
    // Informações de breakdown por turno
    int NumeroDePostos,
    int FuncionariosPorPosto,
    decimal CustoPorPostoDiario,
    decimal CustoPorPostoMensal
);

