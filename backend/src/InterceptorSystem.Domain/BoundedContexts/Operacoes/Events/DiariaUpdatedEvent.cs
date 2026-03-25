using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record DiariaUpdatedEvent(Guid EmpresaId, Guid DiariaId) : DomainEvent;
