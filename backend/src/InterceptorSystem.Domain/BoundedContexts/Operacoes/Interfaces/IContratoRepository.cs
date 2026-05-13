using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IContratoRepository : IRepository<Contrato>
{
    Task<IEnumerable<Contrato>> GetAtivosByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
    Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
    Task<Contrato?> GetByClienteId(Guid clienteId, CancellationToken ct = default);
    Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null, CancellationToken ct = default);
}

