using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record DiariaDeletedEvent(Guid EmpresaId, Guid DiariaId) : DomainEvent;
