using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Posto : Entity, IAggregateRoot
{
    public Guid ClienteId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Cep { get; private set; } = null!;
    public string Endereco { get; private set; } = null!;
    public string Numero { get; private set; } = null!;
    public string? Complemento { get; private set; }
    public string Cidade { get; private set; } = null!;
    public string Estado { get; private set; } = null!;
    public bool Ativo { get; private set; }

    public Cliente? Cliente { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();
    public ICollection<PostoTag> Tags { get; private set; } = new List<PostoTag>();

    protected Posto() { }

    public Posto(
        Guid clienteId,
        Guid empresaId,
        string nome,
        string cep,
        string endereco,
        string numero,
        string? complemento,
        string cidade,
        string estado)
    {
        CheckRule(clienteId == Guid.Empty, "O Posto deve pertencer a um Cliente.");
        CheckRule(empresaId == Guid.Empty, "O Posto deve pertencer a uma Empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cep), "CEP é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(numero), "Número é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        var normalizedCep = NormalizeCep(cep);
        CheckRule(normalizedCep.Length != 8, "CEP deve conter 8 dígitos.");

        ClienteId = clienteId;
        EmpresaId = empresaId;
        Nome = nome.Trim();
        Cep = normalizedCep;
        Endereco = endereco.Trim();
        Numero = numero.Trim();
        Complemento = string.IsNullOrWhiteSpace(complemento) ? null : complemento.Trim();
        Cidade = cidade.Trim();
        Estado = estado.Trim().ToUpperInvariant();
        Ativo = true;
    }

    public void AtualizarDetalhes(
        string nome,
        string cep,
        string endereco,
        string numero,
        string? complemento,
        string cidade,
        string estado)
    {
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cep), "CEP é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(numero), "Número é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        var normalizedCep = NormalizeCep(cep);
        CheckRule(normalizedCep.Length != 8, "CEP deve conter 8 dígitos.");

        Nome = nome.Trim();
        Cep = normalizedCep;
        Endereco = endereco.Trim();
        Numero = numero.Trim();
        Complemento = string.IsNullOrWhiteSpace(complemento) ? null : complemento.Trim();
        Cidade = cidade.Trim();
        Estado = estado.Trim().ToUpperInvariant();
    }

    public void Desativar()
    {
        Ativo = false;
    }

    public void DefinirTags(IEnumerable<PostoTag> novasTags)
    {
        Tags.Clear();
        foreach (var tag in novasTags)
            Tags.Add(tag);
    }

    private static string NormalizeCep(string cep)
    {
        return new string(cep.Where(char.IsDigit).ToArray());
    }
}
