namespace InterceptorSystem.Domain.SharedKernel.Interfaces;

public interface IRepository<T> where T : IAggregateRoot
{
    IUnitOfWork UnitOfWork { get; }

    Task<T?> GetByIdAsync(Guid id) => GetByIdAsync(id, default);
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IEnumerable<T>> GetAllAsync() => GetAllAsync(default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IPagedResult<T>> GetPagedAsync(int page, int pageSize) => GetPagedAsync(page, pageSize, default);
    Task<IPagedResult<T>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);

    void Add(T entity);
    void Update(T entity);
    void Remove(T entity);
}
