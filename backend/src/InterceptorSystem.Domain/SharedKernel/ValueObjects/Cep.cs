using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel.ValueObjects;

public sealed record Cep
{
    public string Valor { get; }

    private Cep(string valor)
    {
        Valor = valor;
    }

    public static Cep Criar(string cep)
    {
        var digits = new string((cep ?? string.Empty).Where(char.IsDigit).ToArray());
        if (digits.Length != 8)
            throw new DomainException("CEP invalido.");

        return new Cep(digits);
    }

    public static implicit operator string(Cep cep) => cep.Valor;

    public override string ToString() => Valor;
}
