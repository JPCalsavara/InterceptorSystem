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

    // FASE 3: Sempre carregar Contrato para cálculo de salário
    public async Task<Funcionario?> GetByIdAsync(Guid id)
        => await _context.Funcionarios.Include(f => f.Contrato).FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IEnumerable<Funcionario>> GetAllAsync()
        => await _context.Funcionarios.Include(f => f.Contrato).ToListAsync();

    public async Task<Funcionario?> GetByCpfAsync(string cpf)
        => await _context.Funcionarios.Include(f => f.Contrato).FirstOrDefaultAsync(f => f.Cpf == cpf);

    public async Task<IEnumerable<Funcionario>> GetByCondominioAsync(Guid condominioId)
        => await _context.Funcionarios.Include(f => f.Contrato).Where(f => f.CondominioId == condominioId).ToListAsync();

    public void Add(Funcionario entity) => _context.Funcionarios.Add(entity);
    public void Update(Funcionario entity) => _context.Funcionarios.Update(entity);
    public void Remove(Funcionario entity) => _context.Funcionarios.Remove(entity);
}

