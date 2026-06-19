using InterceptorSystem.Domain.SharedKernel;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.SharedKernel.ValueObjects;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Events;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

public class Posto : Entity, IAggregateRoot
{
    public Guid ContratoId { get; private set; }
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
    public Contrato? Contrato { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    protected Posto() { }

    public Posto(
        Guid empresaId,
        Guid clienteId,
        Guid contratoId,
        string nome,
        string cep,
        string endereco,
        string numero,
        string? complemento,
        string cidade,
        string estado)
    {
        EmpresaId = empresaId;
        Enforce(clienteId != Guid.Empty, "O Posto deve pertencer a um Cliente.");
        Enforce(contratoId != Guid.Empty, "O Posto deve pertencer a um Contrato.");
        Enforce(!string.IsNullOrWhiteSpace(nome), "Nome é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cep), "CEP é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(endereco), "Endereço é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(numero), "Número é obrigatório.");
        Enforce(!string.IsNullOrWhiteSpace(cidade), "Cidade é obrigatória.");
        Enforce(!string.IsNullOrWhiteSpace(estado), "Estado é obrigatório.");

        ClienteId = clienteId;
        ContratoId = contratoId;
        Nome = nome.Trim();
        Cep = Cep.Criar(cep);
        Endereco = endereco.Trim();
        Numero = numero.Trim();
        Complemento = string.IsNullOrWhiteSpace(complemento) ? null : complemento.Trim();
        Cidade = cidade.Trim();
        Estado = estado.Trim().ToUpperInvariant();
        Ativo = true;

        AddDomainEvent(new PostoCreatedEvent(EmpresaId, Id, ClienteId, ContratoId));
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

        AddDomainEvent(new PostoUpdatedEvent(EmpresaId, Id, ClienteId, ContratoId));
    }

    public void Desativar()
    {
        Ativo = false;
        AddDomainEvent(new PostoDeletedEvent(EmpresaId, Id, ClienteId, ContratoId));
    }
}
