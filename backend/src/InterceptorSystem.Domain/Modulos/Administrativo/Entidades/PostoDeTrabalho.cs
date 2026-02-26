using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class PostoDeTrabalho : Entity, IAggregateRoot
{
    // Foreign Keys
    public Guid CondominioId { get; private set; }
    public Guid ContratoId { get; private set; }

    // Atributos
    public TimeSpan HorarioInicio { get; private set; }
    public TimeSpan HorarioFim { get; private set; }
    public bool PermiteDobrarEscala { get; private set; }

    // Navigation Properties
    public Condominio? Condominio { get; private set; }
    public Contrato? Contrato { get; private set; }
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    // FASE 4: Propriedade calculada baseada no Condomínio
    /// <summary>
    /// Quantidade ideal de funcionários por posto de trabalho.
    /// Vem diretamente da configuração operacional do Condomínio.
    /// Exemplo: 6 funcionários por turno (definido no cadastro do condomínio).
    /// </summary>
    [NotMapped]
    public int QuantidadeIdealFuncionarios
    {
        get
        {
            if (Condominio == null)
                return 0; // Fallback para quando não há navegação carregada
            
            return Condominio.QuantidadeIdealPorTurno;
        }
    }

    /// <summary>
    /// Verifica se o posto de trabalho tem jornada noturna.
    /// Segundo CLT Art. 73: Adicional noturno é devido para trabalho entre 22h e 5h (urbano).
    /// Retorna true se o turno PASSA PELO período noturno (contém horas entre 22h e 5h).
    /// 
    /// Exemplos:
    /// - 6h às 18h: FALSE (completamente diurno)
    /// - 18h às 6h: TRUE (passa por 22h-5h)
    /// - 22h às 10h: TRUE (passa por 22h-5h)
    /// - 0h às 12h: TRUE (passa por 0h-5h)
    /// </summary>
    [NotMapped]
    public bool TemHorarioNoturno
    {
        get
        {
            // Horário noturno CLT: 22h às 5h do dia seguinte
            var inicioNoturno = new TimeSpan(22, 0, 0); // 22h
            var fimNoturno = new TimeSpan(5, 0, 0);     // 5h

            // Caso 1: Turno atravessa meia-noite (HorarioInicio > HorarioFim)
            // Exemplos: 18h às 6h, 22h às 10h
            // Qualquer turno que atravessa meia-noite SEMPRE passa por alguma hora entre 22h e 5h
            if (HorarioInicio > HorarioFim)
                return true;
            
            // Caso 2: Turno no mesmo dia (HorarioInicio <= HorarioFim)
            
            // 2.1: Turno começa às 22h ou depois (período noturno da noite)
            // Ex: 22h às 23h59, 23h às 23h30
            if (HorarioInicio >= inicioNoturno)
                return true;
            
            // 2.2: Turno começa antes das 5h (período noturno da madrugada)
            // Ex: 0h às 12h, 2h às 14h, 4h às 16h
            if (HorarioInicio < fimNoturno)
                return true;
            
            // 2.3: Turno termina depois das 22h (entra no período noturno no final)
            // Ex: 10h às 22h, 14h às 23h
            if (HorarioFim > inicioNoturno)
                return true;
            
            // Caso contrário: turno completamente diurno
            // Ex: 6h às 18h, 8h às 20h, 5h às 22h
            return false;
        }
    }

    // Construtor vazio para o EF Core
    protected PostoDeTrabalho() { }

    // FASE 4: Construtor simplificado sem QuantidadeIdealFuncionarios
    public PostoDeTrabalho(
        Guid condominioId,
        Guid empresaId,
        Guid contratoId,
        TimeSpan inicio,
        TimeSpan fim,
        bool permiteDobrarEscala)
    {
        // Validações de negócio
        CheckRule(condominioId == Guid.Empty, "O Posto deve pertencer a um Condomínio.");
        CheckRule(empresaId == Guid.Empty, "O Posto deve pertencer a uma Empresa.");
        CheckRule(contratoId == Guid.Empty, "O Posto deve estar vinculado a um Contrato.");

        // Calcula a duração do turno (considerando turnos que atravessam meia-noite)
        var duracao = fim > inicio
            ? fim - inicio  // Turno normal: 6h às 18h = 12h
            : TimeSpan.FromHours(24) - (inicio - fim); // Turno noturno: 18h às 6h = 12h

        CheckRule(duracao != TimeSpan.FromHours(12), "O turno deve ter exatamente 12 horas de duração.");

        CondominioId = condominioId;
        EmpresaId = empresaId;
        ContratoId = contratoId;
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
