using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class AlocacaoCreatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid AlocacaoId { get; }

    public AlocacaoCreatedEvent(Guid empresaId, Guid alocacaoId)
    {
        EmpresaId = empresaId;
        AlocacaoId = alocacaoId;
    }
}
