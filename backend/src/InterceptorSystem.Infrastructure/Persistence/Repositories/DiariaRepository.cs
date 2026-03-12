using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    public async Task<Diaria?> GetByIdAsync(Guid id)
        => await _context.Diarias.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Diaria>> GetAllAsync()
        => await _context.Diarias.ToListAsync();

    public async Task<IEnumerable<Diaria>> GetByClienteIdAsync(Guid clienteId)
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
            .ToListAsync();

    public async Task<IEnumerable<Diaria>> GetByFuncionarioAsync(Guid funcionarioId)
        => await _context.Diarias.Where(a => a.FuncionarioId == funcionarioId).ToListAsync();

    public async Task<IEnumerable<Diaria>> GetByAlocacaoAsync(Guid alocacaoId)
        => await _context.Diarias.Where(a => a.AlocacaoId == alocacaoId).ToListAsync();

    public async Task<IEnumerable<Diaria>> GetByAlocacaoEDataAsync(Guid alocacaoId, DateOnly data)
        => await _context.Diarias.Where(a => a.AlocacaoId == alocacaoId && a.Data == data).ToListAsync();

    public async Task<bool> ExisteDiariaNaDataAsync(Guid funcionarioId, DateOnly data, Guid? diariaIdIgnorada = null)
        => await _context.Diarias
            .Where(a => a.FuncionarioId == funcionarioId && 
                       a.Data == data &&
                       (diariaIdIgnorada == null || a.Id != diariaIdIgnorada))
            .AnyAsync();

    public void Add(Diaria entity) => _context.Diarias.Add(entity);
    public void Update(Diaria entity) => _context.Diarias.Update(entity);
    public void Remove(Diaria entity) => _context.Diarias.Remove(entity);
}
