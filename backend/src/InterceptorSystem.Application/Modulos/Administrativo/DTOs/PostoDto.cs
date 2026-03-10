namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreatePostoInput(
    Guid ClienteId,
    string Nome,
    string Endereco,
    string Cidade,
    string Estado);

public record UpdatePostoInput(
    string Nome, 
    string Endereco, 
    string Cidade,
    string Estado);

public record PostoDto(
    Guid Id,
    Guid ClienteId,
    string Nome,
    string Endereco,
    string Cidade,
    string Estado,
    bool Ativo)
{
    public static PostoDto FromEntity(Domain.Modulos.Administrativo.Entidades.Posto posto)
    {
        return new PostoDto(
            posto.Id,
            posto.ClienteId,
            posto.Nome,
            posto.Endereco,
            posto.Cidade,
            posto.Estado,
            posto.Ativo
        );
    }
}
