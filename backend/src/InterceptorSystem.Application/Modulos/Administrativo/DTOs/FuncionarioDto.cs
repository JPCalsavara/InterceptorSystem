using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateFuncionarioDtoInput(
    Guid? ClienteId,
    Guid ContratoId,
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    // Phase 4: optional tag IDs to assign on creation
    IReadOnlyList<Guid>? TagIds = null);

public record UpdateFuncionarioDtoInput(
    string Nome,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    // Phase 4: full replacement of tag set (null = no change)
    IReadOnlyList<Guid>? TagIds = null);

public record FuncionarioDtoOutput(
    Guid Id,
    Guid? ClienteId,
    Guid ContratoId,
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    // Phase 4: tag-based cost fields
    IReadOnlyList<TagDtoOutput> Tags,
    decimal CustoMensalReal,
    decimal CustoMensalEstimado,
    bool Ativo)
{
    public static FuncionarioDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Funcionario entity)
    {
        if (entity == null) return null;
        var tags = entity.Tags
            .Select(ft => TagDtoOutput.FromEntity(ft.Tag))
            .Where(t => t != null)
            .Select(t => t!)
            .ToList();
        return new FuncionarioDtoOutput(
            entity.Id,
            entity.ClienteId,
            entity.ContratoId,
            entity.Nome,
            entity.Cpf.Valor,
            entity.Celular.Valor,
            entity.StatusFuncionario,
            entity.TipoEscala,
            entity.TipoFuncionario,
            tags,
            entity.CustoMensalReal,
            entity.CustoMensalEstimado,
            true);
    }
}
