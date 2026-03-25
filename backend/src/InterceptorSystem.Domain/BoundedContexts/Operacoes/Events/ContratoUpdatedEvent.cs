using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ContratoUpdatedEvent(Guid EmpresaId, Guid ContratoId, Guid ClienteId) : DomainEvent;
