using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IAlocacaoRepository : IRepository<Alocacao>
{
    Task<IEnumerable<Alocacao>> GetByFuncionarioAsync(Guid funcionarioId);
    Task<IEnumerable<Alocacao>> GetByPostoAsync(Guid postoId);
}

