using InterceptorSystem.Domain.SharedKernel;
using InterceptorSystem.Domain.SharedKernel.Interfaces;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

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
        Enforce(empresaId != Guid.Empty, "A Tag deve pertencer a uma empresa.");
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");

        EmpresaId = empresaId;
        Nome = nome.Trim();
        Descricao = descricao?.Trim();
    }

    public void AtualizarDados(string nome, string? descricao = null)
    {
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");

        Nome = nome.Trim();
        Descricao = descricao?.Trim();
    }
}
