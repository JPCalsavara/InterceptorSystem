using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IDiariaRepository : IRepository<Diaria>
{
    Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId);
    Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId);
    Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId);
    Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null);
    Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data);
}
