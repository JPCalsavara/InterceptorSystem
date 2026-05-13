using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ContratoCreatedEvent(Guid EmpresaId, Guid ContratoId, Guid ClienteId) : DomainEvent;
