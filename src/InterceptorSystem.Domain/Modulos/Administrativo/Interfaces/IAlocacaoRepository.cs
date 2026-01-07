using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IAlocacaoRepository : IRepository<Alocacao>
{
    Task<IEnumerable<Alocacao>> GetByFuncionarioAsync(Guid funcionarioId);
    Task<IEnumerable<Alocacao>> GetByPostoAsync(Guid postoId);
    Task<bool> ExisteAlocacaoNaDataAsync(Guid funcionarioId, DateOnly data, Guid? alocacaoIdIgnorada = null);
    Task<IEnumerable<Alocacao>> GetByPostoEDataAsync(Guid postoId, DateOnly data);
}
