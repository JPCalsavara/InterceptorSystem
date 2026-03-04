using InterceptorSystem.Application.Modulos.Whatsapp.DTOs;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/whatsapp")]
[AllowAnonymous]
public class WhatsappWebhookController : ControllerBase
{
    private readonly IWhatsappBotService _bot;
    private readonly string _verifyToken;

    public WhatsappWebhookController(IWhatsappBotService bot, IConfiguration configuration)
    {
        _bot = bot;
        _verifyToken = configuration["Meta:WebhookVerifyToken"]
            ?? throw new InvalidOperationException("Meta:WebhookVerifyToken não configurado.");
    }

    /// <summary>
    /// Verificação de webhook exigida pela Meta ao configurar o endpoint.
    /// GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
    /// </summary>
    [HttpGet("webhook")]
    public IActionResult VerificarWebhook(
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string token,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        if (mode == "subscribe" && token == _verifyToken)
            return Ok(challenge);

        return Forbid();
    }

    /// <summary>
    /// Recebe eventos da Meta (mensagens recebidas).
    /// Retorna 200 imediatamente; o processamento ocorre em background.
    /// </summary>
    [HttpPost("webhook")]
    public IActionResult ReceberMensagem([FromBody] MetaWebhookPayload payload)
    {
        var mensagens = payload.Entry
            .SelectMany(e => e.Changes)
            .Where(c => c.Field == "messages")
            .SelectMany(c => c.Value.Messages ?? []);

        foreach (var msg in mensagens)
        {
            if (msg.Type != "text" || msg.Text?.Body is null) continue;

            var telefone = msg.From;
            var texto = msg.Text.Body;

            // Fire-and-forget: retorna 200 imediatamente para a Meta
            _ = Task.Run(() => _bot.ProcessarMensagemAsync(telefone, texto));
        }

        return Ok();
    }
}
