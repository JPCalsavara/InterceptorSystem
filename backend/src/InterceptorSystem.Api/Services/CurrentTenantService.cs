using System.Security.Claims;
using InterceptorSystem.Application.Common.Interfaces;

namespace InterceptorSystem.Api.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? EmpresaId
    {
        get
        {
            // 1. Tenta pegar do Header (Postman/Curl)
            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Id"].FirstOrDefault();
            if (Guid.TryParse(headerValue, out var tenantIdFromHeader))
            {
                return tenantIdFromHeader;
            }

            // 2. MODO DESENVOLVIMENTO (O "Pulo do Gato" para o Swagger funcionar)
            // Se não achou nada, retornamos um ID fixo de teste.
            // Assim o Swagger funciona sem precisar configurar headers complexos.
            return Guid.Parse("d3b07384-d9a1-4d3b-923f-561917637840"); 
        }
    }

    public string? UsuarioId
    {
        get
        {
            // Pega o ID padrão do usuário (ClaimTypes.NameIdentifier ou "sub")
            return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}