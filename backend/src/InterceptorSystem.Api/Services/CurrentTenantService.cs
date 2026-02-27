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
            // 1. Pega do JWT claim "empresaId" (caminho principal em produção)
            var jwtClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("empresaId")?.Value;
            if (Guid.TryParse(jwtClaim, out var tenantIdFromJwt))
                return tenantIdFromJwt;

            // 2. Tenta pegar do Header (Postman/Swagger manual)
            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-Tenant-Id"].FirstOrDefault();
            if (Guid.TryParse(headerValue, out var tenantIdFromHeader))
                return tenantIdFromHeader;

            return null;
        }
    }

    public string? UsuarioId
    {
        get
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
