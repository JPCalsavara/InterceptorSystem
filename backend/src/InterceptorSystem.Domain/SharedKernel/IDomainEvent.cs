using MediatR;

namespace InterceptorSystem.Domain.SharedKernel;

/// <summary>
/// Interface base para todos os Domain Events.
/// Extende INotification do MediatR para permitir publicação via ISender/IMediator.
/// </summary>
public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}
