using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Auth.DTOs;
using InterceptorSystem.Application.BoundedContexts.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
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
    [ProducesResponseType(typeof(AuthResultDtoOutput), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Registrar([FromBody] RegistrarContaDtoInput input, CancellationToken ct = default)
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
    [ProducesResponseType(typeof(AuthResultDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDtoInput input, CancellationToken ct = default)
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

    [HttpPost("login/google")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResultDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginGoogle([FromBody] LoginGoogleDtoInput input, CancellationToken ct = default)
    {
        var result = await _authAppService.LoginComGoogleAsync(input);
        return Ok(result);
    }

    [HttpPost("email/confirmar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmarEmail([FromBody] ConfirmarTokenDtoInput input, CancellationToken ct = default)
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReenviarVerificacaoEmail(CancellationToken ct = default)
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SolicitarResetSenha([FromBody] SolicitarResetSenhaDtoInput input, CancellationToken ct = default)
    {
        await _authAppService.SolicitarResetSenhaAsync(input);
        return Ok(new { mensagem = "Se o e-mail estiver cadastrado, você receberá as instruções em breve." });
    }

    [HttpPost("senha/confirmar-reset")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmarResetSenha([FromBody] ConfirmarResetSenhaDtoInput input, CancellationToken ct = default)
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SolicitarAlteracaoEmail([FromBody] SolicitarAlteracaoEmailDtoInput input, CancellationToken ct = default)
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmarAlteracaoEmail([FromBody] ConfirmarTokenDtoInput input, CancellationToken ct = default)
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
