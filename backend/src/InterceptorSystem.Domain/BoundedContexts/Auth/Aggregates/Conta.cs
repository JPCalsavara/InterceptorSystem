using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.SharedKernel.ValueObjects;
using InterceptorSystem.Domain.BoundedContexts.Auth.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;

/// <summary>
/// Representa a conta SaaS — o "dono" do tenant.
/// O Id desta entidade É o EmpresaId usado em todo o resto do sistema.
/// Não herda de Entity para não ser filtrada pelo global query filter de tenant.
/// </summary>
public class Conta : IAggregateRoot
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; } = null!;
    public string SenhaHash { get; private set; } = null!;
    public string NomeEmpresa { get; private set; } = null!;
    public string? Cnpj { get; private set; }
    public PlanoAssinatura Plano { get; private set; }
    public bool Ativo { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public bool EmailVerificado { get; private set; }
    public string? EmailPendente { get; private set; }
    public string? Telefone { get; private set; }
    public bool TelefoneVerificado { get; private set; }

    // Construtor vazio para o EF Core
    protected Conta() { }

    public Conta(string email, string senhaHash, string nomeEmpresa, string? cnpj = null)
    {
        if (string.IsNullOrWhiteSpace(senhaHash))
            throw new InvalidOperationException("A senha é obrigatória.");
        if (string.IsNullOrWhiteSpace(nomeEmpresa))
            throw new InvalidOperationException("O nome da empresa é obrigatório.");

        Id = Guid.NewGuid();
        Email = Email.Criar(email);
        SenhaHash = senhaHash;
        NomeEmpresa = nomeEmpresa;
        Cnpj = cnpj;
        Plano = PlanoAssinatura.FREE;
        Ativo = true;
        CreatedAt = DateTime.UtcNow;
        EmailVerificado = false;
        EmailPendente = null;
        TelefoneVerificado = false;
    }

    public void AtualizarNomeEmpresa(string novoNome)
    {
        if (string.IsNullOrWhiteSpace(novoNome))
            throw new InvalidOperationException("O nome da empresa é obrigatório.");
        NomeEmpresa = novoNome;
    }

    public void AtualizarEmail(string novoEmail)
    {
        Email = Email.Criar(novoEmail);
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
        EmailPendente = Email.Criar(novoEmail).Valor;
    }

    public void ConfirmarAlteracaoEmail()
    {
        if (string.IsNullOrWhiteSpace(EmailPendente))
            throw new InvalidOperationException("Não há alteração de e-mail pendente.");
        Email = Email.Criar(EmailPendente);
        EmailPendente = null;
        EmailVerificado = true;
    }

    public void IniciarCadastroTelefone(string telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone))
            throw new InvalidOperationException("O telefone é obrigatório.");
        Telefone = telefone.Trim();
        TelefoneVerificado = false;
    }

    public void MarcarTelefoneComoVerificado()
    {
        if (string.IsNullOrWhiteSpace(Telefone))
            throw new InvalidOperationException("Nenhum telefone cadastrado para verificar.");
        TelefoneVerificado = true;
    }
}
