using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel;

public abstract class Entity
{
    // O ID é gerado na instanciação, não no banco. Isso ajuda nos testes.
    public Guid Id { get; protected set; }

    // O "Cadeado" do SaaS. Define quem é o dono deste dado.
    public Guid EmpresaId { get; protected set; }

    public DateTime CreatedAt { get; private set; }

    // Domain Events: transportam notificações até o CommitAsync (ignorado pelo ORM via DbContext config)
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected Entity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    /// <summary>
    /// Aplica uma regra de negócio (Fail Fast). Lança DomainException quando a condição é falsa.
    /// Uso: Enforce(nome.Length > 0, "Nome é obrigatório.");
    /// </summary>
    protected static void Enforce(bool isValid, string errorMessage)
    {
        if (!isValid) throw new DomainException(errorMessage);
    }
}
