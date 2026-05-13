using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Auth.Interfaces;

public interface IContaRepository
{
    Task<Conta?> GetByIdAsync(Guid id) => GetByIdAsync(id, default);
    Task<Conta?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Conta?> GetByEmailAsync(string email);
    Task<Conta?> GetByTelefoneVerificadoAsync(string telefone);
    void Add(Conta conta);

    Task<bool> CommitAsync() => CommitAsync(default);
    Task<bool> CommitAsync(CancellationToken cancellationToken = default);
}
