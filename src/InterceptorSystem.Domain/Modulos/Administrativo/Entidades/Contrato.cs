using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Contrato : Entity, IAggregateRoot
{
    public Guid CondominioId { get; private set; }
    public string Descricao { get; private set; } = null!;
    public decimal ValorTotalMensal { get; private set; }
    public decimal ValorDiariaCobrada { get; private set; }
    public decimal PercentualAdicionalNoturno { get; private set; }
    public decimal ValorBeneficiosExtrasMensal { get; private set; }
    public decimal PercentualImpostos { get; private set; }
    public int QuantidadeFuncionarios { get; private set; }
    public decimal MargemLucroPercentual { get; private set; }
    public decimal MargemCoberturaFaltasPercentual { get; private set; }
    public DateOnly DataInicio { get; private set; }
    public DateOnly DataFim { get; private set; }
    public StatusContrato Status { get; private set; }

    public Condominio? Condominio { get; private set; }
    public ICollection<Funcionario> Funcionarios { get; private set; } = new List<Funcionario>(); // FASE 2: Navegação para funcionários

    protected Contrato() { }

    public Contrato(
        Guid empresaId,
        Guid condominioId,
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int quantidadeFuncionarios,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim,
        StatusContrato status)
    {
        CheckRule(empresaId == Guid.Empty, "O contrato deve estar associado a uma empresa.");
        CheckRule(condominioId == Guid.Empty, "O contrato deve pertencer a um condomínio.");
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(quantidadeFuncionarios <= 0, "Quantidade de funcionários deve ser maior que zero.");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");

        EmpresaId = empresaId;
        CondominioId = condominioId;
        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        QuantidadeFuncionarios = quantidadeFuncionarios;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
        Status = status;
    }

    public void AtualizarDados(
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int quantidadeFuncionarios,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim)
    {
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(quantidadeFuncionarios <= 0, "Quantidade de funcionários deve ser maior que zero.");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");

        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        QuantidadeFuncionarios = quantidadeFuncionarios;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
    }

    public void AtualizarStatus(StatusContrato status)
    {
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");
        Status = status;
    }

    private static void CheckPercentual(decimal valor, string mensagem)
    {
        if (valor < 0m || valor > 1m)
        {
            throw new InvalidOperationException(mensagem);
        }
    }
}
