using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IAlocacaoAppService
{
    Task<AlocacaoDto> CreateAsync(CreateAlocacaoInput input);
    Task<AlocacaoDto> UpdateAsync(Guid id, UpdateAlocacaoInput input);
    Task DeleteAsync(Guid id);
    Task<AlocacaoDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<AlocacaoDto>> GetAllAsync();
    Task<IEnumerable<AlocacaoDto>> GetByPostoIdAsync(Guid postoId);
    Task<IEnumerable<AlocacaoDto>> GetByContratoIdAsync(Guid contratoId);
}
