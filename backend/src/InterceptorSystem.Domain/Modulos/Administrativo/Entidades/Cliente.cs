using System.Collections.Generic;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Events;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Cliente : Entity, IAggregateRoot
{
    public string Nome { get; private set; } = null!;
    public string Cnpj { get; private set; } = null!;
    public string Cidade { get; private set; } = null!;
    public string Estado { get; private set; } = null!;  // UF, e.g. "SP"
    public bool Ativo { get; private set; }
    public string? EmailGestor { get; private set; }
    public string? TelefoneEmergencia { get; private set; }
    public int QuantidadeIdealPorTurno { get; private set; }
    public TimeOnly HorarioTrocaTurno { get; private set; }

    public ICollection<Posto> Postos { get; private set; } = new List<Posto>();
    public ICollection<Funcionario> Funcionarios { get; private set; } = new List<Funcionario>();
    public ICollection<Contrato> Contratos { get; private set; } = new List<Contrato>();

    // Construtor vazio para o EF Core
    protected Cliente() { }

    // Construtor Rico
    public Cliente(
        Guid empresaId, 
        string nome, 
        string cnpj,
        string cidade,
        string estado,
        int quantidadeIdealPorTurno = 2,
        TimeOnly? horarioTrocaTurno = null,
        string? emailGestor = null,
        string? telefoneEmergencia = null)
    {
        CheckRule(empresaId == Guid.Empty, "O Cliente deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "O nome do cliente é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cnpj), "O CNPJ do cliente é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cidade), "A cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(estado), "O estado é obrigatório.");
        CheckRule(quantidadeIdealPorTurno < 1 || quantidadeIdealPorTurno > 10, "Quantidade ideal por turno deve estar entre 1 e 10.");

        EmpresaId = empresaId;
        Nome = nome;
        Cnpj = cnpj;
        Cidade = cidade;
        Estado = estado;
        QuantidadeIdealPorTurno = quantidadeIdealPorTurno;
        HorarioTrocaTurno = horarioTrocaTurno ?? new TimeOnly(6, 0); // Default: 06:00
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
        Ativo = true;

        AddDomainEvent(new ClienteCreatedEvent(EmpresaId, Id));
    }

    public void AtualizarDados(
        string novoNome, string novoCnpj, string novaCidade, string novoEstado,
        int quantidadeIdealPorTurno, TimeOnly horarioTrocaTurno,
        string? emailGestor, string? telefoneEmergencia)
    {
        CheckRule(string.IsNullOrWhiteSpace(novoNome), "Nome é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(novoCnpj), "CNPJ é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(novaCidade), "A cidade é obrigatória.");
        CheckRule(string.IsNullOrWhiteSpace(novoEstado), "O estado é obrigatório.");
        CheckRule(quantidadeIdealPorTurno < 1 || quantidadeIdealPorTurno > 10, "Quantidade ideal por turno deve estar entre 1 e 10.");

        Nome = novoNome;
        Cnpj = novoCnpj;
        Cidade = novaCidade;
        Estado = novoEstado;
        QuantidadeIdealPorTurno = quantidadeIdealPorTurno;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;

        AddDomainEvent(new ClienteUpdatedEvent(EmpresaId, Id));
    }
    
    public void Desativar()
    {
        Ativo = false;

        AddDomainEvent(new ClienteDeletedEvent(EmpresaId, Id));
    }
}
