namespace InterceptorSystem.Domain.SharedKernel;

/// <summary>
/// Record base para Domain Events. Todos os eventos de domínio devem estender esta classe.
/// Usar records garante imutabilidade e igualdade estrutural por padrão.
/// </summary>
public abstract record DomainEvent : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
