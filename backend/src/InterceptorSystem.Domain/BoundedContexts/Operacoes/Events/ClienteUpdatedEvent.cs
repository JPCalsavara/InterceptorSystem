using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ClienteUpdatedEvent(Guid EmpresaId, Guid ClienteId) : DomainEvent;
