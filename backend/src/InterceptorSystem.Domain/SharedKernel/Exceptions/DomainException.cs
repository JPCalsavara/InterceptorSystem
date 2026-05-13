namespace InterceptorSystem.Domain.SharedKernel.Exceptions;

/// <summary>
/// Exceção base para violações de regras de negócio no domínio.
/// Usada em substituição a InvalidOperationException nas entidades.
/// </summary>
public class DomainException : Exception
{
    // Optional code that can be used by middleware/clients to classify errors
    public string? ErrorCode { get; }

    public DomainException(string message, string? errorCode = null) : base(message) 
    { 
        ErrorCode = errorCode;
    }

    public DomainException(string message, Exception innerException, string? errorCode = null) : base(message, innerException) 
    {
        ErrorCode = errorCode;
    }
}
