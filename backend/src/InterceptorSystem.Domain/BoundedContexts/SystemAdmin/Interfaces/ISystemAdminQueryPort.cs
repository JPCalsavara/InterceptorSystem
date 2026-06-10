using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterceptorSystem.Domain.BoundedContexts.SystemAdmin.Interfaces;

public class TenantMetricItem
{
    public Guid Id { get; set; }
    public string NomeEmpresa { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Plano { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public decimal FaturamentoEstimado { get; set; }
    public int TotalClientes { get; set; }
    public int TotalFuncionarios { get; set; }
    public bool Ativo { get; set; }
}

public class SystemDashboardMetrics
{
    public int TotalTenants { get; set; }
    public int TotalClientes { get; set; }
    public int TotalFuncionarios { get; set; }
    public int TotalPostos { get; set; }
    public decimal FaturamentoTotal { get; set; }
    public int TenantsAtivos { get; set; }
    public int TenantsInativos { get; set; }
    
    public List<TenantMetricItem> TenantsDetails { get; set; } = new();
}

public interface ISystemAdminQueryPort
{
    Task<SystemDashboardMetrics> GetGlobalMetricsAsync();
}
