using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ClienteDeletedEvent(Guid EmpresaId, Guid ClienteId) : DomainEvent;
