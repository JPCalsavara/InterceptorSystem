using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record AlocacaoUpdatedEvent(Guid EmpresaId, Guid AlocacaoId) : DomainEvent;
