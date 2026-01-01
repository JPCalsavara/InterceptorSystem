namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateAlocacaoDtoInput(
    Guid FuncionarioId,
    Guid PostoDeTrabalhoId,
    DateOnly Data,
    string StatusAlocacao,
    string TipoAlocacao);

public record UpdateAlocacaoDtoInput(
    string StatusAlocacao,
    string TipoAlocacao);

public record AlocacaoDtoOutput(
    Guid Id,
    Guid FuncionarioId,
    Guid PostoDeTrabalhoId,
    DateOnly Data,
    string StatusAlocacao,
    string TipoAlocacao)
{
    public static AlocacaoDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Alocacao entity)
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

