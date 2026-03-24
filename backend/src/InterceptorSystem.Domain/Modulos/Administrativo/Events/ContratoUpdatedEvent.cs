using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class ContratoUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid ContratoId { get; }
    public Guid ClienteId { get; }

    public ContratoUpdatedEvent(Guid empresaId, Guid contratoId, Guid clienteId)
    {
        EmpresaId = empresaId;
        ContratoId = contratoId;
        ClienteId = clienteId;
    }
}
