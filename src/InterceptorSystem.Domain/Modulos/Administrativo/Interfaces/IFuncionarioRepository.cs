using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IFuncionarioRepository : IRepository<Funcionario>
{
    Task<Funcionario?> GetByCpfAsync(string cpf);
    Task<IEnumerable<Funcionario>> GetByCondominioAsync(Guid condominioId);
}

