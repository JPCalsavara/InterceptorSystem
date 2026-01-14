using System.ComponentModel.DataAnnotations.Schema;

namespace InterceptorSystem.Domain.Common;

public abstract class Entity
{
    // O ID é gerado na instanciação, não no banco. Isso ajuda nos testes.
    public Guid Id { get; protected set; }

    // O "Cadeado" do SaaS. Define quem é o dono deste dado.
    public Guid EmpresaId { get; protected set; }

    public DateTime CreatedAt { get; private set; }
    
    // Suporte para Eventos de Domínio (ex: "FuncionarioCriadoEvent")
    private readonly List<object> _domainEvents = new();
    
    // Ignorado pelo ORM, usado apenas para transportar eventos até o SaveChanges
    [NotMapped]
    public IReadOnlyCollection<object> DomainEvents => _domainEvents.AsReadOnly();

    protected Entity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    public void AddDomainEvent(object domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
    
    // Helper para validações rápidas (Fail Fast)
    protected static void CheckRule(bool condition, string errorMessage)
    {
        if (condition) throw new InvalidOperationException(errorMessage);
        // Nota: Em produção, criaríamos uma classe DomainException específica.
    }
}