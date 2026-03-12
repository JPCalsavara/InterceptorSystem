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
    {
        return await _context.Alocacoes.FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<Alocacao>> GetAllAsync()
    {
        return await _context.Alocacoes.ToListAsync();
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
