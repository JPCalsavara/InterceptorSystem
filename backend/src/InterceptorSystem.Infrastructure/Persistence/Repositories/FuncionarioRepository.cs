using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class FuncionarioRepository : IFuncionarioRepository
{
    private readonly ApplicationDbContext _context;

    public FuncionarioRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    // FASE 3: Sempre carregar Contrato e Cliente (via Contrato) para cálculo de salário
    public async Task<Funcionario?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IEnumerable<Funcionario>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .ToListAsync(cancellationToken);

    public async Task<IPagedResult<Funcionario>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? 10 : pageSize;

        var query = _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .OrderBy(f => f.CreatedAt)
            .ThenBy(f => f.Id);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Funcionario>(items, totalCount, normalizedPage, normalizedPageSize);
    }

    public async Task<Funcionario?> GetByCpfAsync(string cpf)
    {
        var normalizedCpf = new string((cpf ?? string.Empty).Where(char.IsDigit).ToArray());

        return await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .FirstOrDefaultAsync(f => f.Cpf.Valor == normalizedCpf);
    }

    public async Task<IEnumerable<Funcionario>> GetByClienteAsync(Guid clienteId)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c!.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .Where(f => f.ClienteId == clienteId)
            .ToListAsync();

    public void Add(Funcionario entity) => _context.Funcionarios.Add(entity);
    public void Update(Funcionario entity) => _context.Funcionarios.Update(entity);
    public void Remove(Funcionario entity) => _context.Funcionarios.Remove(entity);
}

