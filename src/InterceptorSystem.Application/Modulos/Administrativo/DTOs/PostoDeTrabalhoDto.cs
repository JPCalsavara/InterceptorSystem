using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

// FASE 4: CreatePostoInput sem QuantidadeIdealFuncionarios (calculado do Condomínio)
public record CreatePostoInput(
    Guid CondominioId, 
    TimeSpan HorarioInicio, 
    TimeSpan HorarioFim, 
    bool PermiteDobrarEscala = true);

// FASE 4: UpdatePostoInput sem QuantidadeIdealFuncionarios (calculado do Condomínio)
public record UpdatePostoInput(
    TimeSpan HorarioInicio, 
    TimeSpan HorarioFim, 
    bool PermiteDobrarEscala = true);

// Saída - QuantidadeIdealFuncionarios continua no output (propriedade calculada)
public record PostoDeTrabalhoDto(
    Guid Id, 
    Guid CondominioId,
    string HorarioInicio,              // FASE 5 - formato "HH:mm:ss"
    string HorarioFim,                 // FASE 5 - formato "HH:mm:ss"
    string Horario,                    // FASE 5 - formato "HH:mm - HH:mm" (display)
    int QuantidadeIdealFuncionarios,   // Calculado automaticamente
    bool PermiteDobrarEscala, 
    int CapacidadeMaximaPorDobras)
{
    public static PostoDeTrabalhoDto FromEntity(PostoDeTrabalho posto)
    {
        return new PostoDeTrabalhoDto(
            posto.Id,
            posto.CondominioId,
            posto.HorarioInicio.ToString(@"hh\:mm\:ss"),
            posto.HorarioFim.ToString(@"hh\:mm\:ss"),
            $"{posto.HorarioInicio:hh\\:mm} - {posto.HorarioFim:hh\\:mm}",
            posto.QuantidadeIdealFuncionarios, // Propriedade calculada
            posto.PermiteDobrarEscala,
            posto.CapacidadeMaximaPorDobras
        );
    }
}
