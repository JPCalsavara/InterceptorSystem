using System;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Dtos;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/contratos/custo-real")]
    public class ContratoCustoRealController : TenantControllerBase
    {
        private readonly IContratoCustoRealAppService _contratoCustoRealAppService;

        public ContratoCustoRealController(
            IContratoCustoRealAppService contratoCustoRealAppService,
            ICurrentTenantService currentTenantService) : base(currentTenantService)
        {
            _contratoCustoRealAppService = contratoCustoRealAppService;
        }

        [HttpPost("calcular")]
        [ProducesResponseType(typeof(CustoRealOutput), StatusCodes.Status200OK)]
        public async Task<IActionResult> CalcularCustoReal([FromBody] CustoRealRequest request, CancellationToken ct = default)
        {
            var result = await _contratoCustoRealAppService.CalcularCustoRealAsync(request.ClienteId, request.FaturamentoSimulado);
            return Ok(result);
        }
    }

    public class CustoRealRequest
    {
        public Guid ClienteId { get; set; }
        public decimal FaturamentoSimulado { get; set; }
    }
}
