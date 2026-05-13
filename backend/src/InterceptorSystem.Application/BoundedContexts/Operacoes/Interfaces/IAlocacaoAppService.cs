using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IAlocacaoAppService
{
    Task<AlocacaoDto> CreateAsync(CreateAlocacaoInput input, CancellationToken ct = default);
    Task<AlocacaoDto> UpdateAsync(Guid id, UpdateAlocacaoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<AlocacaoDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<AlocacaoDto>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<AlocacaoDto>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
    Task<IEnumerable<AlocacaoDto>> GetByPostoIdAsync(Guid postoId, CancellationToken ct = default);
    Task<IEnumerable<AlocacaoDto>> GetByContratoIdAsync(Guid contratoId, CancellationToken ct = default);
}
