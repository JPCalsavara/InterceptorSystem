using System.ComponentModel.DataAnnotations;

namespace InterceptorSystem.Application.Common.Settings;

/// <summary>
/// Configurações SMTP validadas no startup via DataAnnotations.
/// Username e Password são opcionais pois MailHog (dev) não exige autenticação.
/// </summary>
public class SmtpSettings
{
    public const string SectionName = "Smtp";

    [Required(ErrorMessage = "Smtp:Host é obrigatório.")]
    public string Host { get; set; } = null!;

    [Range(1, 65535, ErrorMessage = "Smtp:Port deve estar entre 1 e 65535.")]
    public int Port { get; set; }

    /// <summary>Opcional — MailHog e servidores dev não exigem autenticação.</summary>
    public string? Username { get; set; }

    /// <summary>Opcional — MailHog e servidores dev não exigem autenticação.</summary>
    public string? Password { get; set; }

    [Required(ErrorMessage = "Smtp:FromAddress é obrigatório.")]
    [EmailAddress(ErrorMessage = "Smtp:FromAddress deve ser um e-mail válido.")]
    public string FromAddress { get; set; } = null!;

    [Required(ErrorMessage = "Smtp:FromName é obrigatório.")]
    public string FromName { get; set; } = null!;

    public string SecureSocket { get; set; } = "StartTls";
}
