using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AlocacaoController : TenantControllerBase
{
    private readonly IAlocacaoAppService _appService;
    public AlocacaoController(IAlocacaoAppService appService, InterceptorSystem.Application.Common.Interfaces.ICurrentTenantService currentTenant) : base(currentTenant)
    {
        _appService = appService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetAll(CancellationToken ct = default)
    {
        var result = await _appService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AlocacaoDto>> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await _appService.GetByIdAsync(id, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("/api/clientes/{clienteId}/alocacoes")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByClienteId(Guid clienteId, CancellationToken ct = default)
    {
        var result = await _appService.GetByClienteIdAsync(clienteId, ct);
        return Ok(result);
    }

    [HttpGet("posto/{postoId}")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByPostoId(Guid postoId, CancellationToken ct = default)
    {
        var result = await _appService.GetByPostoIdAsync(postoId, ct);
        return Ok(result);
    }

    [HttpGet("contrato/{contratoId}")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByContratoId(Guid contratoId, CancellationToken ct = default)
    {
        var result = await _appService.GetByContratoIdAsync(contratoId, ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<AlocacaoDto>> Create(CreateAlocacaoInput input, CancellationToken ct = default)
    {
        var result = await _appService.CreateAsync(input, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AlocacaoDto>> Update(Guid id, UpdateAlocacaoInput input, CancellationToken ct = default)
    {
        var result = await _appService.UpdateAsync(id, input, ct);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        await _appService.DeleteAsync(id, ct);
        return NoContent();
    }
}
