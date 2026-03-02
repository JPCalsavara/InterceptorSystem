using System.ComponentModel.DataAnnotations;

namespace InterceptorSystem.Application.Common.Settings;

/// <summary>
/// Configurações da Meta WhatsApp Business API.
/// Campos são opcionais pois WhatsApp não é necessário para dev local.
/// </summary>
public class MetaSettings
{
    public const string SectionName = "Meta";

    public string? PhoneNumberId { get; set; }

    public string? AccessToken { get; set; }

    public string? WebhookVerifyToken { get; set; }
}
