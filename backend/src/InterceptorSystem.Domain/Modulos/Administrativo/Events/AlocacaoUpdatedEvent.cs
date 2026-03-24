using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class AlocacaoUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid AlocacaoId { get; }

    public AlocacaoUpdatedEvent(Guid empresaId, Guid alocacaoId)
    {
        EmpresaId = empresaId;
        AlocacaoId = alocacaoId;
    }
}
