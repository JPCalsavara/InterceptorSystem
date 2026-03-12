using System.ComponentModel.DataAnnotations;

namespace InterceptorSystem.Application.Modulos.Contato.DTOs;

public class ContatoDto
{
    [Required]
    [MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Cidade { get; set; } = string.Empty;

    [Required]
    [MaxLength(2)]
    public string Estado { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(300)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Descricao { get; set; } = string.Empty;
}
