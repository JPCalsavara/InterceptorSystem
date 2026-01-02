using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateContratoDtoInput(
    Guid CondominioId,
    string Descricao,
    decimal ValorTotal,
    decimal ValorDiariaCobrada,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status);

public record UpdateContratoDtoInput(
    string Descricao,
    decimal ValorTotal,
    decimal ValorDiariaCobrada,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status);

public record ContratoDtoOutput(
    Guid Id,
    Guid CondominioId,
    string Descricao,
    decimal ValorTotal,
    decimal ValorDiariaCobrada,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status)
{
    public static ContratoDtoOutput? FromEntity(Contrato? entity)
    {
        if (entity == null) return null;
        return new ContratoDtoOutput(
            entity.Id,
            entity.CondominioId,
            entity.Descricao,
            entity.ValorTotal,
            entity.ValorDiariaCobrada,
            entity.DataInicio,
            entity.DataFim,
            entity.Status);
    }
}

