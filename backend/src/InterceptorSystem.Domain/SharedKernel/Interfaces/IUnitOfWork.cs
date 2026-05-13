namespace InterceptorSystem.Domain.SharedKernel.Interfaces;

public interface IUnitOfWork
{
    Task<bool> CommitAsync() => CommitAsync(default);
    Task<bool> CommitAsync(CancellationToken cancellationToken = default);

    Task BeginTransactionAsync() => BeginTransactionAsync(default);

    /// <summary>
    /// Inicia uma transação explícita para operações que requerem atomicidade (ex: criação em cascata).
    /// </summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task CommitTransactionAsync() => CommitTransactionAsync(default);

    /// <summary>Confirma a transação atual.</summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task RollbackTransactionAsync() => RollbackTransactionAsync(default);

    /// <summary>Desfaz a transação atual em caso de erro.</summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
