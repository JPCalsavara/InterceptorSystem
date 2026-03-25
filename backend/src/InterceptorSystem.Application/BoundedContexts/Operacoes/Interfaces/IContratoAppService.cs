using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IContratoAppService
{
    Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input);
    Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input);
    Task DeleteAsync(Guid id);
    Task<ContratoDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<ContratoDtoOutput>> GetAllAsync();
    Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId);
}

