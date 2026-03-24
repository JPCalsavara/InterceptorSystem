using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class PostoCreatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid PostoId { get; }
    public Guid ClienteId { get; }

    public PostoCreatedEvent(Guid empresaId, Guid postoId, Guid clienteId)
    {
        EmpresaId = empresaId;
        PostoId = postoId;
        ClienteId = clienteId;
    }
}
