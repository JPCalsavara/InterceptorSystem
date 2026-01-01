using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IAlocacaoAppService
{
    Task<AlocacaoDtoOutput> CreateAsync(CreateAlocacaoDtoInput input);
    Task<AlocacaoDtoOutput> UpdateAsync(Guid id, UpdateAlocacaoDtoInput input);
    Task DeleteAsync(Guid id);
    Task<AlocacaoDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<AlocacaoDtoOutput>> GetAllAsync();
}

