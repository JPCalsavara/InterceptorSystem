using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

/// <summary>
/// Endpoints auxiliares para cálculos de contrato
/// </summary>
[ApiController]
[Route("api/contratos/calculos")]
public class ContratoCalculosController : ControllerBase
{
    /// <summary>
    /// Calcula o valor total mensal do contrato baseado nos inputs
    /// </summary>
    /// <remarks>
    /// **IMPORTANTE:** Este cálculo deve ser a única fonte da verdade!
    /// 
    /// Fórmula:
    /// 1. Custo Base = (ValorDiaria × 30 dias × QtdFuncionarios) + Benefícios
    /// 2. Soma Margens = Impostos% + Lucro% + Faltas%
    /// 3. Valor Total = Custo Base / (1 - Soma Margens)
    /// 
    /// Exemplo:
    /// - Diária: R$ 100
    /// - Funcionários: 12
    /// - Benefícios: R$ 3.600
    /// - Impostos: 15%, Lucro: 20%, Faltas: 10%
    /// 
    /// Custo = (100 × 30 × 12) + 3600 = R$ 39.600
    /// Margens = 45%
    /// Valor Total = 39600 / 0.55 = R$ 72.000
    /// </remarks>
    [HttpPost("calcular-valor-total")]
    [ProducesResponseType(typeof(CalculoValorTotalOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<CalculoValorTotalOutput> CalcularValorTotal([FromBody] CalculoValorTotalInput input)
    {
        try
        {
            // Validações
            if (input.ValorDiariaCobrada <= 0)
                return BadRequest(new { error = "Valor da diária deve ser maior que zero." });
            
            if (input.QuantidadeFuncionarios <= 0)
                return BadRequest(new { error = "Quantidade de funcionários deve ser maior que zero." });
            
            if (input.ValorBeneficiosExtrasMensal < 0)
                return BadRequest(new { error = "Valor de benefícios não pode ser negativo." });
            
            var somaMargens = input.PercentualImpostos 
                + input.MargemLucroPercentual 
                + input.MargemCoberturaFaltasPercentual;
            
            if (somaMargens >= 1m)
                return BadRequest(new { error = "Soma das margens não pode ser >= 100%." });
            
            // 1. Calcular custo base mensal
            var custoDiarioTotal = input.ValorDiariaCobrada * 30; // 30 dias/mês
            var custoSalarialMensal = custoDiarioTotal * input.QuantidadeFuncionarios;
            var custoBaseMensal = custoSalarialMensal + input.ValorBeneficiosExtrasMensal;
            
            // 2. Aplicar markup para cobrir todas as margens
            // Fórmula: ValorTotal = CustoBase / (1 - SomaMargens)
            var valorTotalMensal = custoBaseMensal / (1 - somaMargens);
            
            // 3. Calcular breakdown para transparência
            var valorImpostos = valorTotalMensal * input.PercentualImpostos;
            var valorLucro = valorTotalMensal * input.MargemLucroPercentual;
            var valorFaltas = valorTotalMensal * input.MargemCoberturaFaltasPercentual;
            
            return Ok(new CalculoValorTotalOutput(
                ValorTotalMensal: Math.Round(valorTotalMensal, 2),
                CustoBaseMensal: Math.Round(custoBaseMensal, 2),
                ValorImpostos: Math.Round(valorImpostos, 2),
                ValorMargemLucro: Math.Round(valorLucro, 2),
                ValorMargemFaltas: Math.Round(valorFaltas, 2),
                ValorBeneficios: input.ValorBeneficiosExtrasMensal,
                BaseParaSalarios: Math.Round(valorTotalMensal - valorImpostos - valorLucro - valorFaltas - input.ValorBeneficiosExtrasMensal, 2)
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Erro ao calcular valor total: {ex.Message}" });
        }
    }
}

