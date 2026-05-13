using System.Net.Http.Json;
using System.Text.Json;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterceptorSystem.Infrastructure.Adapters.Whatsapp;

/// <summary>
/// Implementação do IWhatsappMessageSender usando a Meta Cloud API (WhatsApp Business).
/// Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
/// </summary>
public class MetaWhatsappMessageSender : IWhatsappMessageSender
{
    private readonly HttpClient _http;
    private readonly string _phoneNumberId;
    private readonly string _accessToken;

    public MetaWhatsappMessageSender(HttpClient http, IConfiguration configuration)
    {
        _http = http;
        _phoneNumberId = configuration["Meta:PhoneNumberId"]
            ?? throw new InvalidOperationException("Meta:PhoneNumberId não configurado.");
        _accessToken = configuration["Meta:AccessToken"]
            ?? throw new InvalidOperationException("Meta:AccessToken não configurado.");
    }

    public async Task EnviarTextoAsync(string telefoneDestino, string mensagem,
        CancellationToken ct = default)
    {
        var url = $"https://graph.facebook.com/v19.0/{_phoneNumberId}/messages";

        var payload = new
        {
            messaging_product = "whatsapp",
            to = telefoneDestino,
            type = "text",
            text = new { body = mensagem }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Add("Authorization", $"Bearer {_accessToken}");

        var response = await _http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
    }
}
