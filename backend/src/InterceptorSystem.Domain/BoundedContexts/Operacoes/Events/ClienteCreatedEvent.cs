using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ClienteCreatedEvent(Guid EmpresaId, Guid ClienteId) : DomainEvent;
