using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IAlocacaoRepository : IRepository<Alocacao>
{
    Task<IEnumerable<Alocacao>> GetByClienteIdAsync(Guid clienteId);
    Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId);
}
