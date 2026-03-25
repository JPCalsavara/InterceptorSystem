using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record FuncionarioDeletedEvent(Guid EmpresaId, Guid FuncionarioId, Guid? ClienteId) : DomainEvent;
