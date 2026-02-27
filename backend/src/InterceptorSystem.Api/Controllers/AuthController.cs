using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthAppService _authAppService;
    private readonly ICurrentTenantService _currentTenantService;

    public AuthController(IAuthAppService authAppService, ICurrentTenantService currentTenantService)
    {
        _authAppService = authAppService;
        _currentTenantService = currentTenantService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarContaDtoInput input)
    {
        try
        {
            var result = await _authAppService.RegistrarAsync(input);
            return Created(string.Empty, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDtoInput input)
    {
        try
        {
            var result = await _authAppService.LoginAsync(input);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { mensagem = ex.Message });
        }
    }

    [HttpPost("email/confirmar")]
    public async Task<IActionResult> ConfirmarEmail([FromBody] ConfirmarTokenDtoInput input)
    {
        try
        {
            await _authAppService.ConfirmarEmailAsync(input);
            return Ok(new { mensagem = "E-mail verificado com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("email/reenviar")]
    public async Task<IActionResult> ReenviarVerificacaoEmail()
    {
        var empresaId = _currentTenantService.EmpresaId;
        if (empresaId == null)
            return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            await _authAppService.ReenviarVerificacaoEmailAsync(empresaId.Value);
            return Ok(new { mensagem = "E-mail de verificação reenviado." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPost("senha/solicitar-reset")]
    public async Task<IActionResult> SolicitarResetSenha([FromBody] SolicitarResetSenhaDtoInput input)
    {
        await _authAppService.SolicitarResetSenhaAsync(input);
        return Ok(new { mensagem = "Se o e-mail estiver cadastrado, você receberá as instruções em breve." });
    }

    [HttpPost("senha/confirmar-reset")]
    public async Task<IActionResult> ConfirmarResetSenha([FromBody] ConfirmarResetSenhaDtoInput input)
    {
        try
        {
            await _authAppService.ConfirmarResetSenhaAsync(input);
            return Ok(new { mensagem = "Senha redefinida com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("email/solicitar-alteracao")]
    public async Task<IActionResult> SolicitarAlteracaoEmail([FromBody] SolicitarAlteracaoEmailDtoInput input)
    {
        var empresaId = _currentTenantService.EmpresaId;
        if (empresaId == null)
            return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            await _authAppService.SolicitarAlteracaoEmailAsync(empresaId.Value, input);
            return Ok(new { mensagem = "E-mail de confirmação enviado para o novo endereço." });
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

    [HttpPost("email/confirmar-alteracao")]
    public async Task<IActionResult> ConfirmarAlteracaoEmail([FromBody] ConfirmarTokenDtoInput input)
    {
        try
        {
            await _authAppService.ConfirmarAlteracaoEmailAsync(input);
            return Ok(new { mensagem = "E-mail alterado com sucesso." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}
