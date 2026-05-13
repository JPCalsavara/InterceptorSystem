using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Caching.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

/// <summary>
/// Decorator de cache para Diaria com TTL reduzido (60 segundos).
/// Dados muito voláteis (status: pendente → confirmada → cancelada).
/// Invalida automaticamente quando eventos de domínio são publicados.
/// </summary>
public class CachedDiariaRepository : IDiariaRepository
{
    private readonly IDiariaRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedDiariaRepository(
        IDiariaRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    // ========== PASS-THROUGH (não cached) ==========
    public void Add(Diaria entity) => _decorated.Add(entity);

    public void Update(Diaria entity) => _decorated.Update(entity);

    public void Remove(Diaria entity) => _decorated.Remove(entity);

    public Task<Diaria?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _decorated.GetByIdAsync(id, cancellationToken);

    public Task<IPagedResult<Diaria>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    public Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null, CancellationToken ct = default)
        => _decorated.ExisteDiariaNaDataAsync(funcionarioId, data, diariaIdIgnorada, ct);

    // ========== CACHED METHODS ==========

    public async Task<IEnumerable<Diaria>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Diarias_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Diaria>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Diaria>();
    }

    public async Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Diarias_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Diaria>? cachedList))
        {
            cachedList = await _decorated.GetByClienteIdAsync(clienteId, ct);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Diaria>();
    }

    public async Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Diarias_{empresaId}_Funcionario_{funcionarioId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Diaria>? cachedList))
        {
            cachedList = await _decorated.GetByFuncionarioAsync(funcionarioId, ct);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Diaria>();
    }

    public async Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Diarias_{empresaId}_Alocacao_{alocacaoId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Diaria>? cachedList))
        {
            cachedList = await _decorated.GetByAlocacaoAsync(alocacaoId, ct);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Diaria>();
    }

    public async Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Diarias_{empresaId}_Alocacao_{alocacaoId}_Data_{data:yyyy-MM-dd}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Diaria>? cachedList))
        {
            cachedList = await _decorated.GetByAlocacaoEDataAsync(alocacaoId, data, ct);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));
        }

        return cachedList ?? Enumerable.Empty<Diaria>();
    }

    public Task<IEnumerable<Diaria>> GetByContratoIdAsync(Guid contratoId, DateOnly inicio, DateOnly fim, CancellationToken ct = default)
        => _decorated.GetByContratoIdAsync(contratoId, inicio, fim, ct);

    public Task<IEnumerable<Diaria>> GetResumoFinanceiroByContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default)
        => _decorated.GetResumoFinanceiroByContratoAsync(contratoId, ano, mes, ct);

    public Task<List<Diaria>> GetDiariasByAlocacoesIdsAsync(List<Guid> alocacaoIds, CancellationToken ct = default)
    {
        return _decorated.GetDiariasByAlocacoesIdsAsync(alocacaoIds, ct);
    }
}
