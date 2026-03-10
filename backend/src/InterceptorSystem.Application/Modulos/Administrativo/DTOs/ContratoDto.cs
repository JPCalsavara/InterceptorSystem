using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateContratoDtoInput(
    Guid ClienteId,
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int NumeroDePostos, // Número de postos/turnos (QuantidadeFuncionarios será calculado automaticamente)
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    decimal? ValorDiariaVigilante = null);

public record UpdateContratoDtoInput(
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int NumeroDePostos, // Número de postos/turnos (QuantidadeFuncionarios será calculado automaticamente)
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    decimal? ValorDiariaVigilante = null);

public record ContratoDtoOutput(
    Guid Id,
    Guid ClienteId,
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int QuantidadeFuncionarios,
    int NumeroDePostos, // ADICIONADO: Número de postos/turnos
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    decimal? ValorDiariaVigilante = null)
{
    public static ContratoDtoOutput? FromEntity(Contrato? entity)
    {
        if (entity == null) return null;
        return new ContratoDtoOutput(
            entity.Id,
            entity.ClienteId,
            entity.Descricao,
            entity.ValorTotalMensal,
            entity.ValorDiariaCobrada,
            entity.PercentualAdicionalNoturno,
            entity.ValorBeneficiosExtrasMensal,
            entity.PercentualImpostos,
            entity.QuantidadeFuncionarios,
            entity.NumeroDePostos, // ADICIONADO
            entity.MargemLucroPercentual,
            entity.MargemCoberturaFaltasPercentual,
            entity.DataInicio,
            entity.DataFim,
            entity.Status,
            entity.ValorDiariaVigilante);
    }
}
