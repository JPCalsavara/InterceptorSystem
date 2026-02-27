using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;

namespace InterceptorSystem.Domain.Modulos.Auth.Interfaces;

public interface ITokenVerificacaoRepository
{
    Task<TokenVerificacao?> GetByTokenAsync(string token, TipoTokenVerificacao tipo);
    void Add(TokenVerificacao token);
    Task InvalidarTokensAnterioresAsync(Guid contaId, TipoTokenVerificacao tipo);
    Task<bool> CommitAsync();
}
