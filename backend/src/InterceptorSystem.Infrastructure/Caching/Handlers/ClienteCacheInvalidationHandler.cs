using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

public class ClienteCacheInvalidationHandler : 
    INotificationHandler<ClienteCreatedEvent>,
    INotificationHandler<ClienteUpdatedEvent>,
    INotificationHandler<ClienteDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public ClienteCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task Handle(ClienteCreatedEvent notification, CancellationToken cancellationToken)
    {
        _cache.Remove($"Clientes_{notification.EmpresaId}");
        return Task.CompletedTask;
    }

    public Task Handle(ClienteUpdatedEvent notification, CancellationToken cancellationToken)
    {
        _cache.Remove($"Clientes_{notification.EmpresaId}");
        return Task.CompletedTask;
    }

    public Task Handle(ClienteDeletedEvent notification, CancellationToken cancellationToken)
    {
        _cache.Remove($"Clientes_{notification.EmpresaId}");
        return Task.CompletedTask;
    }
}
