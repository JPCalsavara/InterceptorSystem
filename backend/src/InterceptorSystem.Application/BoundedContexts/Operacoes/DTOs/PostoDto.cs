namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public record CreatePostoInput(
    Guid ClienteId,
    Guid ContratoId,
    string Nome,
    string Cep,
    string Endereco,
    string Numero,
    string? Complemento,
    string Cidade,
    string Estado);

public record UpdatePostoInput(
    string Nome,
    string Cep,
    string Endereco,
    string Numero,
    string? Complemento,
    string Cidade,
    string Estado);

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
    bool Ativo)
{
    public static PostoDto FromEntity(Domain.BoundedContexts.Operacoes.Aggregates.Posto posto)
    {
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
            posto.Ativo
        );
    }
}
