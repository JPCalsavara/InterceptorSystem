using System.Text.Json.Serialization;

namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;

// -----------------------------------------------------------------------
// Payload enviado pela Meta Cloud API ao webhook quando uma mensagem chega
// -----------------------------------------------------------------------

public record MetaWebhookPayload(
    [property: JsonPropertyName("object")] string Object,
    [property: JsonPropertyName("entry")]  List<MetaEntry> Entry);

public record MetaEntry(
    [property: JsonPropertyName("changes")] List<MetaChange> Changes);

public record MetaChange(
    [property: JsonPropertyName("field")] string Field,
    [property: JsonPropertyName("value")] MetaChangeValue Value);

public record MetaChangeValue(
    [property: JsonPropertyName("messages")] List<MetaMessage>? Messages);

public record MetaMessage(
    [property: JsonPropertyName("from")] string From,   // Telefone E.164 do remetente
    [property: JsonPropertyName("type")] string Type,   // "text", "image", etc.
    [property: JsonPropertyName("text")] MetaTextBody? Text);

public record MetaTextBody(
    [property: JsonPropertyName("body")] string Body);

// -----------------------------------------------------------------------
// DTOs internos de requisição para os endpoints da Conta (telefone)
// -----------------------------------------------------------------------

public record CadastrarTelefoneDtoInput(string Telefone);

public record ConfirmarTelefoneDtoInput(string Token);
