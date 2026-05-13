using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IFuncionarioRepository : IRepository<Funcionario>
{
    Task<Funcionario?> GetByCpfAsync(string cpf, CancellationToken ct = default);
    Task<IEnumerable<Funcionario>> GetByClienteAsync(Guid clienteId, CancellationToken ct = default);
}

