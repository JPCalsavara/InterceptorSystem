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
    /// <summary>
    /// Quantidade ideal de funcionários por turno/posto de trabalho.
    /// </summary>
    public int QuantidadeIdealPorTurno { get; private set; }
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
        int quantidadeIdealPorTurno,
        TimeSpan horarioTrocaTurno,
        string? emailGestor = null,
        string? telefoneEmergencia = null)
    {
        CheckRule(empresaId == Guid.Empty, "O Condomínio deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "O nome do condomínio é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cnpj), "O CNPJ é obrigatório.");
        CheckRule(!ValidarFormatoCnpj(cnpj), "CNPJ deve conter exatamente 14 dígitos numéricos.");
        CheckRule(quantidadeIdealPorTurno <= 0, "Quantidade ideal por turno deve ser maior que zero.");

        EmpresaId = empresaId;
        Nome = nome;
        Cnpj = ExtrairDigitos(cnpj);
        Endereco = endereco;
        QuantidadeIdealPorTurno = quantidadeIdealPorTurno;
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
        int quantidadeIdealPorTurno,
        TimeSpan horarioTrocaTurno,
        string? emailGestor,
        string? telefoneEmergencia)
    {
        CheckRule(quantidadeIdealPorTurno <= 0, "Quantidade ideal por turno deve ser maior que zero.");
        
        QuantidadeIdealPorTurno = quantidadeIdealPorTurno;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
    }
    
    public void Desativar()
    {
        Ativo = false;
    }

    /// <summary>
    /// Valida o formato do CNPJ (14 dígitos numéricos após remoção de máscara).
    /// </summary>
    private static bool ValidarFormatoCnpj(string cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj)) return false;
        var digitos = ExtrairDigitos(cnpj);
        return digitos.Length == 14;
    }

    /// <summary>
    /// Extrai apenas os dígitos numéricos de uma string.
    /// </summary>
    private static string ExtrairDigitos(string valor)
    {
        return new string(valor.Where(char.IsDigit).ToArray());
    }
}
