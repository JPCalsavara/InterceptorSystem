using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public class AlocacaoDto
{
    public Guid Id { get; set; }
    public Guid PostoId { get; set; }
    public Guid ContratoId { get; set; }
    public TimeSpan HorarioInicio { get; set; }
    public TimeSpan HorarioFim { get; set; }
    public TipoEscala TipoEscala { get; set; }
    public bool PermiteDobrarEscala { get; set; }
    public bool TemHorarioNoturno { get; set; }

    public static AlocacaoDto FromEntity(Alocacao entity)
    {
        return new AlocacaoDto
        {
            Id = entity.Id,
            PostoId = entity.PostoId,
            ContratoId = entity.ContratoId,
            HorarioInicio = entity.HorarioInicio,
            HorarioFim = entity.HorarioFim,
            TipoEscala = entity.TipoEscala,
            PermiteDobrarEscala = entity.PermiteDobrarEscala,
            TemHorarioNoturno = entity.TemHorarioNoturno
        };
    }
}

public class CreateAlocacaoInput
{
    public Guid PostoId { get; set; }
    public Guid ContratoId { get; set; }
    public TimeSpan HorarioInicio { get; set; }
    public TimeSpan HorarioFim { get; set; }
    public TipoEscala TipoEscala { get; set; }
    public bool PermiteDobrarEscala { get; set; }
}

public class UpdateAlocacaoInput
{
    public TimeSpan HorarioInicio { get; set; }
    public TimeSpan HorarioFim { get; set; }
    public TipoEscala TipoEscala { get; set; }
    public bool PermiteDobrarEscala { get; set; }
}
