namespace InterceptorSystem.Application.BoundedContexts.Auth.Interfaces;

public class GoogleUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public bool EmailVerificado { get; set; }
}

public interface IGoogleAuthService
{
    Task<GoogleUserDto> ValidarTokenAsync(string idToken);
}
