using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class PostoRepository : IPostoRepository
{
    private readonly ApplicationDbContext _context;

    public PostoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Posto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Posto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .Where(p => p.Ativo)
            .ToListAsync(cancellationToken);
    }

    public async Task<IPagedResult<Posto>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Postos
            .Include(p => p.Cliente)
            .Where(p => p.Ativo)
            .OrderBy(p => p.CreatedAt)
            .ThenBy(p => p.Id);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Posto>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<IEnumerable<Posto>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .Where(p => p.ClienteId == clienteId && p.Ativo)
            .ToListAsync(ct);
    }

    public void Add(Posto entity) => _context.Postos.Add(entity);

    public void Update(Posto entity) => _context.Postos.Update(entity);

    public void Remove(Posto entity) => _context.Postos.Remove(entity);
}
