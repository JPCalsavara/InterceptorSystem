using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel.ValueObjects;

public sealed record Cpf
{
    public string Valor { get; }

    private Cpf(string valor)
    {
        Valor = valor;
    }

    public static Cpf Criar(string cpf)
    {
        var digits = ApenasDigitos(cpf);
        if (digits.Length != 11 || TodosDigitosIguais(digits) || !EhValido(digits))
            throw new DomainException("CPF invalido.");

        return new Cpf(digits);
    }

    public static implicit operator string(Cpf cpf) => cpf.Valor;

    public override string ToString() => Valor;

    private static string ApenasDigitos(string value)
    {
        return new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
    }

    private static bool TodosDigitosIguais(string value)
    {
        return value.Distinct().Count() == 1;
    }

    private static bool EhValido(string digits)
    {
        var first = CalcularDigito(digits[..9], new[] { 10, 9, 8, 7, 6, 5, 4, 3, 2 });
        var second = CalcularDigito(digits[..10], new[] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 });

        return digits[9] - '0' == first && digits[10] - '0' == second;
    }

    private static int CalcularDigito(string input, IReadOnlyList<int> pesos)
    {
        var soma = 0;
        for (var i = 0; i < input.Length; i++)
        {
            soma += (input[i] - '0') * pesos[i];
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

}
