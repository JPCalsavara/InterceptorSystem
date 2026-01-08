using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateFuncionarioDtoInput(
    Guid CondominioId,
    Guid ContratoId, // FASE 2: Novo campo obrigatório
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    decimal SalarioMensal,
    decimal ValorTotalBeneficiosMensal,
    decimal ValorDiariasFixas);

public record UpdateFuncionarioDtoInput(
    string Nome,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    decimal SalarioMensal,
    decimal ValorTotalBeneficiosMensal,
    decimal ValorDiariasFixas);

public record FuncionarioDtoOutput(
    Guid Id,
    Guid CondominioId,
    Guid ContratoId, // FASE 2: Novo campo no output
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    decimal SalarioMensal,
    decimal ValorTotalBeneficiosMensal,
    decimal ValorDiariasFixas,
    bool Ativo)
{
    public static FuncionarioDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Funcionario entity)
    {
        if (entity == null) return null;
        return new FuncionarioDtoOutput(
            entity.Id,
            entity.CondominioId,
            entity.ContratoId, // FASE 2: Incluir ContratoId
            entity.Nome,
            entity.Cpf,
            entity.Celular,
            entity.StatusFuncionario,
            entity.TipoEscala,
            entity.TipoFuncionario,
            entity.SalarioMensal,
            entity.ValorTotalBeneficiosMensal,
            entity.ValorDiariasFixas,
            true);
    }
}
