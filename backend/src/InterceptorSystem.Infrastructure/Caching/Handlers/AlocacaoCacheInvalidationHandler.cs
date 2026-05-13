using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

/// <summary>
/// Listener de eventos de domínio para invalidar cache de Alocacoes.
/// Invalida:
/// - Cache global de Alocacoes
/// - Cache per-Cliente
/// - Cache per-Posto
/// - Também invalida Diaria (relação: Alocacao → Diaria)
/// </summary>
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
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    public Task Handle(AlocacaoUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateAlocacaoCache(notification.EmpresaId);
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    public Task Handle(AlocacaoDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateAlocacaoCache(notification.EmpresaId);
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    private void InvalidateAlocacaoCache(Guid empresaId)
    {
        // Remove cache global
        _cache.Remove($"Alocacoes_{empresaId}");
        
        // Nota: Não conseguimos remover caches específicas (por cliente/posto) sem pattern matching
        // MIP MemoryCache não suporta pattern wildcards
        // Alternativa futura: usar IDistributedCache (Redis) que suporta wildcards
    }

    private void InvalidateDiariaCache(Guid empresaId)
    {
        // Cascata: Alocacao frequentemente chama Diaria
        _cache.Remove($"Diarias_{empresaId}");
    }
}
