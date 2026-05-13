using Microsoft.AspNetCore.Authorization;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using Microsoft.AspNetCore.Mvc;
using InterceptorSystem.Application.Common.Interfaces;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/clientes")]
public class ClientesController : TenantControllerBase
{
    private readonly IClienteAppService _service;

    public ClientesController(IClienteAppService service, ICurrentTenantService currentTenant) : base(currentTenant)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ClienteDtoOutput), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreateClienteDtoInput input, CancellationToken ct = default)
    {
        try
        {
            var result = await _service.CreateAsync(input, ct);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ClienteDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct = default)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ClienteDtoOutput>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ClienteDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, UpdateClienteDtoInput input, CancellationToken ct = default)
    {
        try 
        {
            var result = await _service.UpdateAsync(id, input, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        try 
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }
}

