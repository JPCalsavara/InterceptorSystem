using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Contato.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/contato")]
public class ContatoController : ControllerBase
{
    private readonly IEmailService _emailService;

    public ContatoController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> EnviarContato([FromBody] ContatoDto dto)
    {
        await _emailService.EnviarContatoAsync(dto.Nome, dto.Cidade, dto.Estado, dto.Email, dto.Descricao);
        return Ok(new { mensagem = "Mensagem enviada com sucesso!" });
    }
}
