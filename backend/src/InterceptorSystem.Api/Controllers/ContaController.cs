using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
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
}
