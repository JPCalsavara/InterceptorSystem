using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class ClienteDeletedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid ClienteId { get; }

    public ClienteDeletedEvent(Guid empresaId, Guid clienteId)
    {
        EmpresaId = empresaId;
        ClienteId = clienteId;
    }
}
