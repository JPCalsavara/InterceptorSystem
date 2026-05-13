using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IClienteAppService
{
    Task<ClienteDtoOutput> CreateAsync(CreateClienteDtoInput input, CancellationToken ct = default);
    Task<ClienteDtoOutput> UpdateAsync(Guid id, UpdateClienteDtoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<ClienteDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ClienteDtoOutput>> GetAllAsync(CancellationToken ct = default);
}
