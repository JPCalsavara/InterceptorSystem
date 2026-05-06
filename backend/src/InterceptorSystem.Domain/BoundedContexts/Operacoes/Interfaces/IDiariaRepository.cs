using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IDiariaRepository : IRepository<Diaria>
{
    Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId);
    Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId);
    Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId);
    Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null);
    Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data);
    Task<IEnumerable<Diaria>> GetByContratoIdAsync(Guid contratoId, DateOnly inicio, DateOnly fim);
    Task<IEnumerable<Diaria>> GetResumoFinanceiroByContratoAsync(Guid contratoId, int ano, int mes);
    Task<List<Diaria>> GetDiariasByAlocacoesIdsAsync(List<Guid> alocacaoIds);
}
