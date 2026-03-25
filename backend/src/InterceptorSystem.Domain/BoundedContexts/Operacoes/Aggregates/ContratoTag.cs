using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

/// <summary>
/// Join entity between Contrato and Tag with contract-specific daily rate.
/// </summary>
public class ContratoTag : Entity
{
    public Guid ContratoId { get; private set; }
    public Guid TagId { get; private set; }
    public decimal ValorDiaria { get; private set; }

    public Contrato? Contrato { get; private set; }
    public Tag? Tag { get; private set; }

    protected ContratoTag() { }

    public ContratoTag(Guid empresaId, Guid contratoId, Guid tagId, decimal valorDiaria)
    {
        Enforce(empresaId != Guid.Empty, "EmpresaId é obrigatório.");
        Enforce(contratoId != Guid.Empty, "ContratoId é obrigatório.");
        Enforce(tagId != Guid.Empty, "TagId é obrigatório.");
        Enforce(valorDiaria >= 0, "ValorDiaria não pode ser negativo.");

        EmpresaId = empresaId;
        ContratoId = contratoId;
        TagId = tagId;
        ValorDiaria = valorDiaria;
    }

    public void AtualizarValorDiaria(decimal valorDiaria)
    {
        Enforce(valorDiaria >= 0, "ValorDiaria não pode ser negativo.");
        ValorDiaria = valorDiaria;
    }
}
