using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record DiariaCreatedEvent(Guid EmpresaId, Guid DiariaId) : DomainEvent;
