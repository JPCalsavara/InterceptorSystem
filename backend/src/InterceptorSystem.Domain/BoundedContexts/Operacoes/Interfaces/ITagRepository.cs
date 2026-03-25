using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface ITagRepository : IRepository<Tag>
{
    Task<Tag?> GetByNomeAsync(string nome);
}
