using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IAlocacaoRepository : IRepository<Alocacao>
{
    Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId);
}
