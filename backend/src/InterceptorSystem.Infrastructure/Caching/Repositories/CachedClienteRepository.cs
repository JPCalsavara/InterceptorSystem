using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Caching.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

public class CachedClienteRepository : IClienteRepository
{
    private readonly IClienteRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedClienteRepository(
        IClienteRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    public void Add(Cliente entity) => _decorated.Add(entity);

    public void Update(Cliente entity) => _decorated.Update(entity);

    public void Remove(Cliente entity) => _decorated.Remove(entity);

    public async Task<Cliente?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Cliente_{empresaId}_{id}";

        if (!_cache.TryGetValue(cacheKey, out Cliente? cached))
        {
            cached = await _decorated.GetByIdAsync(id, cancellationToken);
            if (cached != null)
            {
                _cache.Set(cacheKey, cached, CacheConfiguration.GetCacheOptions(CacheVolatility.Stable));
            }
        }

        return cached;
    }

    public Task<IPagedResult<Cliente>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    public async Task<IEnumerable<Cliente>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Clientes_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Cliente>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Stable));
        }

        return cachedList ?? Enumerable.Empty<Cliente>();
    }

    public async Task<int> DeleteDirectlyAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var affected = await _decorated.DeleteDirectlyAsync(id, cancellationToken);
        if (affected > 0)
        {
            var empresaId = _tenantService.EmpresaId;
            if (empresaId != null)
            {
                _cache.Remove($"Cliente_{empresaId}_{id}");
                _cache.Remove($"Clientes_{empresaId}");
            }
        }
        return affected;
    }
}
