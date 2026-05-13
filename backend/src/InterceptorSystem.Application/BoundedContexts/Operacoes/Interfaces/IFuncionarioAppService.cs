using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IFuncionarioAppService
{
    Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input, CancellationToken ct = default);
    Task<FuncionarioDtoOutput> UpdateAsync(Guid id, UpdateFuncionarioDtoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<FuncionarioDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<FuncionarioDtoOutput>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<FuncionarioDtoOutput>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
}
