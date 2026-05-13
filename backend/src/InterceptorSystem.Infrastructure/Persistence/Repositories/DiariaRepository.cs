using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class DiariaRepository : IDiariaRepository
{
    private readonly ApplicationDbContext _context;

    public DiariaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Diaria?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Diarias.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IEnumerable<Diaria>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Diarias.ToListAsync(cancellationToken);

    public async Task<IPagedResult<Diaria>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Diarias.OrderBy(d => d.CreatedAt).ThenBy(d => d.Id);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Diaria>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
        => await _context.Diarias
            .Join(
                _context.Alocacoes,
                diaria => diaria.AlocacaoId,
                alocacao => alocacao.Id,
                (diaria, alocacao) => new { diaria, alocacao })
            .Join(
                _context.Postos,
                x => x.alocacao.PostoId,
                posto => posto.Id,
                (x, posto) => new { x.diaria, posto })
            .Where(x => x.posto.ClienteId == clienteId && x.posto.Ativo)
            .Select(x => x.diaria)
            .ToListAsync(ct);

    public async Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId, CancellationToken ct = default)
        => await _context.Diarias.Where(a => a.FuncionarioId == funcionarioId).ToListAsync(ct);

    public async Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId, CancellationToken ct = default)
        => await _context.Diarias.Where(a => a.AlocacaoId == alocacaoId).ToListAsync(ct);

    public async Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data, CancellationToken ct = default)
        => await _context.Diarias.Where(a => a.AlocacaoId == alocacaoId && a.Data == data).ToListAsync(ct);

    public async Task<IEnumerable<Diaria>> GetByContratoIdAsync(Guid contratoId, DateOnly inicio, DateOnly fim, CancellationToken ct = default)
        => await _context.Diarias
            .Include(d => d.Alocacao)
            .Where(d => d.Alocacao!.ContratoId == contratoId
                     && d.Data >= inicio && d.Data <= fim)
            .ToListAsync(ct);

    public async Task<IEnumerable<Diaria>> GetResumoFinanceiroByContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default)
    {
        var inicio = new DateOnly(ano, mes, 1);
        var fim = inicio.AddMonths(1).AddDays(-1);

        return await _context.Diarias
            .Include(d => d.Funcionario)
            .Include(d => d.Alocacao)
            .ThenInclude(a => a!.Posto)
            .Where(d => d.Alocacao!.ContratoId == contratoId
                        && d.StatusDiaria == StatusDiaria.CONFIRMADA
                        && d.Data >= inicio
                        && d.Data <= fim)
            .ToListAsync(ct);
    }

    public async Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null, CancellationToken ct = default)
        => await _context.Diarias
            .Where(a => a.FuncionarioId == funcionarioId && 
                       a.Data == data &&
                       (diariaIdIgnorada == null || a.Id != diariaIdIgnorada))
            .AnyAsync(ct);

    public async Task<List<Diaria>> GetDiariasByAlocacoesIdsAsync(List<Guid> alocacaoIds, CancellationToken ct = default)
    {
        return await _context.Diarias
            .Where(d => alocacaoIds.Contains(d.AlocacaoId))
            .ToListAsync(ct);
    }

    public void Add(Diaria entity) => _context.Diarias.Add(entity);
    public void Update(Diaria entity) => _context.Diarias.Update(entity);
    public void Remove(Diaria entity) => _context.Diarias.Remove(entity);
}
