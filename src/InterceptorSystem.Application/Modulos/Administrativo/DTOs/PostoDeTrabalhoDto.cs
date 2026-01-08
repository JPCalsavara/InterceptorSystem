using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

// FASE 4: CreatePostoInput sem QuantidadeIdealFuncionarios (calculado do Condomínio)
public record CreatePostoInput(
    Guid CondominioId, 
    TimeSpan HorarioInicio, 
    TimeSpan HorarioFim, 
    bool PermiteDobrarEscala = true, 
    int? QuantidadeMaximaFaltas = null);

// FASE 4: UpdatePostoInput sem QuantidadeIdealFuncionarios (calculado do Condomínio)
public record UpdatePostoInput(
    TimeSpan HorarioInicio, 
    TimeSpan HorarioFim, 
    bool PermiteDobrarEscala = true, 
    int? QuantidadeMaximaFaltas = null);

// Saída - QuantidadeIdealFuncionarios continua no output (propriedade calculada)
public record PostoDeTrabalhoDto(
    Guid Id, 
    Guid CondominioId, 
    string Horario, 
    int QuantidadeIdealFuncionarios, // Calculado automaticamente
    bool PermiteDobrarEscala, 
    int CapacidadeMaximaPorDobras,
    int? QuantidadeMaximaFaltas)
{
    public static PostoDeTrabalhoDto FromEntity(PostoDeTrabalho posto)
    {
        return new PostoDeTrabalhoDto(
            posto.Id,
            posto.CondominioId,
            $"{posto.HorarioInicio:hh\\:mm} - {posto.HorarioFim:hh\\:mm}",
            posto.QuantidadeIdealFuncionarios, // Propriedade calculada
            posto.PermiteDobrarEscala,
            posto.CapacidadeMaximaPorDobras,
            posto.QuantidadeMaximaFaltas
        );
    }
}
