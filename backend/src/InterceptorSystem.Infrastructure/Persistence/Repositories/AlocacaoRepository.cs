using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class AlocacaoRepository : IAlocacaoRepository
{
    private readonly ApplicationDbContext _context;

    public AlocacaoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Alocacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Alocacoes.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Alocacao>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Alocacoes.ToListAsync(cancellationToken);
    }

    public async Task<IPagedResult<Alocacao>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Alocacoes.OrderBy(a => a.CreatedAt).ThenBy(a => a.Id);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Alocacao>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<IEnumerable<Alocacao>> GetByClienteIdAsync(Guid clienteId)
    {
        return await _context.Alocacoes
            .Join(
                _context.Postos,
                alocacao => alocacao.PostoId,
                posto => posto.Id,
                (alocacao, posto) => new { alocacao, posto })
            .Where(x => x.posto.ClienteId == clienteId && x.posto.Ativo)
            .Select(x => x.alocacao)
            .ToListAsync();
    }

    public async Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId)
    {
        return await _context.Alocacoes.Where(a => a.PostoId == postoId).ToListAsync();
    }

    public void Add(Alocacao entity) => _context.Alocacoes.Add(entity);

    public void Update(Alocacao entity) => _context.Alocacoes.Update(entity);

    public void Remove(Alocacao entity) => _context.Alocacoes.Remove(entity);
}
