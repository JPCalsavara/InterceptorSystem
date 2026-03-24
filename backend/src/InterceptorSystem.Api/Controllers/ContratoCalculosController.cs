using Microsoft.AspNetCore.Authorization;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

/// <summary>
/// Endpoints auxiliares para cálculos de contrato
/// </summary>
[Authorize]
[ApiController]
[Route("api/contratos/calculos")]
public class ContratoCalculosController : ControllerBase
{
    /// <summary>
    /// Calcula o valor total mensal do contrato baseado nos inputs
    /// </summary>
    /// <remarks>
    /// **FÓRMULA COMPLETA (v2.1 - com Postos de Trabalho):**
    /// 
    /// **Etapa 1 - Cálculo Base Salarial:**
    /// ```
    /// Funcionários por Posto = Total Funcionários ÷ Número de Postos
    /// Custo Diário por Posto = ValorDiaria × Funcionários por Posto
    /// Custo Salarial Direto = NumeroDePostos × ValorDiaria × 30 dias
    /// ```
    /// 
    /// **Etapa 2 - Encargos e Benefícios:**
    /// ```
    /// Adicional Noturno = Custo Salarial Direto × PercentualNoturno
    /// Base Salarial com Adicional = Custo Salarial Direto + Adicional Noturno
    /// Encargos Trabalhistas (65%) = Base Salarial com Adicional × 0.65
    /// Benefícios Totais = ValorBeneficioUnitário × QuantidadeFuncionarios (Total)
    /// 
    /// Custo Base Real = Base Salarial com Adicional + Encargos + Benefícios
    /// ```
    /// 
    /// **Etapa 3 - Aplicar Markup (NF, Margem Líquida, Faltas):**
    /// ```
    /// Soma Margens = Impostos + Lucro + Faltas (em decimal)
    /// Valor Total Mensal = Custo Base Real ÷ (1 - Soma Margens)
    /// ```
    /// 
    /// **Exemplo Prático (4 funcionários, 2 postos = 2 por turno):**
    /// ```
    /// Diária: R$ 100 | Ben: R$ 350 | Fat: 4 func | Postos: 2 | Noturno: 20%
    /// 
    /// Custo Mensal Salários: 2 postos × 100 × 30 = R$ 6.000
    /// Adicional Noturno (20%): 6.000 × 0.20 = R$ 1.200
    /// Base Salarial: 6.000 + 1.200 = R$ 7.200
    /// 
    /// Encargos Trabalhistas (65%): 7.200 × 0.65 = R$ 4.680
    /// Benefícios Totais: 4 func × 350 = R$ 1.400
    /// 
    /// Custo Base Real: 7.200 + 4.680 + 1.400 = R$ 13.280
    /// 
    /// Margens (40%): 0.15 + 0.15 + 0.10 = 0.40
    /// Valor Faturado Final: 13.280 ÷ 0.60 = R$ 22.133,33
    /// ```
    /// </remarks>
    [HttpPost("calcular-valor-total")]
    [ProducesResponseType(typeof(CalculoValorTotalOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<CalculoValorTotalOutput> CalcularValorTotal([FromBody] CalculoValorTotalInput input)
    {
        try
        {
            // Validações de entrada
            if (input.ValorDiariaCobrada <= 0)
                return BadRequest(new { error = "Valor da diária deve ser maior que zero." });
            
            if (input.QuantidadeFuncionarios <= 0)
                return BadRequest(new { error = "Quantidade de funcionários deve ser maior que zero." });
            
            if (input.NumeroDePostos <= 0)
                return BadRequest(new { error = "Número de postos deve ser maior que zero." });
            
            if (input.ValorBeneficiosExtrasMensal < 0)
                return BadRequest(new { error = "Valor de benefícios não pode ser negativo." });
            
            if (input.PercentualAdicionalNoturno < 0 || input.PercentualAdicionalNoturno > 1)
                return BadRequest(new { error = "Percentual adicional noturno deve estar entre 0 e 1 (ex: 0.20 = 20%)." });

            if (input.NumeroDePostosNoturnos < 0 || input.NumeroDePostosNoturnos > input.NumeroDePostos)
                return BadRequest(new { error = "Número de postos noturnos deve estar entre 0 e o total de postos." });
            
            var somaMargens = input.PercentualEncargosProvisoes 
                + input.MargemLucroPercentual 
                + input.MargemCoberturaFaltasPercentual;
            
            if (somaMargens >= 1m)
                return BadRequest(new { error = "Soma das margens não pode ser >= 100% (deve ser < 1.0)." });
            
            // ETAPA 1: Calcular custo salarial
            var totalFuncionarios = input.QuantidadeFuncionarios;
            var funcionariosPorPosto = totalFuncionarios / input.NumeroDePostos;
            
            // O custo direto de salários equivale ao número de postos simultâneos cobertos no mês (30 dias)
            // Ou seja, 2 postos de R$ 100 = R$ 200 diários da operação (independentemente se são 4 funcionários revezando)
            var custoDiarioOperacao = input.ValorDiariaCobrada * input.NumeroDePostos;
            var custoMensalSalarios = custoDiarioOperacao * 30; 
            
            // ETAPA 2: Custos Trabalhistas e Benefícios
            // 2.1 - Adicional noturno proporcional aos postos efetivamente noturnos
            // Ex: 1 de 2 postos noturno = 50% da base salarial recebe o adicional
            var proporcaoNoturna = input.NumeroDePostos > 0
                ? (decimal)input.NumeroDePostosNoturnos / input.NumeroDePostos
                : 0m;
            var valorAdicionalNoturno = custoMensalSalarios * proporcaoNoturna * input.PercentualAdicionalNoturno;
            var baseSalarialComAdicional = custoMensalSalarios + valorAdicionalNoturno;
            
            // 2.2 - Encargos e Provisões (Risco Operacional Trabalhista - ~65%)
            const decimal percentualEncargos = 0.65m;
            var valorEncargos = baseSalarialComAdicional * percentualEncargos;

            // 2.3 - Benefícios Totais (multiplica pelo total de funcionários na operação)
            var valorBeneficiosTotais = input.ValorBeneficiosExtrasMensal * totalFuncionarios;
            
            // 2.4 - Custo Base Real (com Encargos)
            var custoBaseMensalReal = baseSalarialComAdicional + valorEncargos + valorBeneficiosTotais;
            
            // ETAPA 3: Aplicar markup final
            var valorTotalMensal = custoBaseMensalReal / (1 - somaMargens);
            
            // ETAPA 4: Calcular breakdown
            var valorImpostos = valorTotalMensal * input.PercentualEncargosProvisoes;
            var valorLucro = valorTotalMensal * input.MargemLucroPercentual;
            var valorFaltas = valorTotalMensal * input.MargemCoberturaFaltasPercentual;
            
            var baseParaSalarios = baseSalarialComAdicional;
            
            // Breakdown por posto
            var custoPorPostoDiario = custoDiarioOperacao / input.NumeroDePostos;
            var custoPorPostoMensal = custoMensalSalarios / input.NumeroDePostos;
            
            return Ok(new CalculoValorTotalOutput(
                ValorTotalMensal: Math.Round(valorTotalMensal, 2),
                CustoBaseMensal: Math.Round(custoBaseMensalReal, 2),
                ValorAdicionalNoturno: Math.Round(valorAdicionalNoturno, 2),
                ValorImpostos: Math.Round(valorImpostos, 2),
                ValorMargemLucro: Math.Round(valorLucro, 2),
                ValorMargemFaltas: Math.Round(valorFaltas, 2),
                ValorBeneficios: Math.Round(valorBeneficiosTotais, 2),
                ValorEncargosTrabalhistas: Math.Round(valorEncargos, 2),
                BaseParaSalarios: Math.Round(baseParaSalarios, 2),
                NumeroDePostos: input.NumeroDePostos,
                NumeroDePostosNoturnos: input.NumeroDePostosNoturnos,
                FuncionariosPorPosto: funcionariosPorPosto,
                CustoPorPostoDiario: Math.Round(custoPorPostoDiario, 2),
                CustoPorPostoMensal: Math.Round(custoPorPostoMensal, 2)
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Erro ao calcular valor total: {ex.Message}" });
        }
    }
}

