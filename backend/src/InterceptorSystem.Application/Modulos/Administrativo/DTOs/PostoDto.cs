namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreatePostoInput(
    Guid ClienteId,
    string Nome,
    string Cep,
    string Endereco,
    string Numero,
    string? Complemento,
    string Cidade,
    string Estado,
    IReadOnlyList<Guid>? TagIds = null);

public record UpdatePostoInput(
    string Nome,
    string Cep,
    string Endereco,
    string Numero,
    string? Complemento,
    string Cidade,
    string Estado,
    IReadOnlyList<Guid>? TagIds = null);

public record PostoDto(
    Guid Id,
    Guid ClienteId,
    string Nome,
    string Cep,
    string Endereco,
    string Numero,
    string? Complemento,
    string Cidade,
    string Estado,
    IReadOnlyList<TagDtoOutput> Tags,
    bool Ativo)
{
    public static PostoDto FromEntity(Domain.Modulos.Administrativo.Entidades.Posto posto)
    {
        var tags = posto.Tags
            .Select(pt => TagDtoOutput.FromEntity(pt.Tag))
            .Where(tag => tag != null)
            .Select(tag => tag!)
            .ToList();

        return new PostoDto(
            posto.Id,
            posto.ClienteId,
            posto.Nome,
            posto.Cep.Valor,
            posto.Endereco,
            posto.Numero,
            posto.Complemento,
            posto.Cidade,
            posto.Estado,
            tags,
            posto.Ativo
        );
    }
}
