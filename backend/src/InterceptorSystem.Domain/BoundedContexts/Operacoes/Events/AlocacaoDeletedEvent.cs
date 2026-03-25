using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record AlocacaoDeletedEvent(Guid EmpresaId, Guid AlocacaoId) : DomainEvent;
