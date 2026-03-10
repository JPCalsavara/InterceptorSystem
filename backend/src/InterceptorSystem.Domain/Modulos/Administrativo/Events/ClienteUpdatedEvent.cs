using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class ClienteUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid ClienteId { get; }

    public ClienteUpdatedEvent(Guid empresaId, Guid clienteId)
    {
        EmpresaId = empresaId;
        ClienteId = clienteId;
    }
}
