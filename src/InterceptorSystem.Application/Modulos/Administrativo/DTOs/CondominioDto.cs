namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

public record UpdateCondominioDtoInput(string Nome, string Endereco);

public record CreateCondominioDtoInput(string Nome, string Cnpj, string Endereco);

public record CondominioDtoOutput(Guid Id, string Nome, string Cnpj, string Endereco, bool Ativo)
{
    // SIMULAÇÃO AUTOMAPPER (Manual Mapping)
    // Método estático factory para converter Entidade -> DTO
    public static CondominioDtoOutput FromEntity(Domain.Modulos.Administrativo.Entidades.Condominio entity)
    {
        if (entity == null) return null;
        return new CondominioDtoOutput(entity.Id, entity.Nome, entity.Cnpj, entity.Endereco, entity.Ativo);
    }
}

