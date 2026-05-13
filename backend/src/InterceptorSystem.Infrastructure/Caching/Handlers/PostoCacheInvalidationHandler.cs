using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

public class PostoCacheInvalidationHandler : 
    INotificationHandler<PostoCreatedEvent>,
    INotificationHandler<PostoUpdatedEvent>,
    INotificationHandler<PostoDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public PostoCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    private void InvalidateCache(Guid empresaId, Guid clienteId)
    {
        _cache.Remove($"Postos_{empresaId}");
        _cache.Remove($"Postos_{empresaId}_Cliente_{clienteId}");
    }

    public Task Handle(PostoCreatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(PostoUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(PostoDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }
}
