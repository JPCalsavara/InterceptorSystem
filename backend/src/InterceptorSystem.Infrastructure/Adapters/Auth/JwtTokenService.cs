using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Common.Settings;
using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InterceptorSystem.Infrastructure.Adapters.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(IOptions<JwtSettings> options)
    {
        _settings = options.Value;
    }

    public string GerarToken(Conta conta)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, conta.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, conta.Email.Valor),
            new Claim("empresaId", conta.Id.ToString()),
            new Claim("nomeEmpresa", conta.NomeEmpresa),
            new Claim("plano", conta.Plano.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_settings.ExpiresInHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
