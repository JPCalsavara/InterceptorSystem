using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class PostoDeletedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid PostoId { get; }
    public Guid ClienteId { get; }

    public PostoDeletedEvent(Guid empresaId, Guid postoId, Guid clienteId)
    {
        EmpresaId = empresaId;
        PostoId = postoId;
        ClienteId = clienteId;
    }
}
