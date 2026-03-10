using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IClienteAppService
{
    Task<ClienteDtoOutput> CreateAsync(CreateClienteDtoInput input);
    Task<ClienteDtoOutput> UpdateAsync(Guid id, UpdateClienteDtoInput input);
    Task DeleteAsync(Guid id);
    Task<ClienteDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<ClienteDtoOutput>> GetAllAsync();
}

