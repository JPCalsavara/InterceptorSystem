using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IAlocacaoAppService
{
    Task<AlocacaoDto> CreateAsync(CreateAlocacaoInput input);
    Task<AlocacaoDto> UpdateAsync(Guid id, UpdateAlocacaoInput input);
    Task DeleteAsync(Guid id);
    Task<AlocacaoDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<AlocacaoDto>> GetAllAsync();
    Task<IEnumerable<AlocacaoDto>> GetByClienteIdAsync(Guid clienteId);
    Task<IEnumerable<AlocacaoDto>> GetByPostoIdAsync(Guid postoId);
    Task<IEnumerable<AlocacaoDto>> GetByContratoIdAsync(Guid contratoId);
}
