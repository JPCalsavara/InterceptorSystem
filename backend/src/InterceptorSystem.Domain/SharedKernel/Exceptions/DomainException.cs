namespace InterceptorSystem.Domain.SharedKernel.Exceptions;

/// <summary>
/// Exceção base para violações de regras de negócio no domínio.
/// Usada em substituição a InvalidOperationException nas entidades.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException) : base(message, innerException) { }
}
