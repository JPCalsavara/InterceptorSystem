using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

public interface IDiariaRepository : IRepository<Diaria>
{
    Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);
    Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId, CancellationToken ct = default);
    Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId, CancellationToken ct = default);
    Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null, CancellationToken ct = default);
    Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data, CancellationToken ct = default);
    Task<IEnumerable<Diaria>> GetByContratoIdAsync(Guid contratoId, DateOnly inicio, DateOnly fim, CancellationToken ct = default);
    Task<IEnumerable<Diaria>> GetResumoFinanceiroByContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default);
    Task<List<Diaria>> GetDiariasByAlocacoesIdsAsync(List<Guid> alocacaoIds, CancellationToken ct = default);
}
