using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Auth.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;

/// <summary>
/// Token temporário para verificação de email, reset de senha e alteração de email.
/// Não herda de Entity para não ser filtrada pelo global query filter de tenant.
/// </summary>
public class TokenVerificacao : IAggregateRoot
{
    public Guid Id { get; private set; }
    public Guid ContaId { get; private set; }
    public string Token { get; private set; } = null!;
    public TipoTokenVerificacao Tipo { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool Usado { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string? DadosAdicionais { get; private set; }

    // Construtor vazio para o EF Core
    protected TokenVerificacao() { }

    public TokenVerificacao(Guid contaId, string token, TipoTokenVerificacao tipo, DateTime expiresAt, string? dadosAdicionais = null)
    {
        Id = Guid.NewGuid();
        ContaId = contaId;
        Token = token;
        Tipo = tipo;
        ExpiresAt = expiresAt;
        Usado = false;
        CreatedAt = DateTime.UtcNow;
        DadosAdicionais = dadosAdicionais;
    }

    public void Consumir()
    {
        Usado = true;
    }

    public bool EstaValido()
    {
        return !Usado && DateTime.UtcNow < ExpiresAt;
    }
}
