namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

/// <summary>
/// Input para cálculo de valor total do contrato
/// </summary>
public record CalculoValorTotalInput(
    decimal ValorDiariaCobrada,
    int QuantidadeFuncionarios,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual
);

/// <summary>
/// Output com breakdown completo do cálculo
/// </summary>
public record CalculoValorTotalOutput(
    decimal ValorTotalMensal,
    decimal CustoBaseMensal,
    decimal ValorImpostos,
    decimal ValorMargemLucro,
    decimal ValorMargemFaltas,
    decimal ValorBeneficios,
    decimal BaseParaSalarios
);

