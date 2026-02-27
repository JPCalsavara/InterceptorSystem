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
    /// **Etapa 1 - Cálculo por Posto/Turno:**
    /// ```
    /// Funcionários por Posto = Total Funcionários ÷ Número de Postos
    /// Custo Diário por Posto = ValorDiaria × Funcionários por Posto
    /// Custo Mensal por Posto = Custo Diário × 30 dias
    /// ```
    /// 
    /// **Etapa 2 - Custo Salarial Total:**
    /// ```
    /// Custo Diário Total = Custo Diário por Posto × Número de Postos
    /// Custo Mensal Total = Custo Diário Total × 30 dias
    /// Adicional Noturno = Custo Mensal Total × PercentualNoturno
    /// Custo Base = Custo Mensal + Adicional Noturno + Benefícios
    /// ```
    /// 
    /// **Etapa 3 - Aplicar Markup:**
    /// ```
    /// Soma Margens = Impostos + Lucro + Faltas (em decimal)
    /// Valor Total = Custo Base ÷ (1 - Soma Margens)
    /// ```
    /// 
    /// **Exemplo Prático (2 funcionários, 2 postos = 1 por turno):**
    /// ```
    /// Diária: R$ 100
    /// Funcionários Total: 2
    /// Postos: 2 (turno 12x36)
    /// Funcionários/Posto: 2 ÷ 2 = 1
    /// 
    /// Custo Diário/Posto: 100 × 1 = R$ 100
    /// Custo Mensal/Posto: 100 × 30 = R$ 3.000
    /// Custo Total: 3.000 × 2 postos = R$ 6.000
    /// 
    /// Benefícios: R$ 350
    /// Adicional Noturno (20%): 6.000 × 0.20 = R$ 1.200
    /// Custo Base: 6.000 + 1.200 + 350 = R$ 7.550
    /// 
    /// Margens (40%): 0.15 + 0.15 + 0.10 = 0.40
    /// Valor Total: 7.550 ÷ 0.60 = R$ 12.583,33
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
            
            var somaMargens = input.PercentualImpostos 
                + input.MargemLucroPercentual 
                + input.MargemCoberturaFaltasPercentual;
            
            if (somaMargens >= 1m)
                return BadRequest(new { error = "Soma das margens não pode ser >= 100% (deve ser < 1.0)." });
            
            // ETAPA 1: Calcular total de funcionários (funcionários × postos)
            var totalFuncionarios = input.QuantidadeFuncionarios * input.NumeroDePostos;
            var custoDiarioTotal = input.ValorDiariaCobrada * totalFuncionarios;
            var custoMensalTotal = custoDiarioTotal * 30; // 30 dias/mês
            
            // ETAPA 2: Calcular custo base com adicionais
            // 2.1 - Adicional noturno (aplicado sobre custo salarial total)
            var valorAdicionalNoturno = custoMensalTotal * input.PercentualAdicionalNoturno;
            
            // 2.2 - Custo base total (salários + adicional + benefícios)
            var custoBaseMensal = custoMensalTotal + valorAdicionalNoturno + input.ValorBeneficiosExtrasMensal;
            
            // ETAPA 3: Aplicar markup para cobrir todas as margens
            var valorTotalMensal = custoBaseMensal / (1 - somaMargens);
            
            // ETAPA 4: Calcular breakdown para transparência
            var valorImpostos = valorTotalMensal * input.PercentualImpostos;
            var valorLucro = valorTotalMensal * input.MargemLucroPercentual;
            var valorFaltas = valorTotalMensal * input.MargemCoberturaFaltasPercentual;
            
            // Base para salários = Valor total - todos os descontos
            var baseParaSalarios = valorTotalMensal - valorImpostos - valorLucro - valorFaltas - input.ValorBeneficiosExtrasMensal;
            
            // Breakdown por posto
            var custoPorPostoDiario = custoDiarioTotal / input.NumeroDePostos;
            var custoPorPostoMensal = custoMensalTotal / input.NumeroDePostos;
            
            return Ok(new CalculoValorTotalOutput(
                ValorTotalMensal: Math.Round(valorTotalMensal, 2),
                CustoBaseMensal: Math.Round(custoBaseMensal, 2),
                ValorAdicionalNoturno: Math.Round(valorAdicionalNoturno, 2),
                ValorImpostos: Math.Round(valorImpostos, 2),
                ValorMargemLucro: Math.Round(valorLucro, 2),
                ValorMargemFaltas: Math.Round(valorFaltas, 2),
                ValorBeneficios: Math.Round(input.ValorBeneficiosExtrasMensal, 2),
                BaseParaSalarios: Math.Round(baseParaSalarios, 2),
                NumeroDePostos: input.NumeroDePostos,
                FuncionariosPorPosto: input.QuantidadeFuncionarios, // Funcionários por posto
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

