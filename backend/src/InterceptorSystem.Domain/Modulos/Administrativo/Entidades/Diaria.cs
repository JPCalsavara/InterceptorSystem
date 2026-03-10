using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Diaria : Entity, IAggregateRoot
{
    public Guid FuncionarioId { get; private set; }
    public Guid AlocacaoId { get; private set; }
    public DateOnly Data { get; private set; }
    public decimal ValorDiaria { get; private set; }
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
        TipoDiaria tipoDiaria)
    {
        CheckRule(empresaId == Guid.Empty, "A diária deve pertencer a uma empresa.");
        CheckRule(funcionarioId == Guid.Empty, "A diária deve referenciar um funcionário.");
        CheckRule(alocacaoId == Guid.Empty, "A diária deve referenciar uma alocação.");
        CheckRule(valorDiaria < 0, "O valor da diária não pode ser negativo.");
        CheckRule(!Enum.IsDefined(statusDiaria), "Status da diária é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoDiaria), "Tipo de diária é obrigatório.");

        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        AlocacaoId = alocacaoId;
        Data = data;
        ValorDiaria = valorDiaria;
        StatusDiaria = statusDiaria;
        TipoDiaria = tipoDiaria;
    }

    public void AtualizarStatus(StatusDiaria statusDiaria, TipoDiaria tipoDiaria)
    {
        CheckRule(!Enum.IsDefined(statusDiaria), "Status da diária é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoDiaria), "Tipo de diária é obrigatório.");

        StatusDiaria = statusDiaria;
        TipoDiaria = tipoDiaria;
    }
}
