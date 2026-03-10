using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Posto : Entity, IAggregateRoot
{
    public Guid ClienteId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Endereco { get; private set; } = null!;
    public string Cidade { get; private set; } = null!;
    public string Estado { get; private set; } = null!;
    public bool Ativo { get; private set; }

    public Cliente? Cliente { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    protected Posto() { }

    public Posto(
        Guid clienteId,
        Guid empresaId,
        string nome,
        string endereco,
        string cidade,
        string estado)
    {
        CheckRule(clienteId == Guid.Empty, "O Posto deve pertencer a um Cliente.");
        CheckRule(empresaId == Guid.Empty, "O Posto deve pertencer a uma Empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        ClienteId = clienteId;
        EmpresaId = empresaId;
        Nome = nome;
        Endereco = endereco;
        Cidade = cidade;
        Estado = estado;
        Ativo = true;
    }

    public void AtualizarDetalhes(string nome, string endereco, string cidade, string estado)
    {
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        Nome = nome;
        Endereco = endereco;
        Cidade = cidade;
        Estado = estado;
    }

    public void Desativar()
    {
        Ativo = false;
    }
}
