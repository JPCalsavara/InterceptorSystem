using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IClienteAppService
{
    Task<ClienteDtoOutput> CreateAsync(CreateClienteDtoInput input);
    Task<ClienteDtoOutput> UpdateAsync(Guid id, UpdateClienteDtoInput input);
    Task DeleteAsync(Guid id);
    Task<ClienteDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<ClienteDtoOutput>> GetAllAsync();
}

