namespace InterceptorSystem.Domain.SharedKernel.Exceptions;

/// <summary>
/// Exceção lançada pela Infrastructure quando uma entidade não pode ser removida
/// pois está referenciada por outras entidades (violação de FK).
/// Substitui a dependência do código da Application no código de erro PostgreSQL "23503".
/// </summary>
public class EntityInUseException : DomainException
{
    public EntityInUseException(string entityName)
        : base($"Não é possível remover '{entityName}' pois está vinculado a outros registros.") { }

    public EntityInUseException(string message, Exception innerException)
        : base(message, innerException) { }
}
