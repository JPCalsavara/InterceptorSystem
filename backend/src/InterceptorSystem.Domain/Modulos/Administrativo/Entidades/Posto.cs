using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Common.ValueObjects;
using InterceptorSystem.Domain.Modulos.Administrativo.Events;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Posto : Entity, IAggregateRoot
{
    public Guid ClienteId { get; private set; }
    public string Nome { get; private set; } = null!;
    public Cep Cep { get; private set; } = null!;
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
        Enforce(clienteId != Guid.Empty, "O Posto deve pertencer a um Cliente.");
        Enforce(empresaId != Guid.Empty, "O Posto deve pertencer a uma Empresa.");
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cep), "CEP é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(numero), "Número é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        Enforce(!string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        ClienteId = clienteId;
        EmpresaId = empresaId;
        Nome = nome.Trim();
        Cep = Cep.Criar(cep);
        Endereco = endereco.Trim();
        Numero = numero.Trim();
        Complemento = string.IsNullOrWhiteSpace(complemento) ? null : complemento.Trim();
        Cidade = cidade.Trim();
        Estado = estado.Trim().ToUpperInvariant();
        Ativo = true;

        AddDomainEvent(new PostoCreatedEvent(EmpresaId, Id, ClienteId));
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
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cep), "CEP é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(numero), "Número é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        Enforce(!string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        Nome = nome.Trim();
        Cep = Cep.Criar(cep);
        Endereco = endereco.Trim();
        Numero = numero.Trim();
        Complemento = string.IsNullOrWhiteSpace(complemento) ? null : complemento.Trim();
        Cidade = cidade.Trim();
        Estado = estado.Trim().ToUpperInvariant();

        AddDomainEvent(new PostoUpdatedEvent(EmpresaId, Id, ClienteId));
    }

    public void Desativar()
    {
        Ativo = false;
        AddDomainEvent(new PostoDeletedEvent(EmpresaId, Id, ClienteId));
    }

    public void DefinirTags(IEnumerable<PostoTag> novasTags)
    {
        Tags.Clear();
        foreach (var tag in novasTags)
            Tags.Add(tag);

        AddDomainEvent(new PostoUpdatedEvent(EmpresaId, Id, ClienteId));
    }
}
