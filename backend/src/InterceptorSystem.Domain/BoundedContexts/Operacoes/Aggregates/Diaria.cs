using InterceptorSystem.Domain.SharedKernel;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

public class Diaria : Entity, IAggregateRoot
{
    public Guid FuncionarioId { get; private set; }
    public Guid AlocacaoId { get; private set; }
    public DateOnly Data { get; private set; }
    public decimal ValorDiaria { get; private set; }
    public Guid? TagId { get; private set; }
    public StatusDiaria StatusDiaria { get; private set; }
    public TipoDiaria TipoDiaria { get; private set; }

    public Funcionario? Funcionario { get; private set; }
    public Alocacao? Alocacao { get; private set; }

    protected Diaria() { }

    public Diaria(
        Guid empresaId,
        Guid funcionarioId,
        Guid alocacaoId,
        DateOnly data,
        decimal valorDiaria,
        StatusDiaria statusDiaria,
        TipoDiaria tipoDiaria,
        Guid? tagId = null)
    {
        Enforce(empresaId != Guid.Empty, "A diária deve pertencer a uma empresa.");
        Enforce(funcionarioId != Guid.Empty, "A diária deve referenciar um funcionário.");
        Enforce(alocacaoId != Guid.Empty, "A diária deve referenciar uma alocação.");
        Enforce(valorDiaria >= 0, "O valor da diária não pode ser negativo.");
        Enforce(Enum.IsDefined(statusDiaria), "Status da diária é obrigatório.");
        Enforce(Enum.IsDefined(tipoDiaria), "Tipo de diária é obrigatório.");

        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        AlocacaoId = alocacaoId;
        Data = data;
        ValorDiaria = valorDiaria;
        TagId = tagId;
        StatusDiaria = statusDiaria;
        TipoDiaria = tipoDiaria;

        AddDomainEvent(new DiariaCreatedEvent(EmpresaId, Id));
    }

    public void AtualizarStatus(StatusDiaria statusDiaria, TipoDiaria tipoDiaria)
    {
        Enforce(Enum.IsDefined(statusDiaria), "Status da diária é obrigatório.");
        Enforce(Enum.IsDefined(tipoDiaria), "Tipo de diária é obrigatório.");

        StatusDiaria = statusDiaria;
        TipoDiaria = tipoDiaria;

        AddDomainEvent(new DiariaUpdatedEvent(EmpresaId, Id));
    }

    public void PrepararExclusao()
    {
        AddDomainEvent(new DiariaDeletedEvent(EmpresaId, Id));
    }
}
