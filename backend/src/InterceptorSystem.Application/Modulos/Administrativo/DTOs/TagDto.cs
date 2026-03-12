using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateTagDtoInput(
    string Nome,
    string? Descricao = null);

public record UpdateTagDtoInput(
    string Nome,
    string? Descricao = null);

public record TagDtoOutput(
    Guid Id,
    string Nome,
    string? Descricao)
{
    public static TagDtoOutput? FromEntity(Tag? entity)
    {
        if (entity == null) return null;
        return new TagDtoOutput(entity.Id, entity.Nome, entity.Descricao);
    }
}
