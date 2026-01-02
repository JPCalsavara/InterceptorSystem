using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Contrato : Entity, IAggregateRoot
{
    public Guid CondominioId { get; private set; }
    public string Descricao { get; private set; } = null!;
    public decimal ValorTotal { get; private set; }
    public decimal ValorDiariaCobrada { get; private set; }
    public DateOnly DataInicio { get; private set; }
    public DateOnly DataFim { get; private set; }
    public StatusContrato Status { get; private set; }

    public Condominio? Condominio { get; private set; }

    protected Contrato() { }

    public Contrato(
        Guid empresaId,
        Guid condominioId,
        string descricao,
        decimal valorTotal,
        decimal valorDiariaCobrada,
        DateOnly dataInicio,
        DateOnly dataFim,
        StatusContrato status)
    {
        CheckRule(empresaId == Guid.Empty, "O contrato deve estar associado a uma empresa.");
        CheckRule(condominioId == Guid.Empty, "O contrato deve pertencer a um condomínio.");
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotal <= 0, "O valor total deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");

        EmpresaId = empresaId;
        CondominioId = condominioId;
        Descricao = descricao;
        ValorTotal = valorTotal;
        ValorDiariaCobrada = valorDiariaCobrada;
        DataInicio = dataInicio;
        DataFim = dataFim;
        Status = status;
    }

    public void AtualizarDados(
        string descricao,
        decimal valorTotal,
        decimal valorDiariaCobrada,
        DateOnly dataInicio,
        DateOnly dataFim)
    {
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotal <= 0, "O valor total deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");

        Descricao = descricao;
        ValorTotal = valorTotal;
        ValorDiariaCobrada = valorDiariaCobrada;
        DataInicio = dataInicio;
        DataFim = dataFim;
    }

    public void AtualizarStatus(StatusContrato status)
    {
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");
        Status = status;
    }
}

