using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

public class CachedContratoRepository : IContratoRepository
{
    private readonly IContratoRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public CachedContratoRepository(
        IContratoRepository decorated,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _decorated = decorated;
        _cache = cache;
        _tenantService = tenantService;
    }

    public IUnitOfWork UnitOfWork => _decorated.UnitOfWork;

    public void Add(Contrato entity) => _decorated.Add(entity);

    public void Update(Contrato entity) => _decorated.Update(entity);

    public void Remove(Contrato entity) => _decorated.Remove(entity);

    public Task<Contrato?> GetByIdAsync(Guid id) => _decorated.GetByIdAsync(id);

    public Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null) 
        => _decorated.ExisteContratoVigenteAsync(clienteId, contratoIdIgnorado);

    public async Task<IEnumerable<Contrato>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Contratos_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Contrato>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync();
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Contrato>();
    }

    public async Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Contratos_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Contrato>? cachedList))
        {
            cachedList = await _decorated.GetByClienteIdAsync(clienteId);
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Contrato>();
    }
}
