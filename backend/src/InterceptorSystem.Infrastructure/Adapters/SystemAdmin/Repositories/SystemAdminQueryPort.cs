using InterceptorSystem.Domain.BoundedContexts.SystemAdmin.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace InterceptorSystem.Infrastructure.Adapters.SystemAdmin.Repositories;

public class SystemAdminQueryPort : ISystemAdminQueryPort
{
    private readonly ApplicationDbContext _context;

    public SystemAdminQueryPort(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SystemDashboardMetrics> GetGlobalMetricsAsync()
    {
        var tenants = await _context.Contas.CountAsync();
        var tenantsAtivos = await _context.Contas.CountAsync(c => c.Ativo);
        var clientes = await _context.Clientes.IgnoreQueryFilters().CountAsync();
        var funcionarios = await _context.Funcionarios.IgnoreQueryFilters().CountAsync();
        var postos = await _context.Postos.IgnoreQueryFilters().CountAsync();
        
        var faturamento = await _context.Contratos.IgnoreQueryFilters()
            .Where(c => c.Status == InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums.StatusContrato.ATIVO)
            .SumAsync(c => c.ValorTotalMensal);

        var contas = await _context.Contas.ToListAsync();
        var tenantsDetails = new System.Collections.Generic.List<TenantMetricItem>();

        foreach (var conta in contas)
        {
            var fat = await _context.Contratos.IgnoreQueryFilters()
                .Where(c => c.EmpresaId == conta.Id && c.Status == InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums.StatusContrato.ATIVO)
                .SumAsync(c => c.ValorTotalMensal);

            var totalCli = await _context.Clientes.IgnoreQueryFilters().CountAsync(c => c.EmpresaId == conta.Id);
            var totalFunc = await _context.Funcionarios.IgnoreQueryFilters().CountAsync(f => f.EmpresaId == conta.Id);

            tenantsDetails.Add(new TenantMetricItem
            {
                Id = conta.Id,
                NomeEmpresa = conta.NomeEmpresa,
                Email = conta.Email.Valor,
                Plano = conta.Plano.ToString(),
                CreatedAt = conta.CreatedAt,
                Ativo = conta.Ativo,
                FaturamentoEstimado = fat,
                TotalClientes = totalCli,
                TotalFuncionarios = totalFunc
            });
        }

        return new SystemDashboardMetrics
        {
            TotalTenants = tenants,
            TenantsAtivos = tenantsAtivos,
            TenantsInativos = tenants - tenantsAtivos,
            TotalClientes = clientes,
            TotalFuncionarios = funcionarios,
            TotalPostos = postos,
            FaturamentoTotal = faturamento,
            TenantsDetails = tenantsDetails
        };
    }
}
