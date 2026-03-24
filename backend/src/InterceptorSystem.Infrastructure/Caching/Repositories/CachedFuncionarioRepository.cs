using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    public Task<Funcionario?> GetByIdAsync(Guid id) => _decorated.GetByIdAsync(id);

    public Task<Funcionario?> GetByCpfAsync(string cpf) => _decorated.GetByCpfAsync(cpf);

    public async Task<IEnumerable<Funcionario>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Funcionarios_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Funcionario>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync();
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
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
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        }

        return cachedList ?? Enumerable.Empty<Funcionario>();
    }
}
