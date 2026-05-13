using Microsoft.AspNetCore.Mvc;
using InterceptorSystem.Application.Common.Interfaces;

namespace InterceptorSystem.Api.Controllers;

/// <summary>
/// Base controller that exposes current tenant helpers and common validations.
/// Phase 1: centralize simple tenant checks to avoid scattering Forbid() logic.
/// </summary>
public abstract class TenantControllerBase : ControllerBase
{
    protected readonly ICurrentTenantService _currentTenant;

    protected Guid? EmpresaId => _currentTenant?.EmpresaId;

    protected TenantControllerBase(ICurrentTenantService currentTenant)
    {
        _currentTenant = currentTenant;
    }

    /// <summary>
    /// Returns a Forbid() IActionResult when the provided resourceEmpresaId differs
    /// from the current tenant (when current tenant is present). Returns null when ok.
    /// Controllers can call: var res = VerifyOwnership(entity.EmpresaId); if (res != null) return res;
    /// </summary>
    protected IActionResult? VerifyOwnership(Guid resourceEmpresaId)
    {
        if (EmpresaId.HasValue && resourceEmpresaId != EmpresaId.Value)
            return Forbid();
        return null;
    }
}
