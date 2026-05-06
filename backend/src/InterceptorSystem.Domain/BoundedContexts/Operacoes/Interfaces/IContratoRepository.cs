using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IContratoRepository : IRepository<Contrato>
{
    Task<IEnumerable<Contrato>> GetAtivosByClienteIdAsync(Guid clienteId);
    Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId);
    Task<Contrato> GetByClienteId(Guid clienteId);
    Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null);
}

