using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public record CreateDiariaDtoInput(
    Guid FuncionarioId,
    Guid AlocacaoId,
    DateOnly Data,
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria,
    Guid? DiariaSubstituidaId = null,
    string? OrigemModificacao = null);

public record UpdateDiariaDtoInput(
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria);

public record DiariaDtoOutput(
    Guid Id,
    Guid FuncionarioId,
    Guid AlocacaoId,
    DateOnly Data,
    decimal ValorDiaria,
    Guid? TagId,
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria,
    Guid? DiariaSubstituidaId,
    string? OrigemModificacao,
    DateTimeOffset? DataHoraModificacao)
{
    public static DiariaDtoOutput? FromEntity(Diaria? entity)
    {
        if (entity == null) return null;
        return new DiariaDtoOutput(
            entity.Id,
            entity.FuncionarioId,
            entity.AlocacaoId,
            entity.Data,
            entity.ValorDiaria,
            entity.TagId,
            entity.StatusDiaria,
            entity.TipoDiaria,
            entity.DiariaSubstituidaId,
            entity.OrigemModificacao,
            entity.DataHoraModificacao);
    }
}

/// <summary>
/// DTO enriquecido com nome do funcionário, usado pelo bot do WhatsApp para
/// exibir as diárias de um posto em uma data específica.
/// </summary>
public record DiariaComFuncionarioDto(
    Guid Id,
    Guid FuncionarioId,
    string NomeFuncionario,
    TipoDiaria TipoDiaria,
    StatusDiaria StatusDiaria);

public record DiariaTagResumoDto(
    Guid? TagId,
    string TagNome,
    int QuantidadeDiarias,
    decimal TotalValor);

public record DiariasContratoResumoDto(
    Guid ContratoId,
    int Ano,
    int Mes,
    int TotalDiarias,
    decimal TotalValorDiarias,
    int TotalConfirmadas,
    int TotalFaltas,
    int TotalCanceladas,
    IReadOnlyList<DiariaTagResumoDto> ResumoByTag);

public record ContratoResumoFinanceiroPostoDto(
    Guid PostoId,
    string PostoNome,
    int TotalDiarias,
    decimal CustoTotal,
    int DiariasNormais,
    int DiariasExtras,
    int DiariasFimDeSemana);

public record ContratoResumoFinanceiroAlocacaoDto(
    Guid AlocacaoId,
    TipoEscala TipoEscala,
    bool TemHorarioNoturno,
    int TotalDiarias,
    decimal CustoTotal,
    int DiariasNormais,
    int DiariasExtras,
    int DiariasFimDeSemana);

public record ContratoResumoFinanceiroFuncionarioDto(
    Guid FuncionarioId,
    string FuncionarioNome,
    int TotalDiarias,
    decimal CustoTotal,
    int DiariasNormais,
    int DiariasExtras,
    int DiariasFimDeSemana);

public record ContratoResumoFinanceiroDto(
    Guid ContratoId,
    int Ano,
    int Mes,
    decimal CustoRealDiariasNormais,
    decimal CustoRealDiariasExtras,
    decimal CustoRealTotal,
    int TotalDiariasNormais,
    int TotalDiariasExtras,
    int TotalDiariasFimDeSemana,
    IReadOnlyList<ContratoResumoFinanceiroPostoDto> ProjecaoCustoPorPosto,
    IReadOnlyList<ContratoResumoFinanceiroAlocacaoDto> ProjecaoCustoPorAlocacao,
    IReadOnlyList<ContratoResumoFinanceiroFuncionarioDto> ProjecaoCustoPorFuncionario);
