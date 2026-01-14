using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class PostoDeTrabalho : Entity, IAggregateRoot
{
    // Foreign Keys
    public Guid CondominioId { get; private set; }

    // Atributos
    public TimeSpan HorarioInicio { get; private set; }
    public TimeSpan HorarioFim { get; private set; }
    public bool PermiteDobrarEscala { get; private set; }

    // Navigation Properties
    public Condominio? Condominio { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    // FASE 4: Propriedade calculada baseada no Condomínio
    /// <summary>
    /// Quantidade ideal de funcionários por posto.
    /// Calculado como: Total de funcionários do condomínio / Número de postos
    /// </summary>
    [NotMapped]
    public int QuantidadeIdealFuncionarios
    {
        get
        {
            if (Condominio == null)
                return 0; // Fallback para quando não há navegação carregada
            
            var totalPostos = Condominio.PostosDeTrabalho?.Count ?? 1;
            return totalPostos > 0 
                ? Condominio.QuantidadeFuncionariosIdeal / totalPostos 
                : 0;
        }
    }

    // Construtor vazio para o EF Core
    protected PostoDeTrabalho() { }

    // FASE 4: Construtor simplificado sem QuantidadeIdealFuncionarios
    public PostoDeTrabalho(
        Guid condominioId, 
        Guid empresaId, 
        TimeSpan inicio, 
        TimeSpan fim, 
        bool permiteDobrarEscala)
    {
        // Validações de negócio
        CheckRule(condominioId == Guid.Empty, "O Posto deve pertencer a um Condom��nio.");
        CheckRule(empresaId == Guid.Empty, "O Posto deve pertencer a uma Empresa.");
        
        // Calcula a duração do turno (considerando turnos que atravessam meia-noite)
        var duracao = fim > inicio 
            ? fim - inicio  // Turno normal: 6h às 18h = 12h
            : TimeSpan.FromHours(24) - (inicio - fim); // Turno noturno: 18h às 6h = 12h
        
        CheckRule(duracao != TimeSpan.FromHours(12), "O turno deve ter exatamente 12 horas de duração.");

        CondominioId = condominioId;
        EmpresaId = empresaId;
        HorarioInicio = inicio;
        HorarioFim = fim;
        PermiteDobrarEscala = permiteDobrarEscala;
    }

    // FASE 4: Método de atualização simplificado
    public void AtualizarHorario(TimeSpan inicio, TimeSpan fim, bool permiteDobrarEscala)
    {
        var duracao = fim > inicio 
            ? fim - inicio
            : TimeSpan.FromHours(24) - (inicio - fim);
        
        CheckRule(duracao != TimeSpan.FromHours(12), "O turno deve ter exatamente 12 horas de duração.");

        HorarioInicio = inicio;
        HorarioFim = fim;
        PermiteDobrarEscala = permiteDobrarEscala;
    }

    public int CapacidadeMaximaPorDobras => PermiteDobrarEscala ? QuantidadeIdealFuncionarios * 2 : QuantidadeIdealFuncionarios;
}
