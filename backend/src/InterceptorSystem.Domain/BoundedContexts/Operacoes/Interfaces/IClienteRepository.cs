using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

// Herda do genérico e permite adicionar métodos específicos se necessário
public interface IClienteRepository : IRepository<Cliente>
{
}