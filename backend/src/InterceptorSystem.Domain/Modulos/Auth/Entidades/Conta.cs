using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Enums;

namespace InterceptorSystem.Domain.Modulos.Auth.Entidades;

/// <summary>
/// Representa a conta SaaS — o "dono" do tenant.
/// O Id desta entidade É o EmpresaId usado em todo o resto do sistema.
/// Não herda de Entity para não ser filtrada pelo global query filter de tenant.
/// </summary>
public class Conta : IAggregateRoot
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public string NomeEmpresa { get; private set; } = null!;
    public string? Cnpj { get; private set; }
    public PlanoAssinatura Plano { get; private set; }
    public bool Ativo { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public bool EmailVerificado { get; private set; }
    public string? EmailPendente { get; private set; }

    // Construtor vazio para o EF Core
    protected Conta() { }

    public Conta(string email, string senhaHash, string nomeEmpresa, string? cnpj = null)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("O e-mail é obrigatório.");
        if (string.IsNullOrWhiteSpace(senhaHash))
            throw new InvalidOperationException("A senha é obrigatória.");
        if (string.IsNullOrWhiteSpace(nomeEmpresa))
            throw new InvalidOperationException("O nome da empresa é obrigatório.");

        Id = Guid.NewGuid();
        Email = email.ToLower().Trim();
        SenhaHash = senhaHash;
        NomeEmpresa = nomeEmpresa;
        Cnpj = cnpj;
        Plano = PlanoAssinatura.FREE;
        Ativo = true;
        CreatedAt = DateTime.UtcNow;
        EmailVerificado = false;
        EmailPendente = null;
    }

    public void AtualizarNomeEmpresa(string novoNome)
    {
        if (string.IsNullOrWhiteSpace(novoNome))
            throw new InvalidOperationException("O nome da empresa é obrigatório.");
        NomeEmpresa = novoNome;
    }

    public void AtualizarEmail(string novoEmail)
    {
        if (string.IsNullOrWhiteSpace(novoEmail))
            throw new InvalidOperationException("O e-mail é obrigatório.");
        Email = novoEmail.ToLower().Trim();
    }

    public void AtualizarSenha(string novaSenhaHash)
    {
        if (string.IsNullOrWhiteSpace(novaSenhaHash))
            throw new InvalidOperationException("A senha é obrigatória.");
        SenhaHash = novaSenhaHash;
    }

    public void AtualizarPlano(PlanoAssinatura novoPlano)
    {
        Plano = novoPlano;
    }

    public void Desativar()
    {
        Ativo = false;
    }

    public void MarcarEmailComoVerificado()
    {
        EmailVerificado = true;
    }

    public void AlterarSenha(string novaSenhaHash)
    {
        if (string.IsNullOrWhiteSpace(novaSenhaHash))
            throw new InvalidOperationException("A senha é obrigatória.");
        SenhaHash = novaSenhaHash;
    }

    public void IniciarAlteracaoEmail(string novoEmail)
    {
        if (string.IsNullOrWhiteSpace(novoEmail))
            throw new InvalidOperationException("O e-mail é obrigatório.");
        EmailPendente = novoEmail.ToLower().Trim();
    }

    public void ConfirmarAlteracaoEmail()
    {
        if (string.IsNullOrWhiteSpace(EmailPendente))
            throw new InvalidOperationException("Não há alteração de e-mail pendente.");
        Email = EmailPendente;
        EmailPendente = null;
        EmailVerificado = true;
    }
}
