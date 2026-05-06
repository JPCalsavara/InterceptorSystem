using InterceptorSystem.Domain.SharedKernel;
using InterceptorSystem.Domain.SharedKernel.Interfaces;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

/// <summary>
/// Representa uma função/classificação reutilizável (ex: "PM", "Vigia Avulso").
/// Valor é o preço base de referência de mercado. O preço real cobrado por contrato é definido em ContratoTag.ValorDiaria.
/// </summary>
public class Tag : Entity, IAggregateRoot
{
    public string Nome { get; private set; } = null!;
    public string? Descricao { get; private set; }
    public decimal Valor { get; private set; }

    protected Tag() { }

    public Tag(Guid empresaId, string nome, decimal valor, string? descricao = null)
    {
        Enforce(empresaId != Guid.Empty, "A Tag deve pertencer a uma empresa.");
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");
        Enforce(valor >= 0, "Valor base da Tag não pode ser negativo.");

        EmpresaId = empresaId;
        Nome = nome.Trim();
        Valor = valor;
        Descricao = descricao?.Trim();
    }

    public void AtualizarDados(string nome, decimal valor, string? descricao = null)
    {
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome da Tag é obrigatório.");
        Enforce(valor >= 0, "Valor base da Tag não pode ser negativo.");

        Nome = nome.Trim();
        Valor = valor;
        Descricao = descricao?.Trim();
    }
}
