using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class DiariaCreatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid DiariaId { get; }

    public DiariaCreatedEvent(Guid empresaId, Guid diariaId)
    {
        EmpresaId = empresaId;
        DiariaId = diariaId;
    }
}
