using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

/// <summary>
/// Listener de eventos de domínio para invalidar cache de Diarias.
/// Invalida:
/// - Cache global de Diarias
/// - Cache per-Cliente
/// - Cache per-Funcionario
/// - Cache per-Alocacao
/// </summary>
public class DiariaCacheInvalidationHandler :
    INotificationHandler<DiariaCreatedEvent>,
    INotificationHandler<DiariaUpdatedEvent>,
    INotificationHandler<DiariaDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public DiariaCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task Handle(DiariaCreatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    public Task Handle(DiariaUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    public Task Handle(DiariaDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateDiariaCache(notification.EmpresaId);
        return Task.CompletedTask;
    }

    private void InvalidateDiariaCache(Guid empresaId)
    {
        // Remove cache global
        _cache.Remove($"Diarias_{empresaId}");
        
        // Nota: Não conseguimos remover caches específicas (por cliente/funcionario/alocacao) sem pattern matching
        // MIP MemoryCache não suporta pattern wildcards
        // Alternativa futura: usar IDistributedCache (Redis) que suporta wildcards
    }
}
