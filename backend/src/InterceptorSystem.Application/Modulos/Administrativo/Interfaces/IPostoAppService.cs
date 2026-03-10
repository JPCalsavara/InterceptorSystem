using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IPostoAppService
{
    Task<PostoDto> CreateAsync(CreatePostoInput input);
    Task<PostoDto> UpdateAsync(Guid id, UpdatePostoInput input);
    Task DeleteAsync(Guid id);
    Task<PostoDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PostoDto>> GetAllAsync();
    Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId);
}

