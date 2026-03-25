using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Caching.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

public class CachedFuncionarioRepository : IFuncionarioRepository
{
    private readonly IFuncionarioRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedFuncionarioRepository(
        IFuncionarioRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    public void Add(Funcionario entity) => _decorated.Add(entity);

    public void Update(Funcionario entity) => _decorated.Update(entity);

    public void Remove(Funcionario entity) => _decorated.Remove(entity);

    public async Task<Funcionario?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Funcionario_{empresaId}_{id}";

        if (!_cache.TryGetValue(cacheKey, out Funcionario? cached))
        {
            cached = await _decorated.GetByIdAsync(id, cancellationToken);
            if (cached != null)
            {
                _cache.Set(cacheKey, cached, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
            }
        }

        return cached;
    }

    public Task<IPagedResult<Funcionario>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    public Task<Funcionario?> GetByCpfAsync(string cpf) => _decorated.GetByCpfAsync(cpf);

    public async Task<IEnumerable<Funcionario>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Funcionarios_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Funcionario>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
        }

        return cachedList ?? Enumerable.Empty<Funcionario>();
    }

    public async Task<IEnumerable<Funcionario>> GetByClienteAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Funcionarios_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Funcionario>? cachedList))
        {
            cachedList = await _decorated.GetByClienteAsync(clienteId);
            _cache.Set(cacheKey, cachedList, CacheConfiguration.GetCacheOptions(CacheVolatility.Moderate));
        }

        return cachedList ?? Enumerable.Empty<Funcionario>();
    }
}
