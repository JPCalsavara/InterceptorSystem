using System;
using MediatR;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Events;

public class FuncionarioUpdatedEvent : INotification
{
    public Guid EmpresaId { get; }
    public Guid FuncionarioId { get; }
    public Guid? ClienteId { get; }

    public FuncionarioUpdatedEvent(Guid empresaId, Guid funcionarioId, Guid? clienteId)
    {
        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        ClienteId = clienteId;
    }
}
