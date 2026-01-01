using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateAlocacaoDtoInput(
    Guid FuncionarioId,
    Guid PostoDeTrabalhoId,
    DateOnly Data,
    StatusAlocacao StatusAlocacao,
    TipoAlocacao TipoAlocacao);

public record UpdateAlocacaoDtoInput(
    StatusAlocacao StatusAlocacao,
    TipoAlocacao TipoAlocacao);

public record AlocacaoDtoOutput(
    Guid Id,
    Guid FuncionarioId,
    Guid PostoDeTrabalhoId,
    DateOnly Data,
    StatusAlocacao StatusAlocacao,
    TipoAlocacao TipoAlocacao)
{
    public static AlocacaoDtoOutput? FromEntity(Alocacao? entity)
    {
        if (entity == null) return null;
        return new AlocacaoDtoOutput(
            entity.Id,
            entity.FuncionarioId,
            entity.PostoDeTrabalhoId,
            entity.Data,
            entity.StatusAlocacao,
            entity.TipoAlocacao);
    }
}
