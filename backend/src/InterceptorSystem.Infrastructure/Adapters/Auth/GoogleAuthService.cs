using Google.Apis.Auth;
using InterceptorSystem.Application.BoundedContexts.Auth.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterceptorSystem.Infrastructure.Adapters.Auth;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;

    public GoogleAuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<GoogleUserDto> ValidarTokenAsync(string idToken)
    {
        try
        {
            var clientId = _configuration["Authentication:Google:ClientId"];
            if (string.IsNullOrEmpty(clientId))
                throw new InvalidOperationException("Google ClientId não está configurado.");

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new GoogleUserDto
            {
                Email = payload.Email,
                Nome = payload.Name,
                EmailVerificado = payload.EmailVerified
            };
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("Token do Google inválido.", ex);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException("Erro ao validar token do Google.", ex);
        }
    }
}
