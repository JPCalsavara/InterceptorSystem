namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record UpdateCondominioDtoInput(
    string Nome, 
    string Endereco,
    int QuantidadeFuncionariosIdeal,
    TimeSpan HorarioTrocaTurno,
    string? EmailGestor = null,
    string? TelefoneEmergencia = null);

public record CreateCondominioDtoInput(
    string Nome, 
    string Cnpj, 
    string Endereco,
    int QuantidadeFuncionariosIdeal,
    TimeSpan HorarioTrocaTurno,
    string? EmailGestor = null,
    string? TelefoneEmergencia = null);

public record CondominioDtoOutput(
    Guid Id, 
    string Nome, 
    string Cnpj, 
    string Endereco, 
    bool Ativo,
    int QuantidadeFuncionariosIdeal,
    string HorarioTrocaTurno,
    string? EmailGestor,
    string? TelefoneEmergencia)
{
    // SIMULAÇÃO AUTOMAPPER (Manual Mapping)
    // Método estático factory para converter Entidade -> DTO
    public static CondominioDtoOutput? FromEntity(Domain.Modulos.Administrativo.Entidades.Condominio? entity)
    {
        if (entity == null)
        {
            return null;
        }

        return new CondominioDtoOutput(
            entity.Id, 
            entity.Nome, 
            entity.Cnpj, 
            entity.Endereco, 
            entity.Ativo,
            entity.QuantidadeFuncionariosIdeal,
            entity.HorarioTrocaTurno.ToString(@"hh\:mm\:ss"),
            entity.EmailGestor,
            entity.TelefoneEmergencia);
    }
}
