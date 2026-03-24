using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    public Task<Cliente?> GetByIdAsync(Guid id) => _decorated.GetByIdAsync(id);

    public async Task<IEnumerable<Cliente>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Clientes_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Cliente>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync();
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            _cache.Set(cacheKey, cachedList, cacheOptions);
        }

        return cachedList ?? Enumerable.Empty<Cliente>();
    }
}
