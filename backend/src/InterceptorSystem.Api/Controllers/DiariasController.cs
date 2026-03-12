using Microsoft.AspNetCore.Authorization;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/diarias")]
public class DiariasController : ControllerBase
{
    private readonly IDiariaAppService _service;

    public DiariasController(IDiariaAppService service)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(typeof(DiariaDtoOutput), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateDiariaDtoInput input)
    {
        try
        {
            var result = await _service.CreateAsync(input);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(List<DiariaDtoOutput>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBatch(CreateDiariasBatchDtoInput batch)
    {
        try
        {
            var result = await _service.CreateBatchAsync(batch);
            return Created($"/api/diarias", result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DiariaDtoOutput>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("/api/clientes/{clienteId}/diarias")]
    [ProducesResponseType(typeof(IEnumerable<DiariaDtoOutput>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCliente(Guid clienteId)
    {
        var result = await _service.GetByClienteIdAsync(clienteId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DiariaDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DiariaDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdateDiariaDtoInput input)
    {
        try
        {
            var result = await _service.UpdateAsync(id, input);
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
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
