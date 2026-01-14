using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Funcionario : Entity, IAggregateRoot
{
    public Guid CondominioId { get; private set; }
    public Guid ContratoId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Cpf { get; private set; } = null!;
    public string Celular { get; private set; } = null!;
    public StatusFuncionario StatusFuncionario { get; private set; }
    public TipoEscala TipoEscala { get; private set; }
    public TipoFuncionario TipoFuncionario { get; private set; }

    public Condominio? Condominio { get; private set; }
    public Contrato? Contrato { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    // FASE 3: Propriedades Calculadas (não persistem no banco)
    
    /// <summary>
    /// Salário base calculado automaticamente a partir do contrato
    /// </summary>
    [NotMapped]
    public decimal SalarioBase => Contrato?.CalcularSalarioBasePorFuncionario() ?? 0m;
    
    /// <summary>
    /// Adicional noturno (aplicado apenas para escala 12x36)
    /// </summary>
    [NotMapped]
    public decimal AdicionalNoturno => 
        (Contrato != null && TipoEscala == TipoEscala.DOZE_POR_TRINTA_SEIS) 
            ? Contrato.CalcularAdicionalNoturno(SalarioBase) 
            : 0m;
    
    /// <summary>
    /// Benefícios mensais calculados automaticamente
    /// </summary>
    [NotMapped]
    public decimal Beneficios => Contrato?.CalcularBeneficiosPorFuncionario() ?? 0m;
    
    /// <summary>
    /// Salário total = Salário Base + Adicional Noturno + Benefícios
    /// </summary>
    [NotMapped]
    public decimal SalarioTotal => SalarioBase + AdicionalNoturno + Beneficios;

    protected Funcionario() { }

    public Funcionario(
        Guid empresaId,
        Guid condominioId,
        Guid contratoId,
        string nome,
        string cpf,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario)
    {
        CheckRule(empresaId == Guid.Empty, "O funcionário deve pertencer a uma empresa.");
        CheckRule(condominioId == Guid.Empty, "O funcionário deve estar vinculado a um condomínio.");
        CheckRule(contratoId == Guid.Empty, "O funcionário deve estar vinculado a um contrato.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome do funcionário é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cpf), "CPF é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(celular), "Celular é obrigatório.");
        CheckRule(!Enum.IsDefined(statusFuncionario), "Status do funcionário é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoEscala), "Tipo de escala é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoFuncionario), "Tipo de funcionário é obrigatório.");

        EmpresaId = empresaId;
        CondominioId = condominioId;
        ContratoId = contratoId;
        Nome = nome;
        Cpf = cpf;
        Celular = celular;
        StatusFuncionario = statusFuncionario;
        TipoEscala = tipoEscala;
        TipoFuncionario = tipoFuncionario;
    }

    public void AtualizarDados(
        string nome,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario)
    {
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome do funcionário é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(celular), "Celular é obrigatório.");
        CheckRule(!Enum.IsDefined(statusFuncionario), "Status do funcionário é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoEscala), "Tipo de escala é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoFuncionario), "Tipo de funcionário é obrigatório.");

        Nome = nome;
        Celular = celular;
        StatusFuncionario = statusFuncionario;
        TipoEscala = tipoEscala;
        TipoFuncionario = tipoFuncionario;
    }
}
