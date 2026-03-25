using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Caching.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

public class CachedPostoRepository : IPostoRepository
{
    private readonly IPostoRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedPostoRepository(
        IPostoRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    public void Add(Posto entity) => _decorated.Add(entity);

    public void Update(Posto entity) => _decorated.Update(entity);

    public void Remove(Posto entity) => _decorated.Remove(entity);

    public async Task<Posto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Posto_{empresaId}_{id}";

        if (!_cache.TryGetValue(cacheKey, out Posto? cached))
        {
            cached = await _decorated.GetByIdAsync(id, cancellationToken);
            if (cached != null)
            {
                _cache.Set(cacheKey, cached, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
            }
        }

        return cached;
    }

    public Task<IPagedResult<Posto>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    public async Task<IEnumerable<Posto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Postos_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Posto>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
        }

        return cachedList ?? Enumerable.Empty<Posto>();
    }

    public async Task<IEnumerable<Posto>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Postos_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Posto>? cachedList))
        {
            cachedList = await _decorated.GetByClienteIdAsync(clienteId);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
        }

        return cachedList ?? Enumerable.Empty<Posto>();
    }
}
