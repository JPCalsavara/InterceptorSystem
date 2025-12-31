using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

// Entrada - Criar
public record CreatePostoInput(Guid CondominioId, TimeSpan HorarioInicio, TimeSpan HorarioFim);

// Entrada - Atualizar
public record UpdatePostoInput(TimeSpan HorarioInicio, TimeSpan HorarioFim);

// Saída
public record PostoDeTrabalhoDto(Guid Id, Guid CondominioId, string Horario)
{
    public static PostoDeTrabalhoDto FromEntity(PostoDeTrabalho posto)
    {
        return new PostoDeTrabalhoDto(
            posto.Id,
            posto.CondominioId,
            $"{posto.HorarioInicio:hh\\:mm} - {posto.HorarioFim:hh\\:mm}"
        );
    }
}

