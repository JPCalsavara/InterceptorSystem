using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public record CreateTagDtoInput(
    string Nome,
    decimal Valor,
    string? Descricao = null);

public record UpdateTagDtoInput(
    string Nome,
    decimal Valor,
    string? Descricao = null);

public record TagDtoOutput(
    Guid Id,
    string Nome,
    decimal Valor,
    string? Descricao)
{
    public static TagDtoOutput? FromEntity(Tag? entity)
    {
        if (entity == null) return null;
        return new TagDtoOutput(entity.Id, entity.Nome, entity.Valor, entity.Descricao);
    }
}
