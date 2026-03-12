using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

/// <summary>
/// Representa uma função/classificação reutilizável (ex: "PM", "Vigia Avulso").
/// O valor da diária é definido por contrato via ContratoTag.
/// </summary>
public class Tag : Entity, IAggregateRoot
{
    public string Nome { get; private set; } = null!;
    public string? Descricao { get; private set; }

    protected Tag() { }

    public Tag(Guid empresaId, string nome, string? descricao = null)
    {
        CheckRule(empresaId == Guid.Empty, "A Tag deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");

        EmpresaId = empresaId;
        Nome = nome.Trim();
        Descricao = descricao?.Trim();
    }

    public void AtualizarDados(string nome, string? descricao = null)
    {
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");

        Nome = nome.Trim();
        Descricao = descricao?.Trim();
    }
}
