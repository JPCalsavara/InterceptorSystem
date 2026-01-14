using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

/// <summary>
/// FASE 5: Controller para criação em cascata de Condomínio completo
/// </summary>
[Authorize]
[ApiController]
[Route("api/condominios-completos")]
public class CondominiosCompletosController : ControllerBase
{
    private readonly ICondominioOrquestradorService _orquestradorService;

    public CondominiosCompletosController(ICondominioOrquestradorService orquestradorService)
    {
        _orquestradorService = orquestradorService;
    }

    /// <summary>
    /// Cria um condomínio completo com contrato e postos de trabalho automaticamente
    /// </summary>
    /// <remarks>
    /// FASE 5: Endpoint orquestrado que cria:
    /// 1. Condomínio
    /// 2. Contrato vinculado
    /// 3. Postos de Trabalho (turnos automáticos)
    /// 
    /// Exemplo de request:
    /// 
    ///     POST /api/condominios-completos
    ///     {
    ///       "condominio": {
    ///         "nome": "Residencial Estrela",
    ///         "cnpj": "12.345.678/0001-90",
    ///         "endereco": "Rua das Flores, 123",
    ///         "quantidadeFuncionariosIdeal": 12,
    ///         "horarioTrocaTurno": "06:00:00",
    ///         "emailGestor": "gestor@estrela.com",
    ///         "telefoneEmergencia": "+5511999999999"
    ///       },
    ///       "contrato": {
    ///         "descricao": "Contrato de Portaria 2026",
    ///         "valorTotalMensal": 36000.00,
    ///         "valorDiariaCobrada": 120.00,
    ///         "percentualAdicionalNoturno": 0.30,
    ///         "valorBeneficiosExtrasMensal": 3600.00,
    ///         "percentualImpostos": 0.15,
    ///         "quantidadeFuncionarios": 12,
    ///         "margemLucroPercentual": 0.20,
    ///         "margemCoberturaFaltasPercentual": 0.10,
    ///         "dataInicio": "2026-01-01",
    ///         "dataFim": "2026-12-31",
    ///         "status": "PAGO"
    ///       },
    ///       "criarPostosAutomaticamente": true,
    ///       "numeroDePostos": 2
    ///     }
    /// 
    /// </remarks>
    /// <response code="201">Condomínio completo criado com sucesso</response>
    /// <response code="400">Dados inválidos ou regras de negócio violadas</response>
    [HttpPost]
    [ProducesResponseType(typeof(CondominioCompletoDtoOutput), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCompleto([FromBody] CreateCondominioCompletoDtoInput input)
    {
        try
        {
            var resultado = await _orquestradorService.CriarCondominioCompletoAsync(input);
            
            // Retorna 201 Created com o resultado completo
            return StatusCode(201, resultado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno ao criar condomínio completo.", details = ex.Message });
        }
    }

    /// <summary>
    /// Valida se é possível criar um condomínio completo com os dados fornecidos
    /// </summary>
    /// <remarks>
    /// FASE 5: Endpoint de validação prévia (dry-run)
    /// Útil para UX - validar antes do usuário clicar em "Salvar"
    /// </remarks>
    [HttpPost("validar")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Validar([FromBody] CreateCondominioCompletoDtoInput input)
    {
        var (valido, mensagemErro) = await _orquestradorService.ValidarCriacaoCompletaAsync(input);
        
        if (valido)
        {
            return Ok(new { valido = true, mensagem = "Dados válidos para criação." });
        }
        
        return BadRequest(new { valido = false, erro = mensagemErro });
    }
}

