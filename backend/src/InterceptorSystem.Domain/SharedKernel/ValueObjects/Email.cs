using System.Net.Mail;
using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel.ValueObjects;

public sealed record Email
{
    public string Valor { get; }

    private Email(string valor)
    {
        Valor = valor;
    }

    public static Email Criar(string email)
    {
        var normalized = (email ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalized))
            throw new DomainException("Email invalido.");

        try
        {
            var addr = new MailAddress(normalized);
            if (addr.Address != normalized)
                throw new DomainException("Email invalido.");
        }
        catch (DomainException)
        {
            throw;
        }
        catch
        {
            throw new DomainException("Email invalido.");
        }

        return new Email(normalized);
    }

    public static implicit operator string(Email email) => email.Valor;

    public override string ToString() => Valor;
}
