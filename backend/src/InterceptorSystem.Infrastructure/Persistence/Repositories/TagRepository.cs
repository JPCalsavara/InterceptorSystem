using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class TagRepository : ITagRepository
{
    private readonly ApplicationDbContext _context;

    public TagRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Tag?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Tags.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<IEnumerable<Tag>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Tags.ToListAsync(cancellationToken);

    public async Task<IPagedResult<Tag>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Tags.OrderBy(t => t.CreatedAt).ThenBy(t => t.Id);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Tag>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<Tag?> GetByNomeAsync(string nome)
        => await _context.Tags.FirstOrDefaultAsync(t => t.Nome == nome);

    public void Add(Tag entity) => _context.Tags.Add(entity);
    public void Update(Tag entity) => _context.Tags.Update(entity);
    public void Remove(Tag entity) => _context.Tags.Remove(entity);
}
