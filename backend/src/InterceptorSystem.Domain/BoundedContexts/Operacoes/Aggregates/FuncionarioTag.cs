using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

/// <summary>
/// Join entity: many-to-many between Funcionario and Tag.
/// Phase 4: Tag-based daily rate association.
/// </summary>
public class FuncionarioTag : Entity
{
    public Guid FuncionarioId { get; private set; }
    public Guid TagId { get; private set; }

    public Funcionario? Funcionario { get; private set; }
    public Tag? Tag { get; private set; }

    protected FuncionarioTag() { }

    public FuncionarioTag(Guid empresaId, Guid funcionarioId, Guid tagId)
    {
        Enforce(empresaId != Guid.Empty, "EmpresaId é obrigatório.");
        Enforce(funcionarioId != Guid.Empty, "FuncionarioId é obrigatório.");
        Enforce(tagId != Guid.Empty, "TagId é obrigatório.");

        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        TagId = tagId;
    }
}
