using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

// Entrada - Criar
public record CreatePostoInput(Guid CondominioId, TimeSpan HorarioInicio, TimeSpan HorarioFim, int QuantidadeIdealFuncionarios, bool PermiteDobrarEscala = true, int? CapacidadeMaximaExtraPorTerceiros = null);

// Entrada - Atualizar
public record UpdatePostoInput(TimeSpan HorarioInicio, TimeSpan HorarioFim, int QuantidadeIdealFuncionarios, bool PermiteDobrarEscala = true, int? CapacidadeMaximaExtraPorTerceiros = null);

// Saída
public record PostoDeTrabalhoDto(Guid Id, Guid CondominioId, string Horario, int QuantidadeIdealFuncionarios, bool PermiteDobrarEscala, int CapacidadeMaximaPorDobras)
{
    public static PostoDeTrabalhoDto FromEntity(PostoDeTrabalho posto)
    {
        return new PostoDeTrabalhoDto(
            posto.Id,
            posto.CondominioId,
            $"{posto.HorarioInicio:hh\\:mm} - {posto.HorarioFim:hh\\:mm}",
            posto.QuantidadeIdealFuncionarios,
            posto.PermiteDobrarEscala,
            posto.CapacidadeMaximaPorDobras
        );
    }
}
