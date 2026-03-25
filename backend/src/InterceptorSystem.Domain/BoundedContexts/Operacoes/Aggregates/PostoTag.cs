using InterceptorSystem.Domain.SharedKernel;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

/// <summary>
/// Join entity: many-to-many between Posto and Tag.
/// </summary>
public class PostoTag : Entity
{
    public Guid PostoId { get; private set; }
    public Guid TagId { get; private set; }

    public Posto? Posto { get; private set; }
    public Tag? Tag { get; private set; }

    protected PostoTag() { }

    public PostoTag(Guid empresaId, Guid postoId, Guid tagId)
    {
        Enforce(empresaId != Guid.Empty, "EmpresaId é obrigatório.");
        Enforce(postoId != Guid.Empty, "PostoId é obrigatório.");
        Enforce(tagId != Guid.Empty, "TagId é obrigatório.");

        EmpresaId = empresaId;
        PostoId = postoId;
        TagId = tagId;
    }
}
