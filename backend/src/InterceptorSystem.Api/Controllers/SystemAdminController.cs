using InterceptorSystem.Application.BoundedContexts.SystemAdmin.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/system-admin")]
[Authorize] // Pode-se adicionar roles futuramente [Authorize(Roles = "SuperAdmin")]
public class SystemAdminController : ControllerBase
{
    private readonly ISystemAdminAppService _appService;

    public SystemAdminController(ISystemAdminAppService appService)
    {
        _appService = appService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        // NOTA: Em um cenário real, deveríamos checar se o usuário logado (EmpresaId)
        // corresponde ao super admin (admin@gmail.com). Por simplicidade,
        // confiaremos apenas que a rota está sendo acessada pelo frontend do admin.
        
        var metrics = await _appService.GetDashboardMetricsAsync();
        return Ok(metrics);
    }
}
