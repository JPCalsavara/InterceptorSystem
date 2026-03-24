using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Events;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Funcionario : Entity, IAggregateRoot
{
    public Guid? ClienteId { get; private set; }
    public Guid ContratoId { get; private set; }
    public string Nome { get; private set; } = null!;
    public string Cpf { get; private set; } = null!;
    public string Celular { get; private set; } = null!;
    public StatusFuncionario StatusFuncionario { get; private set; }
    public TipoEscala TipoEscala { get; private set; }
    public TipoFuncionario TipoFuncionario { get; private set; }

    public Cliente? Cliente { get; private set; }
    public Contrato? Contrato { get; private set; }
    public ICollection<Diaria> Diarias { get; private set; } = new List<Diaria>();

    // Phase 4: employee role tags
    public ICollection<FuncionarioTag> Tags { get; private set; } = new List<FuncionarioTag>();

    /// <summary>
    /// Custo mensal real baseado na soma das Diárias confirmadas do mês corrente + Benefícios.
    /// Phase 4: substitui SalarioBase calculado pelo contrato.
    /// </summary>
    [NotMapped]
    public decimal CustoMensalReal
    {
        get
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);
            var valorDiarias = Diarias
                .Where(d => d.StatusDiaria == StatusDiaria.CONFIRMADA &&
                            d.Data.Year == hoje.Year &&
                            d.Data.Month == hoje.Month)
                .Sum(d => d.ValorDiaria);

            return valorDiarias + (Contrato?.CalcularBeneficiosPorFuncionario() ?? 0m);
        }
    }

    /// <summary>
    /// Custo mensal estimado: usa o maior ValorDiaria configurado no contrato
    /// dentre as tags atribuídas ao funcionário × 30 dias + Benefícios.
    /// Fallback quando não há diárias confirmadas no mês.
    /// </summary>
    [NotMapped]
    public decimal CustoMensalEstimado
    {
        get
        {
            if (Contrato == null)
                return 0m;

            var funcionarioTagIds = Tags
                .Select(ft => ft.TagId)
                .ToHashSet();

            var valorDiaria = Contrato.Tags
                .Where(ct => funcionarioTagIds.Contains(ct.TagId))
                .Select(ct => ct.ValorDiaria)
                .DefaultIfEmpty(Contrato.ValorDiariaVigilante ?? 0m)
                .Max();

            return Math.Round(valorDiaria * 30, 2) + Contrato.CalcularBeneficiosPorFuncionario();
        }
    }

    protected Funcionario() { }

    public Funcionario(
        Guid empresaId,
        Guid? clienteId,
        Guid contratoId,
        string nome,
        string cpf,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario)
    {
        CheckRule(empresaId == Guid.Empty, "O funcionário deve pertencer a uma empresa.");
        CheckRule(contratoId == Guid.Empty, "O funcionário deve estar vinculado a um contrato.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "Nome do funcionário é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cpf), "CPF é obrigatório.");
        CheckRule(!ValidarFormatoCpf(cpf), "CPF deve conter exatamente 11 dígitos numéricos.");
        CheckRule(string.IsNullOrWhiteSpace(celular), "Celular é obrigatório.");
        CheckRule(!Enum.IsDefined(statusFuncionario), "Status do funcionário é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoEscala), "Tipo de escala é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoFuncionario), "Tipo de funcionário é obrigatório.");

        EmpresaId = empresaId;
        ClienteId = clienteId;
        ContratoId = contratoId;
        Nome = nome;
        Cpf = ExtrairDigitos(cpf);
        Celular = celular;
        StatusFuncionario = statusFuncionario;
        TipoEscala = tipoEscala;
        TipoFuncionario = tipoFuncionario;

        AddDomainEvent(new FuncionarioCreatedEvent(EmpresaId, Id, ClienteId));
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

        AddDomainEvent(new FuncionarioUpdatedEvent(EmpresaId, Id, ClienteId));
    }

    /// <summary>
    /// Replaces the full tag set. Phase 4.
    /// </summary>
    public void DefinirTags(IEnumerable<FuncionarioTag> novasTags)
    {
        Tags.Clear();
        foreach (var tag in novasTags)
            Tags.Add(tag);

        AddDomainEvent(new FuncionarioUpdatedEvent(EmpresaId, Id, ClienteId));
    }

    public void PrepararExclusao()
    {
        AddDomainEvent(new FuncionarioDeletedEvent(EmpresaId, Id, ClienteId));
    }

    /// <summary>
    /// Valida o formato do CPF (11 dígitos numéricos após remoção de máscara).
    /// </summary>
    private static bool ValidarFormatoCpf(string cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf)) return false;
        var digitos = ExtrairDigitos(cpf);
        return digitos.Length == 11;
    }

    /// <summary>
    /// Extrai apenas os dígitos numéricos de uma string (remove pontos, traços, barras).
    /// </summary>
    private static string ExtrairDigitos(string valor)
    {
        return new string(valor.Where(char.IsDigit).ToArray());
    }
}
