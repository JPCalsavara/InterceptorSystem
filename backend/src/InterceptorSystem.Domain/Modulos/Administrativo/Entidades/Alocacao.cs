using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Modulos.Administrativo.Events;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Alocacao : Entity, IAggregateRoot
{
    public Guid PostoId { get; private set; }
    public Guid ContratoId { get; private set; }
    public TimeSpan HorarioInicio { get; private set; }
    public TimeSpan HorarioFim { get; private set; }
    public TipoEscala TipoEscala { get; private set; }
    public bool PermiteDobrarEscala { get; private set; }

    [NotMapped]
    public bool TemHorarioNoturno
    {
        get
        {
            var inicioNoturno = new TimeSpan(22, 0, 0); 
            var fimNoturno = new TimeSpan(5, 0, 0);     

            if (HorarioInicio > HorarioFim)
                return true;
            if (HorarioInicio >= inicioNoturno)
                return true;
            if (HorarioInicio < fimNoturno)
                return true;
            if (HorarioFim > inicioNoturno)
                return true;

            return false;
        }
    }

    public Posto? Posto { get; private set; }
    public Contrato? Contrato { get; private set; }
    public ICollection<Diaria> Diarias { get; private set; } = new List<Diaria>();

    protected Alocacao() { }

    public Alocacao(
        Guid postoId,
        Guid contratoId,
        Guid empresaId,
        TimeSpan horarioInicio,
        TimeSpan horarioFim,
        TipoEscala tipoEscala,
        bool permiteDobrarEscala)
    {
        CheckRule(postoId == Guid.Empty, "PostoId é obrigatório");
        CheckRule(contratoId == Guid.Empty, "ContratoId é obrigatório");
        CheckRule(empresaId == Guid.Empty, "EmpresaId é obrigatório");

        var duracao = horarioFim > horarioInicio 
            ? horarioFim - horarioInicio
            : TimeSpan.FromHours(24) - (horarioInicio - horarioFim);
        
        CheckRule(duracao < TimeSpan.FromHours(4) || duracao > TimeSpan.FromHours(12), "O turno deve ter entre 4 e 12 horas de duração.");

        PostoId = postoId;
        ContratoId = contratoId;
        EmpresaId = empresaId;
        HorarioInicio = horarioInicio;
        HorarioFim = horarioFim;
        TipoEscala = tipoEscala;
        PermiteDobrarEscala = permiteDobrarEscala;

        AddDomainEvent(new AlocacaoCreatedEvent(EmpresaId, Id));
    }

    public void AtualizarHorario(TimeSpan inicio, TimeSpan fim, TipoEscala tipoEscala, bool permiteDobrarEscala)
    {
        var duracao = fim > inicio 
            ? fim - inicio
            : TimeSpan.FromHours(24) - (inicio - fim);
        
        CheckRule(duracao < TimeSpan.FromHours(4) || duracao > TimeSpan.FromHours(12), "O turno deve ter entre 4 e 12 horas de duração.");

        HorarioInicio = inicio;
        HorarioFim = fim;
        TipoEscala = tipoEscala;
        PermiteDobrarEscala = permiteDobrarEscala;

        AddDomainEvent(new AlocacaoUpdatedEvent(EmpresaId, Id));
    }

    public void PrepararExclusao()
    {
        AddDomainEvent(new AlocacaoDeletedEvent(EmpresaId, Id));
    }
}
