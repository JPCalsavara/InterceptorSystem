using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Auth.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Auth.Interfaces;

public interface ITokenVerificacaoRepository
{
    Task<TokenVerificacao?> GetByTokenAsync(string token, TipoTokenVerificacao tipo);
    void Add(TokenVerificacao token);
    Task InvalidarTokensAnterioresAsync(Guid contaId, TipoTokenVerificacao tipo);

    Task<bool> CommitAsync() => CommitAsync(default);
    Task<bool> CommitAsync(CancellationToken cancellationToken = default);
}
