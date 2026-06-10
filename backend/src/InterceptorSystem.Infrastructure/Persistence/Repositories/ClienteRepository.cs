using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class ClienteRepository : IClienteRepository
{   
    private readonly ApplicationDbContext _context;
    
    public ClienteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;
    
    public async Task<Cliente?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Clientes.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Cliente>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Clientes.ToListAsync(cancellationToken);
    }

    public async Task<IPagedResult<Cliente>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Clientes.OrderBy(c => c.CreatedAt).ThenBy(c => c.Id);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Cliente>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public void Add(Cliente entity) => _context.Clientes.Add(entity);

    public void Update(Cliente entity) => _context.Clientes.Update(entity);

    public void Remove(Cliente entity) => _context.Clientes.Remove(entity);

    public async Task<int> DeleteDirectlyAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (_context.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")
        {
            var entity = await _context.Clientes.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            if (entity != null)
            {
                _context.Clientes.Remove(entity);
                await _context.SaveChangesAsync(cancellationToken);
                return 1;
            }
            return 0;
        }
        
        return await _context.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"Clientes\" WHERE \"Id\" = {id}", cancellationToken);
    }
}