using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IContratoAppService
{
    Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input);
    Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input);
    Task DeleteAsync(Guid id);
    Task<ContratoDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<ContratoDtoOutput>> GetAllAsync();
}

