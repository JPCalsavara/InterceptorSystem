using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

// Herda do genérico e permite adicionar métodos específicos se necessário
public interface IClienteRepository : IRepository<Cliente>
{
}