using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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
    public async Task<Funcionario?> GetByIdAsync(Guid id)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IEnumerable<Funcionario>> GetAllAsync()
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Diarias)
                .ThenInclude(a => a.Alocacao)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .ToListAsync();

    public async Task<Funcionario?> GetByCpfAsync(string cpf)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Tags)
                    .ThenInclude(ct => ct.Tag)
            .Include(f => f.Tags)
                .ThenInclude(ft => ft.Tag)
            .FirstOrDefaultAsync(f => f.Cpf == cpf);

    public async Task<IEnumerable<Funcionario>> GetByClienteAsync(Guid clienteId)
        => await _context.Funcionarios
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Cliente)
            .Include(f => f.Contrato)
                .ThenInclude(c => c.Tags)
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

