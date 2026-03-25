using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record ContratoDeletedEvent(Guid EmpresaId, Guid ContratoId, Guid ClienteId) : DomainEvent;
