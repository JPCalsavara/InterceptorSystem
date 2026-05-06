using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class ContratoRepository : IContratoRepository
{
    private readonly ApplicationDbContext _context;

    public ContratoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Contrato?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Contratos
            .Include(c => c.Cliente) // FASE 3: Necessário para calcular QuantidadeFuncionarios
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Contrato>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Contratos
            .Include(c => c.Cliente) // FASE 3: Necessário para calcular QuantidadeFuncionarios
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .ToListAsync(cancellationToken);
    }

    public async Task<IPagedResult<Contrato>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Contratos
            .Include(c => c.Cliente)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .OrderBy(c => c.CreatedAt)
            .ThenBy(c => c.Id);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Contrato>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<IEnumerable<Contrato>> GetAtivosByClienteIdAsync(Guid clienteId)
    {
        return await _context.Contratos
            .Include(c => c.Cliente)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Where(c => c.ClienteId == clienteId && c.Status == StatusContrato.ATIVO)
            .ToListAsync();
    }

    public async Task<Contrato?> GetByClienteId(Guid clienteId)
    {
        return await _context.Contratos
            .Include(c => c.Cliente)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId && c.Status == StatusContrato.ATIVO);
    }

    public async Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId)
    {
        return await _context.Contratos
            .Include(c => c.Cliente)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Where(c => c.ClienteId == clienteId)
            .ToListAsync();
    }

    public async Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null)
    {
        return await _context.Contratos
            .Where(c => c.ClienteId == clienteId && 
                       (c.Status == StatusContrato.ATIVO || c.Status == StatusContrato.PENDENTE) &&
                       (contratoIdIgnorado == null || c.Id != contratoIdIgnorado))
            .AnyAsync();
    }

    public void Add(Contrato entity) => _context.Contratos.Add(entity);

    public void Update(Contrato entity) => _context.Contratos.Update(entity);

    public void Remove(Contrato entity) => _context.Contratos.Remove(entity);
}

