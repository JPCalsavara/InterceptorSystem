using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IPostoRepository : IRepository<Posto>
{
    Task<IEnumerable<Posto>> GetByClienteIdAsync(Guid clienteId);
}

