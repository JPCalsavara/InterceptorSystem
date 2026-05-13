using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel.ValueObjects;

public sealed record Telefone
{
    public string Valor { get; }

    private Telefone(string valor)
    {
        Valor = valor;
    }

    public static Telefone Criar(string telefone)
    {
        var digits = new string((telefone ?? string.Empty).Where(char.IsDigit).ToArray());

        // Compatibilidade com payloads legados que enviam codigo do pais (ex: +55)
        if (digits.Length == 13 && digits.StartsWith("55"))
        {
            digits = digits[2..];
        }

        if (digits.Length is not (10 or 11))
            throw new DomainException("Telefone invalido.");

        return new Telefone(digits);
    }

    public static implicit operator string(Telefone telefone) => telefone.Valor;

    public override string ToString() => Valor;
}
