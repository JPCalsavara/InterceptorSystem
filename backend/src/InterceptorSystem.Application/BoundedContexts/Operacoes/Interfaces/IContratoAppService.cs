using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IContratoAppService
{
    Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input, CancellationToken ct = default);
    Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<ContratoDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ContratoDtoOutput>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
}
