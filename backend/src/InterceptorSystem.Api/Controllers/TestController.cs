using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using System;

namespace InterceptorSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IDiariaAppService _diariaAppService;

        public TestController(IDiariaAppService diariaAppService)
        {
            _diariaAppService = diariaAppService;
        }

        [HttpGet("{contratoId}/{ano}/{mes}")]
        public async Task<IActionResult> Get(Guid contratoId, int ano, int mes)
        {
            var result = await _diariaAppService.GetResumoFinanceiroContratoAsync(contratoId, ano, mes);
            return Ok(result);
        }
    }
}
