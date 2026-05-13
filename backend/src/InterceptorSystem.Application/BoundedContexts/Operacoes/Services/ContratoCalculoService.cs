using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ContratoCalculoService : IContratoCalculoService
{
    public CalculoValorTotalOutput CalcularValorTotal(CalculoValorTotalInput input)
    {
        ValidarInput(input);

        // ETAPA 1: Decompor diárias em componentes
        var (diariasDiurnasUteis, diariasNoturnasUteis) = ContratoCalculoHelper.DecomporDiarias(
            input.DiariasTotaisMes,
            input.DiariasFdsMes,
            input.DiariasNoturnasMes);

        // Calcular custos individuais antes do custo total
        var custoDiariasNormais = diariasDiurnasUteis * input.ValorDiariaCobrada;
        var baseNoturnaUteis = diariasNoturnasUteis * input.ValorDiariaCobrada;
        var custoAdicionalNoturno = baseNoturnaUteis * (1m + input.PercentualAdicionalNoturno);
        var baseFimSemana = input.DiariasFdsMes * input.ValorDiariaCobrada;
        var custoDiariasFimSemana = baseFimSemana * (1m + input.PercentualAdicionalFimSemana);
        
        // ETAPA 2: Custo Direto
        var custoTotalBeneficios = input.FuncionariosEstimados * input.ValorBeneficiosExtrasMensal;
        var custoDireto = ContratoCalculoHelper.CalcularCustoDireto(
            diariasDiurnasUteis,
            diariasNoturnasUteis,
            input.DiariasFdsMes,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.PercentualAdicionalFimSemana,
            custoTotalBeneficios);

        // ETAPA 3: Impostos
        var valorImpostos = ContratoCalculoHelper.CalcularImpostos(
            custoDireto,
            input.PercentualEncargosProvisoes);
        
        // ETAPA 4: Custo Base Mensal (com impostos)
        var custoBaseMensal = custoDireto + valorImpostos;
        
        // ETAPA 5: Faturamento e Margens
        var (faturamento, valorMargemLucro, valorMargemFaltas) = ContratoCalculoHelper.CalcularFaturamentoEMargens(
            custoBaseMensal,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual);
        
        return new CalculoValorTotalOutput(
            ValorTotalMensal: ContratoCalculoHelper.Arredondar(faturamento),
            CustoBaseMensal: ContratoCalculoHelper.Arredondar(custoBaseMensal),
            CustoDiariasNormais: ContratoCalculoHelper.Arredondar(custoDiariasNormais),
            CustoAdicionalNoturno: ContratoCalculoHelper.Arredondar(custoAdicionalNoturno),
            CustoDiariasFimSemana: ContratoCalculoHelper.Arredondar(custoDiariasFimSemana),
            ValorImpostos: ContratoCalculoHelper.Arredondar(valorImpostos),
            ValorMargemLucro: ContratoCalculoHelper.Arredondar(valorMargemLucro),
            ValorMargemFaltas: ContratoCalculoHelper.Arredondar(valorMargemFaltas),
            ValorBeneficios: ContratoCalculoHelper.Arredondar(custoTotalBeneficios),
            CustoDireto: ContratoCalculoHelper.Arredondar(custoDireto),
            DiariasTotaisMes: ContratoCalculoHelper.Arredondar(input.DiariasTotaisMes),
            DiariasNoturnasMes: ContratoCalculoHelper.Arredondar(input.DiariasNoturnasMes),
            DiariasFdsMes: ContratoCalculoHelper.Arredondar(input.DiariasFdsMes),
            DiariasFeriadosMes: ContratoCalculoHelper.Arredondar(input.DiariasFeriadosMes),
            FuncionariosEstimados: input.FuncionariosEstimados,
            FuncionariosProjetados: input.FuncionariosEstimados,
            CustoTotalBeneficios: ContratoCalculoHelper.Arredondar(custoTotalBeneficios)
        );
    }

    public SimulacaoFinanceiraMensalOutput SimularSemAlocacoes(SimulacaoFinanceiraMensalInput input)
    {
        ValidarSimulacaoInput(input);

        // ETAPA 1: Calcular quantidade de diárias
        var alocacoesTotais = input.NumeroDePostos * input.AlocacoesPorPosto;
        var proporcaoNoturna = 1m / Math.Max(1, input.AlocacoesPorPosto);
        var alocacoesNoturnas = (int)Math.Ceiling(alocacoesTotais * proporcaoNoturna);
        var diariasPorDia = alocacoesTotais * input.FuncionariosPorAlocacao;
        var diariasNoturnasPorDia = alocacoesNoturnas * input.FuncionariosPorAlocacao;

        var diariasUteisMes = diariasPorDia * (decimal)input.DiasUteisMes;
        var diariasFimSemanaMes = diariasPorDia * (decimal)input.DiasFimSemanaMes;
        var diariasTotaisMes = diariasUteisMes + diariasFimSemanaMes;
        
        var feriadosMes = input.FeriadosAno / 12m;
        var diariasFeriadosMes = diariasPorDia * feriadosMes;
        
        var divisorFunc = Math.Max(1, input.DiasTrabalhadosPorFuncionarioMes);
        var funcionariosProjetados = (int)Math.Ceiling(diariasTotaisMes / divisorFunc);

        // ETAPA 2: Custos
        var diariasDiurnasPorDia = Math.Max(0, diariasPorDia - diariasNoturnasPorDia);
        var diariasDiurnasUteis = diariasDiurnasPorDia * (decimal)input.DiasUteisMes;
        var custoDiariasNormais = diariasDiurnasUteis * input.ValorDiaria;

        var diariasNoturnasUteis = diariasNoturnasPorDia * (decimal)input.DiasUteisMes;
        var baseNoturnaUteis = diariasNoturnasUteis * input.ValorDiaria;
        var custoAdicionalNoturno = baseNoturnaUteis * (1m + input.PercentualAdicionalNoturno);

        var baseFimSemana = diariasFimSemanaMes * input.ValorDiaria;
        var custoDiariasFimSemana = baseFimSemana * (1m + input.PercentualAdicionalFimSemana);

        var custoTotalBeneficios = funcionariosProjetados * input.ValorBeneficioMensalPorFuncionario;

        var custoDireto = ContratoCalculoHelper.CalcularCustoDireto(
            diariasDiurnasUteis,
            diariasNoturnasUteis,
            diariasFimSemanaMes,
            input.ValorDiaria,
            input.PercentualAdicionalNoturno,
            input.PercentualAdicionalFimSemana,
            custoTotalBeneficios);

        var valorImpostos = ContratoCalculoHelper.CalcularImpostos(
            custoDireto,
            input.PercentualEncargosProvisoes);
        
        var custoBaseMensal = custoDireto + valorImpostos;

        // ETAPA 3: Faturamento
        var (faturamentoSimulado, valorMargemLucro, valorMargemFaltas) = ContratoCalculoHelper.CalcularFaturamentoEMargens(
            custoBaseMensal,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual);

        return new SimulacaoFinanceiraMensalOutput(
            NumeroDePostos: input.NumeroDePostos,
            AlocacoesTotais: alocacoesTotais,
            AlocacoesNoturnas: alocacoesNoturnas,
            FuncionariosPorAlocacao: input.FuncionariosPorAlocacao,
            DiariasPorDia: diariasPorDia,
            DiariasNoturnasPorDia: diariasNoturnasPorDia,
            DiariasUteisMes: ContratoCalculoHelper.Arredondar(diariasUteisMes),
            DiariasFimSemanaMes: ContratoCalculoHelper.Arredondar(diariasFimSemanaMes),
            DiariasFeriadosMes: ContratoCalculoHelper.Arredondar(diariasFeriadosMes),
            DiariasTotaisMes: ContratoCalculoHelper.Arredondar(diariasTotaisMes),
            CustoDiariasNormais: ContratoCalculoHelper.Arredondar(custoDiariasNormais),
            CustoAdicionalNoturno: ContratoCalculoHelper.Arredondar(custoAdicionalNoturno),
            CustoDiariasFimSemana: ContratoCalculoHelper.Arredondar(custoDiariasFimSemana),
            FuncionariosProjetados: funcionariosProjetados,
            CustoTotalBeneficios: ContratoCalculoHelper.Arredondar(custoTotalBeneficios),
            CustoTotalMensal: ContratoCalculoHelper.Arredondar(custoDireto),
            ValorImpostos: ContratoCalculoHelper.Arredondar(valorImpostos),
            CustoBaseMensal: ContratoCalculoHelper.Arredondar(custoBaseMensal),
            ValorMargemLucro: ContratoCalculoHelper.Arredondar(valorMargemLucro),
            ValorMargemFaltas: ContratoCalculoHelper.Arredondar(valorMargemFaltas),
            FaturamentoSimulado: ContratoCalculoHelper.Arredondar(faturamentoSimulado)
        );
    }

    /// <summary>
    /// Valida os parâmetros de entrada de CalcularValorTotal.
    /// </summary>
    private static void ValidarInput(CalculoValorTotalInput input)
    {
        if (input.ValorDiariaCobrada < 0m)
            throw new ArgumentException("Valor de diária não pode ser negativo.", nameof(input.ValorDiariaCobrada));
        
        if (input.DiariasTotaisMes < 0m)
            throw new ArgumentException("Total de diárias não pode ser negativo.", nameof(input.DiariasTotaisMes));
        
        if (input.DiariasNoturnasMes < 0m)
            throw new ArgumentException("Diárias noturnas não podem ser negativas.", nameof(input.DiariasNoturnasMes));
        
        if (input.DiariasNoturnasMes > input.DiariasTotaisMes)
            throw new ArgumentException("Diárias noturnas não podem ser maiores que total de diárias.");
        
        if (input.FuncionariosEstimados < 0)
            throw new ArgumentException("Funcionários não podem ser negativos.", nameof(input.FuncionariosEstimados));
        
        if (input.ValorBeneficiosExtrasMensal < 0m)
            throw new ArgumentException("Benefícios não podem ser negativos.", nameof(input.ValorBeneficiosExtrasMensal));
        
        if (input.PercentualEncargosProvisoes < 0m || input.PercentualEncargosProvisoes > 1m)
            throw new ArgumentException("Encargos devem estar entre 0% e 100%.", nameof(input.PercentualEncargosProvisoes));
        
        if (input.PercentualAdicionalNoturno < 0m)
            throw new ArgumentException("Adicional noturno não pode ser negativo.", nameof(input.PercentualAdicionalNoturno));
        
        if (input.PercentualAdicionalFimSemana < 0m)
            throw new ArgumentException("Adicional FDS não pode ser negativo.", nameof(input.PercentualAdicionalFimSemana));
        
        if (input.MargemLucroPercentual < 0m || input.MargemLucroPercentual > 1m)
            throw new ArgumentException("Margem de lucro deve estar entre 0% e 100%.", nameof(input.MargemLucroPercentual));
        
        if (input.MargemCoberturaFaltasPercentual < 0m || input.MargemCoberturaFaltasPercentual > 1m)
            throw new ArgumentException("Margem de cobertura deve estar entre 0% e 100%.", nameof(input.MargemCoberturaFaltasPercentual));

        var totalPercentuais = input.PercentualEncargosProvisoes + input.MargemLucroPercentual + input.MargemCoberturaFaltasPercentual;
        if (totalPercentuais >= 1m)
            throw new ArgumentException("Soma de encargos + margens não pode ser >= 100%");
    }

    /// <summary>
    /// Valida os parâmetros de entrada de SimularSemAlocacoes.
    /// </summary>
    private static void ValidarSimulacaoInput(SimulacaoFinanceiraMensalInput input)
    {
        if (input.ValorDiaria < 0m)
            throw new ArgumentException("Valor de diária não pode ser negativo.", nameof(input.ValorDiaria));
        
        if (input.NumeroDePostos <= 0)
            throw new ArgumentException("Número de postos deve ser maior que 0.", nameof(input.NumeroDePostos));
        
        if (input.PercentualEncargosProvisoes < 0m || input.PercentualEncargosProvisoes > 1m)
            throw new ArgumentException("Encargos devem estar entre 0% e 100%.", nameof(input.PercentualEncargosProvisoes));
        
        if (input.MargemLucroPercentual < 0m || input.MargemLucroPercentual > 1m)
            throw new ArgumentException("Margem de lucro deve estar entre 0% e 100%.", nameof(input.MargemLucroPercentual));
        
        if (input.MargemCoberturaFaltasPercentual < 0m || input.MargemCoberturaFaltasPercentual > 1m)
            throw new ArgumentException("Margem de cobertura deve estar entre 0% e 100%.", nameof(input.MargemCoberturaFaltasPercentual));

        var totalPercentuais = input.PercentualEncargosProvisoes + input.MargemLucroPercentual + input.MargemCoberturaFaltasPercentual;
        if (totalPercentuais >= 1m)
            throw new ArgumentException("Soma de encargos + margens não pode ser >= 100%");
    }
}

