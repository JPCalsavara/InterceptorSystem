namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record CreateFuncionarioDtoInput(
    Guid CondominioId,
    string Nome,
    string Cpf,
    string StatusFuncionario,
    string TipoEscala,
    string TipoFuncionario,
    decimal SalarioMensal,
    decimal ValorTotalBeneficiosMensal,
    decimal ValorDiariasFixas);

public record UpdateFuncionarioDtoInput(
    string Nome,
    string StatusFuncionario,
    string TipoEscala,
    string TipoFuncionario,
    decimal SalarioMensal,
    decimal ValorTotalBeneficiosMensal,
    decimal ValorDiariasFixas);

public record FuncionarioDtoOutput(
    Guid Id,
    Guid CondominioId,
    string Nome,
    string Cpf,
    string StatusFuncionario,
    string TipoEscala,
    string TipoFuncionario,
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
            entity.Nome,
            entity.Cpf,
            entity.StatusFuncionario,
            entity.TipoEscala,
            entity.TipoFuncionario,
            entity.SalarioMensal,
            entity.ValorTotalBeneficiosMensal,
            entity.ValorDiariasFixas,
            true);
    }
}

