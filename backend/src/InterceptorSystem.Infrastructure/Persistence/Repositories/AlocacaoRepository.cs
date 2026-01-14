using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    public async Task<Alocacao?> GetByIdAsync(Guid id)
        => await _context.Alocacoes.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Alocacao>> GetAllAsync()
        => await _context.Alocacoes.ToListAsync();

    public async Task<IEnumerable<Alocacao>> GetByFuncionarioAsync(Guid funcionarioId)
        => await _context.Alocacoes.Where(a => a.FuncionarioId == funcionarioId).ToListAsync();

    public async Task<IEnumerable<Alocacao>> GetByPostoAsync(Guid postoId)
        => await _context.Alocacoes.Where(a => a.PostoDeTrabalhoId == postoId).ToListAsync();

    public async Task<IEnumerable<Alocacao>> GetByPostoEDataAsync(Guid postoId, DateOnly data)
        => await _context.Alocacoes.Where(a => a.PostoDeTrabalhoId == postoId && a.Data == data).ToListAsync();

    public async Task<bool> ExisteAlocacaoNaDataAsync(Guid funcionarioId, DateOnly data, Guid? alocacaoIdIgnorada = null)
        => await _context.Alocacoes
            .Where(a => a.FuncionarioId == funcionarioId && 
                       a.Data == data &&
                       (alocacaoIdIgnorada == null || a.Id != alocacaoIdIgnorada))
            .AnyAsync();

    public void Add(Alocacao entity) => _context.Alocacoes.Add(entity);
    public void Update(Alocacao entity) => _context.Alocacoes.Update(entity);
    public void Remove(Alocacao entity) => _context.Alocacoes.Remove(entity);
}
