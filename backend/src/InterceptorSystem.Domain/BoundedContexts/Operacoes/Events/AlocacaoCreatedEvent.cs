using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record AlocacaoCreatedEvent(Guid EmpresaId, Guid AlocacaoId) : DomainEvent;
