using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class PostoUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid PostoId { get; }
    public Guid ClienteId { get; }

    public PostoUpdatedEvent(Guid empresaId, Guid postoId, Guid clienteId)
    {
        EmpresaId = empresaId;
        PostoId = postoId;
        ClienteId = clienteId;
    }
}
