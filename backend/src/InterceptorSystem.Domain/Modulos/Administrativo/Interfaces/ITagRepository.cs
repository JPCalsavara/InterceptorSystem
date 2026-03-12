using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface ITagRepository : IRepository<Tag>
{
    Task<Tag?> GetByNomeAsync(string nome);
}
