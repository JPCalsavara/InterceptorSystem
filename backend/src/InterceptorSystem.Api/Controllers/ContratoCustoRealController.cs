using System;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers
{
    [ApiController]
    [Route("api/contratos/custo-real")]
    public class ContratoCustoRealController : ControllerBase
    {
        private readonly IContratoCustoRealAppService _contratoCustoRealAppService;

        public ContratoCustoRealController(IContratoCustoRealAppService contratoCustoRealAppService)
        {
            _contratoCustoRealAppService = contratoCustoRealAppService;
        }

        [HttpPost("calcular")]
        public async Task<IActionResult> CalcularCustoReal([FromBody] CustoRealRequest request)
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
