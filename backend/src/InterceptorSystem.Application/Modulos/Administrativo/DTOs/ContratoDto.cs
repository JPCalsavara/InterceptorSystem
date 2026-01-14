using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateContratoDtoInput(
    Guid CondominioId,
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int QuantidadeFuncionarios,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status);

public record UpdateContratoDtoInput(
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int QuantidadeFuncionarios,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status);

public record ContratoDtoOutput(
    Guid Id,
    Guid CondominioId,
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int QuantidadeFuncionarios,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status)
{
    public static ContratoDtoOutput? FromEntity(Contrato? entity)
    {
        if (entity == null) return null;
        return new ContratoDtoOutput(
            entity.Id,
            entity.CondominioId,
            entity.Descricao,
            entity.ValorTotalMensal,
            entity.ValorDiariaCobrada,
            entity.PercentualAdicionalNoturno,
            entity.ValorBeneficiosExtrasMensal,
            entity.PercentualImpostos,
            entity.QuantidadeFuncionarios,
            entity.MargemLucroPercentual,
            entity.MargemCoberturaFaltasPercentual,
            entity.DataInicio,
            entity.DataFim,
            entity.Status);
    }
}
