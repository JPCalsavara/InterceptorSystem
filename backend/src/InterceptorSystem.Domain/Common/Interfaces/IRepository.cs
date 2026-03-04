namespace InterceptorSystem.Domain.Common.Interfaces;

public interface IRepository<T> where T : IAggregateRoot
{
    // Apenas a interface do UnitOfWork para commitar alterações
    IUnitOfWork UnitOfWork { get; } 
    
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    void Add(T entity);
    void Update(T entity);
    void Remove(T entity);
}

public interface IUnitOfWork
{
    Task<bool> CommitAsync();
    
    /// <summary>
    /// Inicia uma transação explícita para operações que requerem atomicidade (ex: criação em cascata).
    /// </summary>
    Task BeginTransactionAsync();
    
    /// <summary>
    /// Confirma a transação atual.
    /// </summary>
    Task CommitTransactionAsync();
    
    /// <summary>
    /// Desfaz a transação atual em caso de erro.
    /// </summary>
    Task RollbackTransactionAsync();
}