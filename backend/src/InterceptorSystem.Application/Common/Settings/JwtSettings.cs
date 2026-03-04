using System.ComponentModel.DataAnnotations;

namespace InterceptorSystem.Application.Common.Settings;

/// <summary>
/// Configurações JWT validadas no startup via DataAnnotations.
/// Garante que a aplicação não inicia sem as configurações obrigatórias.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    [Required(ErrorMessage = "Jwt:Key é obrigatório.")]
    [MinLength(32, ErrorMessage = "Jwt:Key deve ter pelo menos 32 caracteres para segurança adequada.")]
    public string Key { get; set; } = null!;

    [Required(ErrorMessage = "Jwt:Issuer é obrigatório.")]
    public string Issuer { get; set; } = null!;

    [Required(ErrorMessage = "Jwt:Audience é obrigatório.")]
    public string Audience { get; set; } = null!;

    [Range(1, 720, ErrorMessage = "Jwt:ExpiresInHours deve estar entre 1 e 720 horas.")]
    public int ExpiresInHours { get; set; } = 24;
}
