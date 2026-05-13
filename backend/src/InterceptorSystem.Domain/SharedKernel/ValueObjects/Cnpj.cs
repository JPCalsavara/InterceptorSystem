using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Domain.SharedKernel.ValueObjects;

public sealed record Cnpj
{
    public string Valor { get; }

    private Cnpj(string valor)
    {
        Valor = valor;
    }

    public static Cnpj Criar(string cnpj)
    {
        var normalized = Normalizar(cnpj);

        if (normalized.Length != 14)
            throw new DomainException("CNPJ invalido.");

        var raiz = normalized[..12];
        var dv = normalized[12..];

        if (!raiz.All(char.IsLetterOrDigit) || !dv.All(char.IsDigit))
            throw new DomainException("CNPJ invalido.");

        if (!EhValido(normalized))
            throw new DomainException("CNPJ invalido.");

        return new Cnpj(normalized);
    }

    public static implicit operator string(Cnpj cnpj) => cnpj.Valor;

    public override string ToString() => Valor;

    private static string Normalizar(string value)
    {
        return new string((value ?? string.Empty)
            .Where(char.IsLetterOrDigit)
            .Select(char.ToUpperInvariant)
            .ToArray());
    }

    private static bool EhValido(string value)
    {
        var baseChars = value[..12];
        var dv1 = CalcularDigito(baseChars, new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 });
        var dv2 = CalcularDigito(baseChars + dv1, new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 });

        return value[12] - '0' == dv1 && value[13] - '0' == dv2;
    }

    private static int CalcularDigito(string input, IReadOnlyList<int> pesos)
    {
        var soma = 0;
        for (var i = 0; i < input.Length; i++)
        {
            soma += ValorCnpj(input[i]) * pesos[i];
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static int ValorCnpj(char c)
    {
        if (char.IsDigit(c))
        {
            return c - '0';
        }

        if (c is >= 'A' and <= 'Z')
        {
            // Regra alfanumerica: letras convertem por tabela ASCII ajustada (A=17, B=18...).
            return c - 48;
        }

        throw new DomainException("CNPJ invalido.");
    }

}
