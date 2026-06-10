using InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using InterceptorSystem.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/whatsapp/sessoes")]
public class SessoesWhatsappController : TenantControllerBase
{
    private readonly IWhatsappAdminService _service;

    public SessoesWhatsappController(IWhatsappAdminService service, ICurrentTenantService currentTenant) 
        : base(currentTenant)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SessaoWhatsappDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await _service.GetSessoesAsync(ct);
        return Ok(result);
    }
}
