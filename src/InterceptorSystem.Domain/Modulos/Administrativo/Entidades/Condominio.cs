using System.Collections.Generic;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Condominio : Entity, IAggregateRoot
{
    public string Nome { get; private set; } = null!;
    public string Cnpj { get; private set; } = null!;
    public string Endereco { get; private set; } = null!;
    public bool Ativo { get; private set; }
    
    // Configurações Operacionais - FASE 1
    public int QuantidadeFuncionariosIdeal { get; private set; }
    public TimeSpan HorarioTrocaTurno { get; private set; }
    public string? EmailGestor { get; private set; }
    public string? TelefoneEmergencia { get; private set; }

    public ICollection<PostoDeTrabalho> PostosDeTrabalho { get; private set; } = new List<PostoDeTrabalho>();
    public ICollection<Funcionario> Funcionarios { get; private set; } = new List<Funcionario>();
    public ICollection<Contrato> Contratos { get; private set; } = new List<Contrato>();

    // Construtor vazio para o EF Core
    protected Condominio() { }

    // Construtor Rico
    public Condominio(
        Guid empresaId, 
        string nome, 
        string cnpj, 
        string endereco,
        int quantidadeFuncionariosIdeal,
        TimeSpan horarioTrocaTurno,
        string? emailGestor = null,
        string? telefoneEmergencia = null)
    {
        CheckRule(empresaId == Guid.Empty, "O Condomínio deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "O nome do condomínio é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cnpj), "O CNPJ é obrigatório.");
        CheckRule(quantidadeFuncionariosIdeal <= 0, "Quantidade de funcionários deve ser maior que zero.");

        EmpresaId = empresaId;
        Nome = nome;
        Cnpj = cnpj;
        Endereco = endereco;
        QuantidadeFuncionariosIdeal = quantidadeFuncionariosIdeal;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
        Ativo = true;
    }

    public void AtualizarDados(string novoNome, string novoEndereco)
    {
        CheckRule(string.IsNullOrWhiteSpace(novoNome), "Nome é obrigatório.");
        Nome = novoNome;
        Endereco = novoEndereco;
    }
    
    public void AtualizarConfiguracoesOperacionais(
        int quantidadeFuncionariosIdeal,
        TimeSpan horarioTrocaTurno,
        string? emailGestor,
        string? telefoneEmergencia)
    {
        CheckRule(quantidadeFuncionariosIdeal <= 0, "Quantidade de funcionários deve ser maior que zero.");
        
        QuantidadeFuncionariosIdeal = quantidadeFuncionariosIdeal;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
    }
    
    public void Desativar()
    {
        Ativo = false;
    }
}
