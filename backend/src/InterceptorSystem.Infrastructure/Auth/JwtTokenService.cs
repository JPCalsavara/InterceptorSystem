using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InterceptorSystem.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GerarToken(Conta conta)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key não configurado.");
        var issuer = _configuration["Jwt:Issuer"] ?? "InterceptorSystem";
        var audience = _configuration["Jwt:Audience"] ?? "InterceptorSystem";
        var expiresInHours = int.Parse(_configuration["Jwt:ExpiresInHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, conta.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, conta.Email),
            new Claim("empresaId", conta.Id.ToString()),
            new Claim("nomeEmpresa", conta.NomeEmpresa),
            new Claim("plano", conta.Plano.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresInHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
