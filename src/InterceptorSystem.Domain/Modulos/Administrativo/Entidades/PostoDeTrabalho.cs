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

    // Navigation Properties
    public Condominio? Condominio { get; private set; }

    // Construtor vazio para o EF Core
    protected PostoDeTrabalho() { }

    // Construtor rico com validações
    public PostoDeTrabalho(Guid condominioId, Guid empresaId, TimeSpan inicio, TimeSpan fim)
    {
        // Validações de negócio
        CheckRule(condominioId == Guid.Empty, "O Posto deve pertencer a um Condomínio.");
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
    }

    // Métodos de negócio
    public void AtualizarHorario(TimeSpan inicio, TimeSpan fim)
    {
        var duracao = fim > inicio 
            ? fim - inicio
            : TimeSpan.FromHours(24) - (inicio - fim);
        
        CheckRule(duracao != TimeSpan.FromHours(12), "O turno deve ter exatamente 12 horas de duração.");

        HorarioInicio = inicio;
        HorarioFim = fim;
    }
}

