using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
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

    public Task<Contrato?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => _decorated.GetByIdAsync(id, cancellationToken);

    public Task<IPagedResult<Contrato>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);

    public Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null, CancellationToken ct = default) 
        => _decorated.ExisteContratoVigenteAsync(clienteId, contratoIdIgnorado, ct);

    public async Task<IEnumerable<Contrato>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Contratos_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Contrato>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Contrato>();
    }

    public async Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Contratos_{empresaId}_Cliente_{clienteId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Contrato>? cachedList))
        {
            cachedList = await _decorated.GetByClienteIdAsync(clienteId, ct);
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Contrato>();
    }

    public Task<IEnumerable<Contrato>> GetAtivosByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        return _decorated.GetAtivosByClienteIdAsync(clienteId, ct);
    }

    public Task<Contrato?> GetByClienteId(Guid clienteId, CancellationToken ct = default)
    {
        return _decorated.GetByClienteId(clienteId, ct);
    }
}
