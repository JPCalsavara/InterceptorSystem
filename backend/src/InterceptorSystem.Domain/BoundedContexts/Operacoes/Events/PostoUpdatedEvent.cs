using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

public record PostoUpdatedEvent(Guid EmpresaId, Guid PostoId, Guid ClienteId, Guid ContratoId) : DomainEvent;
