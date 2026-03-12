using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AlocacaoController : ControllerBase
{
    private readonly IAlocacaoAppService _appService;

    public AlocacaoController(IAlocacaoAppService appService)
    {
        _appService = appService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetAll()
    {
        var result = await _appService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AlocacaoDto>> GetById(Guid id)
    {
        var result = await _appService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("/api/clientes/{clienteId}/alocacoes")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByClienteId(Guid clienteId)
    {
        var result = await _appService.GetByClienteIdAsync(clienteId);
        return Ok(result);
    }

    [HttpGet("posto/{postoId}")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByPostoId(Guid postoId)
    {
        var result = await _appService.GetByPostoIdAsync(postoId);
        return Ok(result);
    }

    [HttpGet("contrato/{contratoId}")]
    [ProducesResponseType(typeof(IEnumerable<AlocacaoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByContratoId(Guid contratoId)
    {
        var result = await _appService.GetByContratoIdAsync(contratoId);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<AlocacaoDto>> Create(CreateAlocacaoInput input)
    {
        var result = await _appService.CreateAsync(input);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AlocacaoDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AlocacaoDto>> Update(Guid id, UpdateAlocacaoInput input)
    {
        var result = await _appService.UpdateAsync(id, input);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _appService.DeleteAsync(id);
        return NoContent();
    }
}
