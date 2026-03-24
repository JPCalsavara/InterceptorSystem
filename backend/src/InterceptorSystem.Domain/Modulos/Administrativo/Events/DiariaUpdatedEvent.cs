using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class DiariaUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid DiariaId { get; }

    public DiariaUpdatedEvent(Guid empresaId, Guid diariaId)
    {
        EmpresaId = empresaId;
        DiariaId = diariaId;
    }
}
