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
}