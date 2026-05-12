using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ContratoCalculoService : IContratoCalculoService
{
    public CalculoValorTotalOutput CalcularValorTotal(CalculoValorTotalInput input)
    {
        // Extraindo dias (assumindo que DiariasTotaisMes engloba úteis e FDS)
        var diariasUteisMes = Math.Max(0m, input.DiariasTotaisMes - input.DiariasFdsMes);
        var diariasNoturnasUteis = Math.Min(diariasUteisMes, input.DiariasNoturnasMes); // Aproximação para dias úteis

        // ETAPA 1 e 2: Custo Direto
        // Custo Diárias Normais (apenas diurnas, úteis)
        var diariasDiurnasUteis = Math.Max(0m, diariasUteisMes - diariasNoturnasUteis);
        var custoDiariasNormais = diariasDiurnasUteis * input.ValorDiariaCobrada;

        // Custo Adicional Noturno (base noturna + adicional, apenas úteis)
        var baseNoturnaUteis = diariasNoturnasUteis * input.ValorDiariaCobrada;
        var custoAdicionalNoturno = baseNoturnaUteis * (1m + input.PercentualAdicionalNoturno);

        // Custo Diárias Fim de Semana (base + adicional)
        var baseFimSemana = input.DiariasFdsMes * input.ValorDiariaCobrada;
        var custoDiariasFimSemana = baseFimSemana * (1m + input.PercentualAdicionalFimSemana);

        // Benefícios
        var custoTotalBeneficios = input.FuncionariosEstimados * input.ValorBeneficiosExtrasMensal;

        var custoDireto = custoDiariasNormais + custoAdicionalNoturno + custoDiariasFimSemana + custoTotalBeneficios;

        // Impostos
        var valorImpostos = custoDireto * input.PercentualEncargosProvisoes;
        
        // ETAPA 2 (Total): Custo Base Mensal
        var custoBaseMensal = custoDireto + valorImpostos;
        
        // ETAPA 3: Faturamento
        var somaMargens = input.MargemLucroPercentual + input.MargemCoberturaFaltasPercentual;
        var valorTotalMensal = somaMargens >= 1m
            ? custoBaseMensal
            : custoBaseMensal / (1m - somaMargens);
        var valorMargemLucro = somaMargens >= 1m
            ? 0m
            : valorTotalMensal * input.MargemLucroPercentual;
        var valorMargemFaltas = somaMargens >= 1m
            ? 0m
            : valorTotalMensal * input.MargemCoberturaFaltasPercentual;
        
        return new CalculoValorTotalOutput(
            ValorTotalMensal: Math.Round(valorTotalMensal, 2),
            CustoBaseMensal: Math.Round(custoBaseMensal, 2),
            CustoDiariasNormais: Math.Round(custoDiariasNormais, 2),
            CustoAdicionalNoturno: Math.Round(custoAdicionalNoturno, 2),
            CustoDiariasFimSemana: Math.Round(custoDiariasFimSemana, 2),
            ValorImpostos: Math.Round(valorImpostos, 2),
            ValorMargemLucro: Math.Round(valorMargemLucro, 2),
            ValorMargemFaltas: Math.Round(valorMargemFaltas, 2),
            ValorBeneficios: Math.Round(custoTotalBeneficios, 2),
            CustoDireto: Math.Round(custoDireto, 2),
            DiariasTotaisMes: Math.Round(input.DiariasTotaisMes, 2),
            DiariasNoturnasMes: Math.Round(input.DiariasNoturnasMes, 2),
            DiariasFdsMes: Math.Round(input.DiariasFdsMes, 2),
            DiariasFeriadosMes: Math.Round(input.DiariasFeriadosMes, 2),
            FuncionariosEstimados: input.FuncionariosEstimados,
            FuncionariosProjetados: input.FuncionariosEstimados,
            CustoTotalBeneficios: Math.Round(custoTotalBeneficios, 2)
        );
    }

    public SimulacaoFinanceiraMensalOutput SimularSemAlocacoes(SimulacaoFinanceiraMensalInput input)
    {
        var alocacoesTotais = input.NumeroDePostos * input.AlocacoesPorPosto;
        var proporcaoNoturna = 1m / Math.Max(1, input.AlocacoesPorPosto); // ex: 2 turnos = 50%
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

        var custoDireto = custoDiariasNormais + custoAdicionalNoturno + custoDiariasFimSemana + custoTotalBeneficios;

        var valorImpostos = custoDireto * input.PercentualEncargosProvisoes;
        var custoBaseMensal = custoDireto + valorImpostos; // Com impostos

        // ETAPA 3: Faturamento
        var somaMargens = input.MargemLucroPercentual + input.MargemCoberturaFaltasPercentual;
        var faturamentoSimulado = somaMargens >= 1m
            ? custoBaseMensal
            : custoBaseMensal / (1m - somaMargens);
        var valorMargemLucro = somaMargens >= 1m
            ? 0m
            : faturamentoSimulado * input.MargemLucroPercentual;
        var valorMargemFaltas = somaMargens >= 1m
            ? 0m
            : faturamentoSimulado * input.MargemCoberturaFaltasPercentual;

        return new SimulacaoFinanceiraMensalOutput(
            NumeroDePostos: input.NumeroDePostos,
            AlocacoesTotais: alocacoesTotais,
            AlocacoesNoturnas: alocacoesNoturnas,
            FuncionariosPorAlocacao: input.FuncionariosPorAlocacao,
            DiariasPorDia: diariasPorDia,
            DiariasNoturnasPorDia: diariasNoturnasPorDia,
            DiariasUteisMes: Math.Round(diariasUteisMes, 2),
            DiariasFimSemanaMes: Math.Round(diariasFimSemanaMes, 2),
            DiariasFeriadosMes: Math.Round(diariasFeriadosMes, 2),
            DiariasTotaisMes: Math.Round(diariasTotaisMes, 2),
            CustoDiariasNormais: Math.Round(custoDiariasNormais, 2),
            CustoAdicionalNoturno: Math.Round(custoAdicionalNoturno, 2),
            CustoDiariasFimSemana: Math.Round(custoDiariasFimSemana, 2),
            FuncionariosProjetados: funcionariosProjetados,
            CustoTotalBeneficios: Math.Round(custoTotalBeneficios, 2),
            CustoTotalMensal: Math.Round(custoDireto, 2),
            ValorImpostos: Math.Round(valorImpostos, 2),
            CustoBaseMensal: Math.Round(custoBaseMensal, 2),
            ValorMargemLucro: Math.Round(valorMargemLucro, 2),
            ValorMargemFaltas: Math.Round(valorMargemFaltas, 2),
            FaturamentoSimulado: Math.Round(faturamentoSimulado, 2)
        );
    }
}
