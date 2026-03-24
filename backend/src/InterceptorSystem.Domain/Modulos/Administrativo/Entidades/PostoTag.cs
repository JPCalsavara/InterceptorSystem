using InterceptorSystem.Domain.Common;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

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
        CheckRule(empresaId == Guid.Empty, "EmpresaId é obrigatório.");
        CheckRule(postoId == Guid.Empty, "PostoId é obrigatório.");
        CheckRule(tagId == Guid.Empty, "TagId é obrigatório.");

        EmpresaId = empresaId;
        PostoId = postoId;
        TagId = tagId;
    }
}
