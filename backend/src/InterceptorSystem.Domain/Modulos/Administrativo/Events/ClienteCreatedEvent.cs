using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class ClienteCreatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid ClienteId { get; }

    public ClienteCreatedEvent(Guid empresaId, Guid clienteId)
    {
        EmpresaId = empresaId;
        ClienteId = clienteId;
    }
}
