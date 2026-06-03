using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.SystemAdmin.DTOs;
using InterceptorSystem.Application.BoundedContexts.SystemAdmin.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.SystemAdmin.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.SystemAdmin.Services;

public class SystemAdminAppService : ISystemAdminAppService
{
    private readonly ISystemAdminQueryPort _queryPort;

    public SystemAdminAppService(ISystemAdminQueryPort queryPort)
    {
        _queryPort = queryPort;
    }

    public async Task<SystemDashboardDto> GetDashboardMetricsAsync()
    {
        var metrics = await _queryPort.GetGlobalMetricsAsync();
        
        var totalTenants = metrics.TotalTenants > 0 ? metrics.TotalTenants : 1;

        return new SystemDashboardDto
        {
            TotalTenants = metrics.TotalTenants,
            TotalClientes = metrics.TotalClientes,
            TotalFuncionarios = metrics.TotalFuncionarios,
            TotalPostos = metrics.TotalPostos,
            FaturamentoTotal = metrics.FaturamentoTotal,
            MediaClientesPorTenant = (double)metrics.TotalClientes / totalTenants,
            MediaFuncionariosPorTenant = (double)metrics.TotalFuncionarios / totalTenants,
            MediaPostosPorTenant = (double)metrics.TotalPostos / totalTenants,
            TenantsAtivos = metrics.TenantsAtivos,
            TenantsInativos = metrics.TenantsInativos,
            TopTenantsPorFaturamento = metrics.TenantsDetails
                .OrderByDescending(t => t.FaturamentoEstimado)
                .Take(5)
                .Select(MapItem)
                .ToList(),
            TenantsMaisAntigos = metrics.TenantsDetails
                .OrderBy(t => t.CreatedAt)
                .Take(5)
                .Select(MapItem)
                .ToList(),
            TenantsMaisRecentes = metrics.TenantsDetails
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(MapItem)
                .ToList()
        };
    }

    private static TenantInfoItemDto MapItem(TenantMetricItem t) => new()
    {
        Id = t.Id,
        NomeEmpresa = t.NomeEmpresa,
        Email = t.Email,
        Plano = t.Plano,
        CreatedAt = t.CreatedAt,
        FaturamentoEstimado = t.FaturamentoEstimado,
        TotalClientes = t.TotalClientes,
        TotalFuncionarios = t.TotalFuncionarios
    };
}
