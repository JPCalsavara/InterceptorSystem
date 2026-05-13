using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Handlers;

public class FuncionarioCacheInvalidationHandler : 
    INotificationHandler<FuncionarioCreatedEvent>,
    INotificationHandler<FuncionarioUpdatedEvent>,
    INotificationHandler<FuncionarioDeletedEvent>
{
    private readonly IMemoryCache _cache;

    public FuncionarioCacheInvalidationHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    private void InvalidateCache(Guid empresaId, Guid? clienteId)
    {
        _cache.Remove($"Funcionarios_{empresaId}");
        if (clienteId.HasValue)
        {
            _cache.Remove($"Funcionarios_{empresaId}_Cliente_{clienteId.Value}");
        }
    }

    public Task Handle(FuncionarioCreatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(FuncionarioUpdatedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }

    public Task Handle(FuncionarioDeletedEvent notification, CancellationToken cancellationToken)
    {
        InvalidateCache(notification.EmpresaId, notification.ClienteId);
        return Task.CompletedTask;
    }
}
