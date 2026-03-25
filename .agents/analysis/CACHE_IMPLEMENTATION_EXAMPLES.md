```csharp
// ============================================================================
// EXEMPLO 1: CachedAlocacaoRepository (Dados Voláteis com TTL Curto)
// ============================================================================
// Localização: Infrastructure/Caching/Repositories/CachedAlocacaoRepository.cs
//
// Propósito:
// - Adicionar cache decorator para Alocacao (muito volátil)
// - TTL CURTO (60 segundos vs 10 minutos dos outros)
// - Invalidação automática via eventos de domínio
// - Cache por: GetAllAsync, GetByClienteIdAsync, GetByPostoIdAsync

using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Repositories;

/// <summary>
/// Decorator de cache para Alocacao com TTL reduzido para dados voláteis.
/// Invalida automaticamente quando eventos de domínio são publicados.
/// </summary>
public class CachedAlocacaoRepository : IAlocacaoRepository
{
    private readonly IAlocacaoRepository _decorated;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    // TTL CURTO: Alocacoes mudam frequentemente (confirmação diária)
    private const int CACHE_TTL_SECONDS = 60;

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

    // ========== CACHED METHODS ==========

    public async Task<IEnumerable<Alocacao>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"Alocacoes_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Alocacao>? cachedList))
        {
            cachedList = await _decorated.GetAllAsync(cancellationToken);
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(CACHE_TTL_SECONDS)));
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
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(CACHE_TTL_SECONDS)));
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
            _cache.Set(cacheKey, cachedList, new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(CACHE_TTL_SECONDS)));
        }

        return cachedList ?? Enumerable.Empty<Alocacao>();
    }

    public Task<IPagedResult<Alocacao>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        => _decorated.GetPagedAsync(page, pageSize, cancellationToken);
}


// ============================================================================
// EXEMPLO 2: AlocacaoCacheInvalidationHandler (Event-Driven Invalidation)
// ============================================================================
// Localização: Infrastructure/Caching/Handlers/AlocacaoCacheInvalidationHandler.cs
//
// Propósito:
// - Listener de eventos de domínio da Alocacao
// - Invalida cache automaticamente quando Alocacao é criada/atualizada/deletada
// - Cascata: Tb invalida cache de Diaria (relação)

using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

public class AlocacaoCacheInvalidationHandler :
    INotificationHandler<AlocacaoCreatedEvent>,
    INotificationHandler<AlocacaoUpdatedEvent>,
    INotificationHandler<AlocacaoDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public AlocacaoCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task Handle(AlocacaoCreatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateAlocacaoCache(notification.EmpresaId);
        InvalidateDiariaCache(notification.EmpresaId); // Cascata: Diaria usualmente chama Alocacao
        return Task.CompletedTask;
    }

    public Task Handle(AlocacaoUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateAlocacaoCache(notification.EmpresaId);
        InvalidateDiariaCache(notification.EmpresaId); // Cascata
        return Task.CompletedTask;
    }

    public Task Handle(AlocacaoDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateAlocacaoCache(notification.EmpresaId);
        InvalidateDiariaCache(notification.EmpresaId); // Cascata
        return Task.CompletedTask;
    }

    private void InvalidateAlocacaoCache(Guid empresaId)
    {
        // Remove cache global
        _cache.Remove($"Alocacoes_{empresaId}");

        // Remove caches per-cliente (não sabemos qual, então remove pattern)
        // Nota: MemoryCache não suporta pattern matching, então seria manual
        // Alternativa: usar IDistributedCache (Redis) que suporta wildcards
    }

    private void InvalidateDiariaCache(Guid empresaId)
    {
        // Cascata: Alocacao frequentemente chama Diaria
        _cache.Remove($"Diarias_{empresaId}");
    }
}


// ============================================================================
// EXEMPLO 3: Melhorado - GetByPostoIdAsync em Loop (N+1)
// ============================================================================
// ANTES (Anti-padrão: N+1 queries)
// Localização: Application/BoundedContexts/Operacoes/Services/AlocacaoAppService.cs

public class AlocacaoAppService
{
    private readonly IPostoRepository _postoRepository;
    private readonly IAlocacaoRepository _alocacaoRepository;

    // ❌ ANTI-PADRÃO: Se chamar GetByIdAsync em loop
    public async Task<IEnumerable<AlocacaoComDetalheDto>> ListarAlocacoesComPostosAsync(
        IEnumerable<Guid> alocacaoIds,
        CancellationToken ct)
    {
        var result = new List<AlocacaoComDetalheDto>();

        foreach (var id in alocacaoIds)
        {
            var alocacao = await _alocacaoRepository.GetByIdAsync(id, ct);  // Query 1
            if (alocacao == null) continue;

            var posto = await _postoRepository.GetByIdAsync(alocacao.PostoId, ct); // Query 2-N ❌

            result.Add(new AlocacaoComDetalheDto(
                alocacao.Id,
                alocacao.FuncionarioId,
                posto?.Nome ?? "Desconhecido"));
        }

        return result;
    }
}

// ✅ SOLUÇÃO: Usar GetAll + Filter (aproveita cache)
public class AlocacaoAppService
{
    private readonly IPostoRepository _postoRepository;
    private readonly IAlocacaoRepository _alocacaoRepository;

    public async Task<IEnumerable<AlocacaoComDetalheDto>> ListarAlocacoesComPostosAsync(
        IEnumerable<Guid> alocacaoIds,
        CancellationToken ct)
    {
        // 1 query: GetAllAsync (CACHED por 60s)
        var todosPostos = await _postoRepository.GetAllAsync(ct);
        var postoDict = todosPostos.ToDictionary(p => p.Id);

        // Filter em memória
        var alocacoes = (await _alocacaoRepository.GetAllAsync(ct))
            .Where(a => alocacaoIds.Contains(a.Id));

        return alocacoes
            .Select(a => new AlocacaoComDetalheDto(
                a.Id,
                a.FuncionarioId,
                postoDict.TryGetValue(a.PostoId, out var p) ? p.Nome : "Desconhecido"))
            .ToList();
    }
}


// ============================================================================
// EXEMPLO 4: Query Composta com Cache Aside (Cache-Aside Pattern)
// ============================================================================
// Localização: Infrastructure/Adapters/Operacoes/PostoComClienteQueryAdapter.cs
//
// Propósito:
// - DTO composto (Posto + Cliente) pré-processado
// - Evita múltiplas queries
// - Cache "aside" manual para queries que não cabem em GetAllAsync

using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Adapters.Operacoes;

public record PostoComClienteResumo(
    Guid PostoId,
    string PostoNome,
    string ClienteNome,
    string ClienteCidade,
    int QuantidadeIdealPorTurno,
    Label? TarefaLabel);

public class PostoComClienteQueryAdapter
{
    private readonly IPostoRepository _postoRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IMemoryCache _cache;
    private readonly ICurrentTenantService _tenantService;

    public PostoComClienteQueryAdapter(
        IPostoRepository postoRepository,
        IClienteRepository clienteRepository,
        IMemoryCache cache,
        ICurrentTenantService tenantService)
    {
        _postoRepository = postoRepository;
        _clienteRepository = clienteRepository;
        _cache = cache;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Query composta com Cache-Aside Pattern.
    /// Sem este método, seria necessário:
    ///   1. GetByClienteIdAsync (Postos) → Query 1
    ///   2. Include(p => p.Cliente) já vem dentro, mas pode ter ainda estar em N dados
    /// Com este método:
    ///   1 query total, resultado em cache por 5 minutos
    /// </summary>
    public async Task<IEnumerable<PostoComClienteResumo>> GetPostosComClienteAsync(
        Guid clienteId,
        CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        var cacheKey = $"PostosComCliente_{empresaId}_{clienteId}";

        if (_cache.TryGetValue(cacheKey, out IEnumerable<PostoComClienteResumo>? cached))
        {
            return cached ?? Enumerable.Empty<PostoComClienteResumo>();
        }

        // Cache miss: obtém dados
        var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
        var cliente = await _clienteRepository.GetByIdAsync(clienteId, ct);

        var resultado = postos.Select(p => new PostoComClienteResumo(
            p.Id,
            p.Nome,
            cliente?.Nome ?? "Desconhecido",
            cliente?.Cidade ?? "",
            cliente?.QuantidadeIdealPorTurno ?? 2,
            p.Tags?.FirstOrDefault()?.Tag)).ToList();

        // Armazena em cache por 5 minutos (mais longo que Alocacao ~1min, mas curto o suficiente)
        _cache.Set(cacheKey, resultado, TimeSpan.FromMinutes(5));

        return resultado;
    }

    /// <summary>
    /// Método que invalida cache manualmente.
    /// Chamado a partir de um event handler quando Cliente ou Posto mudam.
    /// </summary>
    public void InvalidateForCliente(Guid empresaId, Guid clienteId)
    {
        var cacheKey = $"PostosComCliente_{empresaId}_{clienteId}";
        _cache.Remove(cacheKey);
    }
}


// ============================================================================
// EXEMPLO 5: Registrar CachedAlocacaoRepository em DI
// ============================================================================
// Localização: Infrastructure/DependencyInjection.cs
//
// Seção: AddRepositories()

public static class DependencyInjection
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // ... existing repositories ...

        // Alocacao Repository com Cache Decorator
        services.AddScoped<AlocacaoRepository>();  // Base concreto
        services.AddScoped<IAlocacaoRepository>(provider =>
            new CachedAlocacaoRepository(
                provider.GetRequiredService<AlocacaoRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        return services;
    }
}


// ============================================================================
// EXEMPLO 6: Registrar Cache Invalidation Handler
// ============================================================================
// Localização: Infrastructure/DependencyInjection.cs
//
// Seção: AddEventHandlers() ou AddMediatrHandler()

public static IServiceCollection AddCacheInvalidationHandlers(this IServiceCollection services)
{
    services.AddScoped<AlocacaoCacheInvalidationHandler>();
    services.AddScoped<PostoCacheInvalidationHandler>();
    services.AddScoped<ClienteCacheInvalidationHandler>();
    // ... etc

    // MediatR auto-descobre INotificationHandler<> implementations
    // (já configurado em AddMediatR)

    return services;
}


// ============================================================================
// COMPARAÇÃO: TTL Recomendado por Repositório
// ============================================================================
// Para usar em cada CachedXxxRepository:

namespace InterceptorSystem.Infrastructure.Caching.Configuration;

/// <summary>
/// Configuração centralizada de TTL para diferentes tipos de cache.
/// Idea: dados menos voláteis = TTL maior.
/// </summary>
public static class CacheConfiguration
{
    /// <summary>
    /// Dados estáveis: Clientes, Contratos, Postos
    /// Mudam: Uma vez por dia ou menos frequente
    /// TTL: 10-20 minutos
    /// </summary>
    public const int TTL_STABLE_SECONDS = 600;  // 10 min

    /// <summary>
    /// Dados moderados: Funcionarios (admissões, demissões)
    /// Mudam: Uma vez por semana em média
    /// TTL: 5-10 minutos
    /// </summary>
    public const int TTL_MODERATE_SECONDS = 300;  // 5 min

    /// <summary>
    /// Dados voláteis: Alocacoes, Diarias (confirmação constante)
    /// Mudam: Várias vezes por hora
    /// TTL: 1-2 minutos
    /// </summary>
    public const int TTL_VOLATILE_SECONDS = 60;   // 1 min

    /// <summary>
    /// Dados EXTREMAMENTE voláteis: Status em tempo real
    /// Mudam: Constantemente
    /// TTL: 10-30 segundos (considerar não cacher)
    /// </summary>
    public const int TTL_REALTIME_SECONDS = 30;   // 30 seg

    public static MemoryCacheEntryOptions GetCacheOptions(CacheVolatility volatility)
    {
        var ttlSeconds = volatility switch
        {
            CacheVolatility.Stable => TTL_STABLE_SECONDS,
            CacheVolatility.Moderate => TTL_MODERATE_SECONDS,
            CacheVolatility.Volatile => TTL_VOLATILE_SECONDS,
            CacheVolatility.RealTime => TTL_REALTIME_SECONDS,
            _ => TTL_MODERATE_SECONDS
        };

        return new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(ttlSeconds));
    }
}

public enum CacheVolatility
{
    Stable,
    Moderate,
    Volatile,
    RealTime
}

// USO:
// _cache.Set(key, value, CacheConfiguration.GetCacheOptions(CacheVolatility.Volatile));


// ============================================================================
// EXEMPLO 7: Event-Driven Cascata de Invalidação
// ============================================================================
// Padrão: Quando uma entidade muda, invalidar cache de entidades dependentes

public class PostoCacheInvalidationHandler :
    INotificationHandler<PostoCreatedEvent>,
    INotificationHandler<PostoUpdatedEvent>,
    INotificationHandler<PostoDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public async Task Handle(PostoUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidatePostoCache(notification.EmpresaId, notification.ClienteId);

        // CASCATA: Invalidar caches dependentes
        InvalidateAlocacaoCache(notification.EmpresaId);  // Alocacao referencia Posto
        InvalidateDiariaCache(notification.EmpresaId);    // Diaria referencia Alocacao
    }

    private void InvalidatePostoCache(Guid empresaId, Guid clienteId)
    {
        _cache.Remove($"Postos_{empresaId}");
        _cache.Remove($"Postos_{empresaId}_Cliente_{clienteId}");
    }

    private void InvalidateAlocacaoCache(Guid empresaId)
    {
        _cache.Remove($"Alocacoes_{empresaId}");
    }

    private void InvalidateDiariaCache(Guid empresaId)
    {
        _cache.Remove($"Diarias_{empresaId}");
    }
}
```

---

## Instruções de Implementação

### Passo 1: Criar CachedAlocacaoRepository

Copie **EXEMPLO 1** para:  
`/backend/src/InterceptorSystem.Infrastructure/Caching/Repositories/CachedAlocacaoRepository.cs`

### Passo 2: Criar AlocacaoCacheInvalidationHandler

Copie **EXEMPLO 2** para:  
`/backend/src/InterceptorSystem.Infrastructure/Caching/Handlers/AlocacaoCacheInvalidationHandler.cs`

### Passo 3: Registrar em DI

Adicione a partir de **EXEMPLO 5** e **EXEMPLO 6** em:  
`/backend/src/InterceptorSystem.Infrastructure/DependencyInjection.cs`

### Passo 4: Validar

```bash
cd /backend/src
dotnet build  # Deve compilar sem erros
dotnet test   # Todos os testes devem passar
```

### Próximos Passos (Futuro)

- [ ] Implementar PostoComClienteQueryAdapter (EXEMPLO 4)
- [ ] Adicionar CachedDiariaRepository com TTL=60s
- [ ] Criar CacheConfiguration centralizado (EXEMPLO 6)
- [ ] Adicionar cascata de invalidação (EXEMPLO 7)
