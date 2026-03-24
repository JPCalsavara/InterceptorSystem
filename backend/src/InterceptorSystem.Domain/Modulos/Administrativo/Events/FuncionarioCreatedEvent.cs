using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class FuncionarioCreatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid FuncionarioId { get; }
    public Guid? ClienteId { get; }

    public FuncionarioCreatedEvent(Guid empresaId, Guid funcionarioId, Guid? clienteId)
    {
        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        ClienteId = clienteId;
    }
}
