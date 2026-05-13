using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Contato.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/contato")]
[EnableRateLimiting("email-limit")]
public class ContatoController : TenantControllerBase
{
    private readonly IEmailService _emailService;

    public ContatoController(IEmailService emailService, ICurrentTenantService currentTenant) : base(currentTenant)
    {
        _emailService = emailService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> EnviarContato([FromBody] ContatoDto dto, CancellationToken ct = default)
    {
        // Missing propagation to _emailService, assuming service doesn't take CancellationToken yet
        await _emailService.EnviarContatoAsync(dto.Nome, dto.Cidade, dto.Estado, dto.Email, dto.Descricao);
        return Ok(new { mensagem = "Mensagem enviada com sucesso!" });
    }
}
