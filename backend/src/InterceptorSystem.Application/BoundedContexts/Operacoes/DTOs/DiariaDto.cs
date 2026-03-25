using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public record CreateDiariaDtoInput(
    Guid FuncionarioId,
    Guid AlocacaoId,
    DateOnly Data,
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria);

public record UpdateDiariaDtoInput(
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria);

public record DiariaDtoOutput(
    Guid Id,
    Guid FuncionarioId,
    Guid AlocacaoId,
    DateOnly Data,
    StatusDiaria StatusDiaria,
    TipoDiaria TipoDiaria)
{
    public static DiariaDtoOutput? FromEntity(Diaria? entity)
    {
        if (entity == null) return null;
        return new DiariaDtoOutput(
            entity.Id,
            entity.FuncionarioId,
            entity.AlocacaoId,
            entity.Data,
            entity.StatusDiaria,
            entity.TipoDiaria);
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
