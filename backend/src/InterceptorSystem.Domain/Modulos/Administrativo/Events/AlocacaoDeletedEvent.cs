using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class AlocacaoDeletedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid AlocacaoId { get; }

    public AlocacaoDeletedEvent(Guid empresaId, Guid alocacaoId)
    {
        EmpresaId = empresaId;
        AlocacaoId = alocacaoId;
    }
}
