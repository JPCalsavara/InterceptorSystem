using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IPostoAppService
{
    Task<PostoDto> CreateAsync(CreatePostoInput input, CancellationToken ct = default);
    Task<PostoDto> UpdateAsync(Guid id, UpdatePostoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<PostoDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<PostoDto>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
}

