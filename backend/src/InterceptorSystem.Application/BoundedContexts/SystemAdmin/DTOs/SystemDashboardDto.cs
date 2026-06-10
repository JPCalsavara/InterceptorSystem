using System;
using System.Collections.Generic;

namespace InterceptorSystem.Application.BoundedContexts.SystemAdmin.DTOs;

public class TenantInfoItemDto
{
    public Guid Id { get; set; }
    public string NomeEmpresa { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Plano { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public decimal FaturamentoEstimado { get; set; }
    public int TotalClientes { get; set; }
    public int TotalFuncionarios { get; set; }
}

public class SystemDashboardDto
{
    public int TotalTenants { get; set; }
    public int TotalClientes { get; set; }
    public int TotalFuncionarios { get; set; }
    public int TotalPostos { get; set; }
    public decimal FaturamentoTotal { get; set; }
    
    public double MediaClientesPorTenant { get; set; }
    public double MediaFuncionariosPorTenant { get; set; }
    public double MediaPostosPorTenant { get; set; }

    public int TenantsAtivos { get; set; }
    public int TenantsInativos { get; set; }
    
    public List<TenantInfoItemDto> TopTenantsPorFaturamento { get; set; } = new();
    public List<TenantInfoItemDto> TenantsMaisAntigos { get; set; } = new();
    public List<TenantInfoItemDto> TenantsMaisRecentes { get; set; } = new();
}
