using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using Microsoft.AspNetCore.Mvc;

namespace InterceptorSystem.Api.Controllers;

[ApiController]
[Route("api/postos-de-trabalho")]
public class PostosDeTrabalhoController : ControllerBase
{
    private readonly IPostoDeTrabalhoAppService _service;

    public PostosDeTrabalhoController(IPostoDeTrabalhoAppService service)
    {
        _service = service;
    }

    [HttpPost]
    [ProducesResponseType(typeof(PostoDeTrabalhoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreatePostoInput input)
    {
        try
        {
            var result = await _service.CreateAsync(input);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PostoDeTrabalhoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PostoDeTrabalhoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("condominio/{condominioId}")]
    [ProducesResponseType(typeof(IEnumerable<PostoDeTrabalhoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCondominio(Guid condominioId)
    {
        var result = await _service.GetByCondominioIdAsync(condominioId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PostoDeTrabalhoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, UpdatePostoInput input)
    {
        try 
        {
            var result = await _service.UpdateAsync(id, input);
            return Ok(result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
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
        catch (KeyNotFoundException) { return NotFound(); }
    }
}

