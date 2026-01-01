using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Funcionario : Entity, IAggregateRoot
{
    public Guid CondominioId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Cpf { get; private set; } = null!;
    public string Celular { get; private set; } = null!;
    public StatusFuncionario StatusFuncionario { get; private set; }
    public TipoEscala TipoEscala { get; private set; }
    public TipoFuncionario TipoFuncionario { get; private set; }
    public decimal SalarioMensal { get; private set; }
    public decimal ValorTotalBeneficiosMensal { get; private set; }
    public decimal ValorDiariasFixas { get; private set; }

    public Condominio? Condominio { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    protected Funcionario() { }

    public Funcionario(
        Guid empresaId,
        Guid condominioId,
        string nome,
        string cpf,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario,
        decimal salarioMensal,
        decimal valorTotalBeneficiosMensal,
        decimal valorDiariasFixas)
    {
        CheckRule(empresaId == Guid.Empty, "O funcionário deve pertencer a uma empresa.");
        CheckRule(condominioId == Guid.Empty, "O funcionário deve estar vinculado a um condomínio.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome do funcionário é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cpf), "CPF é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(celular), "Celular é obrigatório.");
        CheckRule(!Enum.IsDefined(statusFuncionario), "Status do funcionário é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoEscala), "Tipo de escala é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoFuncionario), "Tipo de funcionário é obrigatório.");
        CheckRule(salarioMensal < 0, "Salário não pode ser negativo.");
        CheckRule(valorTotalBeneficiosMensal < 0, "Benefícios não podem ser negativos.");
        CheckRule(valorDiariasFixas < 0, "Diárias não podem ser negativas.");

        EmpresaId = empresaId;
        CondominioId = condominioId;
        Nome = nome;
        Cpf = cpf;
        Celular = celular;
        StatusFuncionario = statusFuncionario;
        TipoEscala = tipoEscala;
        TipoFuncionario = tipoFuncionario;
        SalarioMensal = salarioMensal;
        ValorTotalBeneficiosMensal = valorTotalBeneficiosMensal;
        ValorDiariasFixas = valorDiariasFixas;
    }

    public void AtualizarDados(
        string nome,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario,
        decimal salarioMensal,
        decimal valorTotalBeneficiosMensal,
        decimal valorDiariasFixas)
    {
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome do funcionário é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(celular), "Celular é obrigatório.");
        CheckRule(!Enum.IsDefined(statusFuncionario), "Status do funcionário é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoEscala), "Tipo de escala é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoFuncionario), "Tipo de funcionário é obrigatório.");
        CheckRule(salarioMensal < 0, "Salário não pode ser negativo.");
        CheckRule(valorTotalBeneficiosMensal < 0, "Benefícios não podem ser negativos.");
        CheckRule(valorDiariasFixas < 0, "Diárias não podem ser negativas.");

        Nome = nome;
        Celular = celular;
        StatusFuncionario = statusFuncionario;
        TipoEscala = tipoEscala;
        TipoFuncionario = tipoFuncionario;
        SalarioMensal = salarioMensal;
        ValorTotalBeneficiosMensal = valorTotalBeneficiosMensal;
        ValorDiariasFixas = valorDiariasFixas;
    }
}
