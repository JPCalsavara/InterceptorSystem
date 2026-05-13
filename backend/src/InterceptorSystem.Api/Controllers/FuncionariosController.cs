using Microsoft.AspNetCore.Authorization;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using Microsoft.AspNetCore.Mvc;
using InterceptorSystem.Application.Common.Interfaces;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/funcionarios")]
public class FuncionariosController : TenantControllerBase
{
    private readonly IFuncionarioAppService _service;

    public FuncionariosController(IFuncionarioAppService service, ICurrentTenantService currentTenant) : base(currentTenant)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(typeof(FuncionarioDtoOutput), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateFuncionarioDtoInput input, CancellationToken ct = default)
    {
        try
        {
            var result = await _service.CreateAsync(input, ct);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<FuncionarioDtoOutput>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("/api/clientes/{clienteId}/funcionarios")]
    [ProducesResponseType(typeof(IEnumerable<FuncionarioDtoOutput>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCliente(Guid clienteId, CancellationToken ct = default)
    {
        var result = await _service.GetByClienteIdAsync(clienteId, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FuncionarioDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(FuncionarioDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdateFuncionarioDtoInput input, CancellationToken ct = default)
    {
        try
        {
            var result = await _service.UpdateAsync(id, input, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        try
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

