using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IPostoRepository : IRepository<Posto>
{
    Task<IEnumerable<Posto>> GetByClienteIdAsync(Guid clienteId);
}

