using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IPostoDeTrabalhoRepository : IRepository<PostoDeTrabalho>
{
    Task<IEnumerable<PostoDeTrabalho>> GetByCondominioIdAsync(Guid condominioId);
}

