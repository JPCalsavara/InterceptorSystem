using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateFuncionarioDtoInput(
    Guid CondominioId,
    Guid ContratoId,
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario);

public record UpdateFuncionarioDtoInput(
    string Nome,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario);

public record FuncionarioDtoOutput(
    Guid Id,
    Guid CondominioId,
    Guid ContratoId,
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    // FASE 3: Campos calculados automaticamente
    decimal SalarioBase,
    decimal AdicionalNoturno,
    decimal Beneficios,
    decimal SalarioTotal,
    bool Ativo)
{
    public static FuncionarioDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Funcionario entity)
    {
        if (entity == null) return null;
        return new FuncionarioDtoOutput(
            entity.Id,
            entity.CondominioId,
            entity.ContratoId,
            entity.Nome,
            entity.Cpf,
            entity.Celular,
            entity.StatusFuncionario,
            entity.TipoEscala,
            entity.TipoFuncionario,
            // FASE 3: Campos calculados
            entity.SalarioBase,
            entity.AdicionalNoturno,
            entity.Beneficios,
            entity.SalarioTotal,
            true);
    }
}
