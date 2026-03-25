using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IPostoAppService
{
    Task<PostoDto> CreateAsync(CreatePostoInput input);
    Task<PostoDto> UpdateAsync(Guid id, UpdatePostoInput input);
    Task DeleteAsync(Guid id);
    Task<PostoDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PostoDto>> GetAllAsync();
    Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId);
}

