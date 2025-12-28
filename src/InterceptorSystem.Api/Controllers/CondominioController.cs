using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CondominiosController : ControllerBase
{
    private readonly ICondominioAppService _service;

    public CondominiosController(ICondominioAppService service)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CondominioDtoOutput), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateCondominioDtoInput input)
    {
        var result = await _service.CreateAsync(input);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CondominioDtoOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateCondominioDtoInput input)
    {
        try 
        {
            var result = await _service.UpdateAsync(id, input);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try 
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // --- SUB-RECURSO: POSTOS DE TRABALHO ---
    // Rota Hierárquica: POST /api/condominios/{id}/postos
    // Isso deixa claro que o Posto pertence ao Condomínio
    [HttpPost("{id}/postos")]
    [ProducesResponseType(typeof(PostoDeTrabalhoDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddPosto(Guid id, [FromBody] CreatePostoInput input)
    {
        try
        {
            var result = await _service.AddPostoAsync(id, input);
            return CreatedAtAction(nameof(Get), new { id }, result); 
            // Nota: Idealmente teríamos um GetPosto para linkar aqui
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }
}