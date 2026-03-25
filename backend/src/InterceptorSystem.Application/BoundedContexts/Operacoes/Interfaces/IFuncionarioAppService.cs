using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IFuncionarioAppService
{
    Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input);
    Task<FuncionarioDtoOutput> UpdateAsync(Guid id, UpdateFuncionarioDtoInput input);
    Task DeleteAsync(Guid id);
    Task<FuncionarioDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<FuncionarioDtoOutput>> GetAllAsync();
    Task<IEnumerable<FuncionarioDtoOutput>> GetByClienteIdAsync(Guid clienteId);
}

