using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.DTOs;
using InterceptorSystem.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/conta")]
[Authorize]
public class ContaController : ControllerBase
{
    private readonly IAuthAppService _authAppService;
    private readonly ICurrentTenantService _currentTenantService;

    public ContaController(IAuthAppService authAppService, ICurrentTenantService currentTenantService)
    {
        _authAppService = authAppService;
        _currentTenantService = currentTenantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPerfil()
    {
        var empresaId = _currentTenantService.EmpresaId;
        if (empresaId == null)
            return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            var result = await _authAppService.GetContaAsync(empresaId.Value);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> AtualizarPerfil([FromBody] AtualizarContaDtoInput input)
    {
        var empresaId = _currentTenantService.EmpresaId;
        if (empresaId == null)
            return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            var result = await _authAppService.AtualizarContaAsync(empresaId.Value, input);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPost("telefone")]
    public async Task<IActionResult> CadastrarTelefone([FromBody] CadastrarTelefoneDtoInput input)
    {
        var empresaId = _currentTenantService.EmpresaId;
        if (empresaId == null)
            return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            await _authAppService.CadastrarTelefoneAsync(empresaId.Value, input.Telefone);
            return Ok(new { mensagem = "Código de verificação enviado por WhatsApp." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPost("telefone/confirmar")]
    public async Task<IActionResult> ConfirmarTelefone([FromBody] ConfirmarTelefoneDtoInput input)
    {
        try
        {
            await _authAppService.ConfirmarTelefoneAsync(input.Token);
            return Ok(new { mensagem = "Telefone verificado com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
