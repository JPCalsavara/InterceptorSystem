using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.Modulos.Administrativo.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

public class ContratoCacheInvalidationHandler : 
    INotificationHandler<ContratoCreatedEvent>,
    INotificationHandler<ContratoUpdatedEvent>,
    INotificationHandler<ContratoDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public ContratoCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    private void InvalidateCache(Guid empresaId, Guid clienteId)
    {
        _cache.Remove($"Contratos_{empresaId}");
        _cache.Remove($"Contratos_{empresaId}_Cliente_{clienteId}");
    }

    public Task Handle(ContratoCreatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(ContratoUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(ContratoDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }
}
