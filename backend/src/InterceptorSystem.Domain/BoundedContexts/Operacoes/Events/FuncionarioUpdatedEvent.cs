using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record FuncionarioUpdatedEvent(Guid EmpresaId, Guid FuncionarioId, Guid? ClienteId) : DomainEvent;
