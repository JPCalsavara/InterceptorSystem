using Microsoft.AspNetCore.Authorization;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
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
    private readonly IContratoCalculoService _contratoCalculoService;

    public ContratoCalculosController(IContratoCalculoService contratoCalculoService)
    {
        _contratoCalculoService = contratoCalculoService;
    }

    /// <summary>
    /// Calcula o valor total mensal do contrato baseado nos inputs e diárias estimadas
    /// </summary>
    [HttpPost("calcular-valor-total")]
    [ProducesResponseType(typeof(CalculoValorTotalOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<CalculoValorTotalOutput> CalcularValorTotal([FromBody] CalculoValorTotalInput input, CancellationToken ct = default)
    {
        try
        {
            if (input.ValorDiariaCobrada <= 0)
                return BadRequest(new { error = "Valor da diária deve ser maior que zero." });
            
            if (input.DiariasTotaisMes <= 0)
                return BadRequest(new { error = "Diárias totais deve ser maior que zero." });

            if (input.FuncionariosEstimados < 0)
                return BadRequest(new { error = "Funcionários estimados não pode ser negativo." });
            
            if (input.ValorBeneficiosExtrasMensal < 0)
                return BadRequest(new { error = "Valor de benefícios não pode ser negativo." });
            
            if (input.PercentualAdicionalNoturno < 0 || input.PercentualAdicionalNoturno > 1)
                return BadRequest(new { error = "Percentual adicional noturno deve estar entre 0 e 1." });

            if (input.PercentualAdicionalFimSemana < 0 || input.PercentualAdicionalFimSemana > 1)
                return BadRequest(new { error = "Percentual adicional fim de semana deve estar entre 0 e 1." });
            
            // Validar que encargos + margens não excedem 100%
            var totalPercentuais = input.PercentualEncargosProvisoes + 
                                  input.MargemLucroPercentual + 
                                  input.MargemCoberturaFaltasPercentual;
            if (totalPercentuais >= 1m)
                return BadRequest(new { 
                    error = $"Soma de encargos ({input.PercentualEncargosProvisoes:P}) + margens ({input.MargemLucroPercentual:P} + {input.MargemCoberturaFaltasPercentual:P}) não pode ser >= 100%. Total: {totalPercentuais:P}"
                });

            var output = _contratoCalculoService.CalcularValorTotal(input);
            return Ok(output);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Erro ao calcular valor total: {ex.Message}" });
        }
    }

    /// <summary>
    /// Simula custo mensal do contrato quando ainda não há alocações/diárias reais registradas.
    /// </summary>
    [HttpPost("simular-sem-alocacoes")]
    [ProducesResponseType(typeof(SimulacaoFinanceiraMensalOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<SimulacaoFinanceiraMensalOutput> SimularSemAlocacoes([FromBody] SimulacaoFinanceiraMensalInput input, CancellationToken ct = default)
    {
        try
        {
            if (input.ValorDiaria < 0)
                return BadRequest(new { error = "Valor da diária não pode ser negativo." });

            if (input.NumeroDePostos <= 0)
                return BadRequest(new { error = "Número de postos deve ser maior que zero." });

            if (input.AlocacoesPorPosto <= 0)
                return BadRequest(new { error = "Alocações por posto deve ser maior que zero." });

            if (input.FuncionariosPorAlocacao <= 0)
                return BadRequest(new { error = "Funcionários por alocação deve ser maior que zero." });

            if (input.DiasUteisMes < 0 || input.DiasFimSemanaMes < 0 || input.FeriadosAno < 0)
                return BadRequest(new { error = "Dias úteis, fim de semana e feriados não podem ser negativos." });

            if (input.PercentualAdicionalNoturno < 0 || input.PercentualAdicionalNoturno > 1)
                return BadRequest(new { error = "Percentual adicional noturno deve estar entre 0 e 1." });

            if (input.PercentualAdicionalFimSemana < 0 || input.PercentualAdicionalFimSemana > 1)
                return BadRequest(new { error = "Percentual adicional fim de semana deve estar entre 0 e 1." });

            // Validar que encargos + margens não excedem 100%
            var totalPercentuais = input.PercentualEncargosProvisoes + 
                                  input.MargemLucroPercentual + 
                                  input.MargemCoberturaFaltasPercentual;
            if (totalPercentuais >= 1m)
                return BadRequest(new { 
                    error = $"Soma de encargos ({input.PercentualEncargosProvisoes:P}) + margens ({input.MargemLucroPercentual:P} + {input.MargemCoberturaFaltasPercentual:P}) não pode ser >= 100%. Total: {totalPercentuais:P}"
                });

            var output = _contratoCalculoService.SimularSemAlocacoes(input);
            return Ok(output);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Erro ao simular custo sem alocações: {ex.Message}" });
        }
    }
}

