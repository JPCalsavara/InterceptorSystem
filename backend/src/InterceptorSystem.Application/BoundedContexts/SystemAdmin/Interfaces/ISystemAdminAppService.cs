using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.SystemAdmin.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.SystemAdmin.Interfaces;

public interface ISystemAdminAppService
{
    Task<SystemDashboardDto> GetDashboardMetricsAsync();
}
