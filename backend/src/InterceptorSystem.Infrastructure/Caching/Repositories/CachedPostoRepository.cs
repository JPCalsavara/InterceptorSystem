using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    public Task<Posto?> GetByIdAsync(Guid id) => _decorated.GetByIdAsync(id);

    public async Task<IEnumerable<Posto>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Postos_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Posto>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync();
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
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
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Posto>();
    }
}
