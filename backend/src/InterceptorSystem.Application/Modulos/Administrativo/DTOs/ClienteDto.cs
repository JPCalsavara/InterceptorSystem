namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record UpdateClienteDtoInput(
    string Nome, 
    string Cnpj,
    string Cidade,
    string Estado,
    int QuantidadeIdealPorTurno = 2,
    string HorarioTrocaTurno = "06:00:00",
    string? EmailGestor = null,
    string? TelefoneEmergencia = null);

public record CreateClienteDtoInput(
    string Nome, 
    string Cnpj,
    string Cidade,
    string Estado,
    int QuantidadeIdealPorTurno = 2,
    string HorarioTrocaTurno = "06:00:00",
    string? EmailGestor = null,
    string? TelefoneEmergencia = null);

public record ClienteDtoOutput(
    Guid Id, 
    string Nome, 
    string Cnpj,
    string Cidade, 
    string Estado, 
    bool Ativo,
    int QuantidadeIdealPorTurno,
    string HorarioTrocaTurno,
    string? EmailGestor,
    string? TelefoneEmergencia)
{
    // SIMULAÇÃO AUTOMAPPER (Manual Mapping)
    // Método estático factory para converter Entidade -> DTO
    public static ClienteDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Cliente? entity)
    {
        if (entity == null)
        {
            return null;
        }

        return new ClienteDtoOutput(
            entity.Id, 
            entity.Nome, 
            entity.Cnpj,
            entity.Cidade, 
            entity.Estado, 
            entity.Ativo,
            entity.QuantidadeIdealPorTurno,
            entity.HorarioTrocaTurno.ToString("HH:mm:ss"),
            entity.EmailGestor,
            entity.TelefoneEmergencia);
    }
}
