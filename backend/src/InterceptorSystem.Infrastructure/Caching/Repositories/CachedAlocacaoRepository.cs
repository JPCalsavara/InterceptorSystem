using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Caching.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

/// <summary>
/// Decorator de cache para Alocacao com TTL reduzido (60 segundos).
/// Dados muito voláteis (confirmação diária constante).
/// Invalida automaticamente quando eventos de domínio são publicados.
/// </summary>
public class CachedAlocacaoRepository : IAlocacaoRepository
{
    private readonly IAlocacaoRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedAlocacaoRepository(
        IAlocacaoRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    // ========== PASS-THROUGH (não cached) ==========
    public void Add(Alocacao entity) => _decorated.Add(entity);

    public void Update(Alocacao entity) => _decorated.Update(entity);

    public void Remove(Alocacao entity) => _decorated.Remove(entity);

    public Task<Alocacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _decorated.GetByIdAsync(id, cancellationToken);

    public Task<IPagedResult<Alocacao>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    // ========== CACHED METHODS ==========

    public async Task<IEnumerable<Alocacao>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Alocacoes_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Alocacao>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Alocacao>();
    }

    public async Task<IEnumerable<Alocacao>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Alocacoes_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Alocacao>? cachedList))
        {
            cachedList = await _decorated.GetByClienteIdAsync(clienteId);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Alocacao>();
    }

    public async Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Alocacoes_{empresaId}_Posto_{postoId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Alocacao>? cachedList))
        {
            cachedList = await _decorated.GetByPostoIdAsync(postoId);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Alocacao>();
    }
}
