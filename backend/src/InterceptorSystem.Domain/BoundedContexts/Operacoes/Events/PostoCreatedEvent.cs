using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record PostoCreatedEvent(Guid EmpresaId, Guid PostoId, Guid ClienteId) : DomainEvent;
