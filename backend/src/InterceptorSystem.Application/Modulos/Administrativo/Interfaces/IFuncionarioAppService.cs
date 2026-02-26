using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IFuncionarioAppService
{
    Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input);
    Task<FuncionarioDtoOutput> UpdateAsync(Guid id, UpdateFuncionarioDtoInput input);
    Task DeleteAsync(Guid id);
    Task<FuncionarioDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<FuncionarioDtoOutput>> GetAllAsync();
}

