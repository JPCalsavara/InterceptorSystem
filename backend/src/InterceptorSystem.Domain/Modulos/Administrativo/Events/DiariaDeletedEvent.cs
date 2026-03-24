using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class DiariaDeletedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid DiariaId { get; }

    public DiariaDeletedEvent(Guid empresaId, Guid diariaId)
    {
        EmpresaId = empresaId;
        DiariaId = diariaId;
    }
}
