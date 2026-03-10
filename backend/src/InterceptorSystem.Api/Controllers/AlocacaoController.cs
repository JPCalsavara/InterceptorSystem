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
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetAll()
    {
        var result = await _appService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AlocacaoDto>> GetById(Guid id)
    {
        var result = await _appService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("posto/{postoId}")]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByPostoId(Guid postoId)
    {
        var result = await _appService.GetByPostoIdAsync(postoId);
        return Ok(result);
    }

    [HttpGet("contrato/{contratoId}")]
    public async Task<ActionResult<IEnumerable<AlocacaoDto>>> GetByContratoId(Guid contratoId)
    {
        var result = await _appService.GetByContratoIdAsync(contratoId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<AlocacaoDto>> Create(CreateAlocacaoInput input)
    {
        var result = await _appService.CreateAsync(input);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AlocacaoDto>> Update(Guid id, UpdateAlocacaoInput input)
    {
        var result = await _appService.UpdateAsync(id, input);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _appService.DeleteAsync(id);
        return NoContent();
    }
}
