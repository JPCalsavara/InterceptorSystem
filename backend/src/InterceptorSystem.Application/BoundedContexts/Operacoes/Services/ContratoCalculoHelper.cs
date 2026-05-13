namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

/// <summary>
/// Helper para encapsular lógica de cálculo financeiro do contrato.
/// Evita duplicação entre CalcularValorTotal e SimularSemAlocacoes.
/// </summary>
internal static class ContratoCalculoHelper
{
    /// <summary>
    /// Calcula o custo direto (sem impostos) a partir dos componentes de diárias.
    /// </summary>
    public static decimal CalcularCustoDireto(
        decimal diariasDiurnasUteis,
        decimal diariasNoturnasUteis,
        decimal diariasFimSemanaMes,
        decimal valorDiaria,
        decimal percentualAdicionalNoturno,
        decimal percentualAdicionalFimSemana,
        decimal custoTotalBeneficios)
    {
        var custoDiariasNormais = diariasDiurnasUteis * valorDiaria;
        
        var baseNoturnaUteis = diariasNoturnasUteis * valorDiaria;
        var custoAdicionalNoturno = baseNoturnaUteis * (1m + percentualAdicionalNoturno);
        
        var baseFimSemana = diariasFimSemanaMes * valorDiaria;
        var custoDiariasFimSemana = baseFimSemana * (1m + percentualAdicionalFimSemana);
        
        return custoDiariasNormais + custoAdicionalNoturno + custoDiariasFimSemana + custoTotalBeneficios;
    }

    /// <summary>
    /// Calcula os impostos/encargos a partir do custo direto.
    /// </summary>
    public static decimal CalcularImpostos(decimal custoDireto, decimal percentualEncargosProvisoes)
    {
        return custoDireto * percentualEncargosProvisoes;
    }

    /// <summary>
    /// Calcula o faturamento e margens a partir do custo base mensal.
    /// Fórmula: Faturamento = CustoBase × (1 + SomaMargens), limitada a 99,99% para evitar divisões por zero
    /// Margens são calculadas sobre o custo base, não sobre o faturamento
    /// Se SomaMargens >= 100%, retorna Faturamento = CustoBase e margens zeradas
    /// </summary>
    public static (decimal Faturamento, decimal Lucro, decimal Faltas) CalcularFaturamentoEMargens(
        decimal custoBaseMensal,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual)
    {
        var somaMargens = margemLucroPercentual + margemCoberturaFaltasPercentual;
        
        // Se margens >= 100%, nega as margens (retorna custoBase como faturamento)
        if (somaMargens >= 1m)
        {
            return (custoBaseMensal, 0m, 0m);
        }
        
        // Faturamento aditivo: margens aplicadas sobre custo base
        var faturamento = custoBaseMensal * (1m + somaMargens);
        // Importante: margens são calculadas sobre o CUSTO BASE, não sobre o faturamento
        var lucro = custoBaseMensal * margemLucroPercentual;
        var faltas = custoBaseMensal * margemCoberturaFaltasPercentual;

        return (faturamento, lucro, faltas);
    }

    /// <summary>
    /// Decompõe as diárias em componentes: diurnas úteis e noturnas úteis.
    /// </summary>
    public static (decimal DiariasDiurnasUteis, decimal DiariasNoturnasUteis) DecomporDiarias(
        decimal diariasTotaisMes,
        decimal diariasFdsMes,
        decimal diariasNoturnasMes)
    {
        var diariasUteisMes = Math.Max(0m, diariasTotaisMes - diariasFdsMes);
        var diariasNoturnasUteis = Math.Min(diariasUteisMes, diariasNoturnasMes);
        var diariasDiurnasUteis = Math.Max(0m, diariasUteisMes - diariasNoturnasUteis);

        return (diariasDiurnasUteis, diariasNoturnasUteis);
    }

    /// <summary>
    /// Arredonda valor para 2 casas decimais (padrão financeiro).
    /// </summary>
    public static decimal Arredondar(decimal valor)
    {
        return Math.Round(valor, 2);
    }
}
