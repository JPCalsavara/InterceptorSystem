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
    decimal PercentualEncargosProvisoes,
    int NumeroDePostos, // Número de postos/turnos (QuantidadeFuncionarios será calculado automaticamente)
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    IReadOnlyList<ContratoTagInput>? Tags = null,
    decimal? ValorDiariaVigilante = null);

public record UpdateContratoDtoInput(
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualEncargosProvisoes,
    int NumeroDePostos, // Número de postos/turnos (QuantidadeFuncionarios será calculado automaticamente)
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    IReadOnlyList<ContratoTagInput>? Tags = null,
    decimal? ValorDiariaVigilante = null);

public record ContratoTagInput(
    Guid TagId,
    decimal ValorDiaria);

public record ContratoTagDtoOutput(
    Guid TagId,
    string TagNome,
    decimal ValorDiaria)
{
    public static ContratoTagDtoOutput? FromEntity(ContratoTag? entity)
    {
        if (entity == null || entity.Tag == null) return null;
        return new ContratoTagDtoOutput(entity.TagId, entity.Tag.Nome, entity.ValorDiaria);
    }
}

public record ContratoDtoOutput(
    Guid Id,
    Guid ClienteId,
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualEncargosProvisoes,
    int QuantidadeFuncionarios,
    int NumeroDePostos, // ADICIONADO: Número de postos/turnos
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    IReadOnlyList<ContratoTagDtoOutput> Tags,
    decimal? ValorDiariaVigilante = null)
{
    public static ContratoDtoOutput? FromEntity(Contrato? entity)
    {
        if (entity == null) return null;
        var tags = entity.Tags
            .Select(ContratoTagDtoOutput.FromEntity)
            .Where(t => t != null)
            .Select(t => t!)
            .ToList();
        return new ContratoDtoOutput(
            entity.Id,
            entity.ClienteId,
            entity.Descricao,
            entity.ValorTotalMensal,
            entity.ValorDiariaCobrada,
            entity.PercentualAdicionalNoturno,
            entity.ValorBeneficiosExtrasMensal,
            entity.PercentualEncargosProvisoes,
            entity.QuantidadeFuncionarios,
            entity.NumeroDePostos, // ADICIONADO
            entity.MargemLucroPercentual,
            entity.MargemCoberturaFaltasPercentual,
            entity.DataInicio,
            entity.DataFim,
            entity.Status,
            tags,
            entity.ValorDiariaVigilante);
    }
}
