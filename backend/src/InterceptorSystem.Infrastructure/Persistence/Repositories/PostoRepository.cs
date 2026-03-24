using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
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

    // FASE 4: Eager loading do Cliente necessário para QuantidadeIdealFuncionarios (vem de Cliente.QuantidadeIdealPorTurno)
    public async Task<Posto?> GetByIdAsync(Guid id)
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .Include(p => p.Tags)
                .ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Posto>> GetAllAsync()
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .Include(p => p.Tags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.Ativo)
            .ToListAsync();
    }

    public async Task<IEnumerable<Posto>> GetByClienteIdAsync(Guid clienteId)
    {
        return await _context.Postos
            .Include(p => p.Cliente)
            .Include(p => p.Tags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.ClienteId == clienteId && p.Ativo)
            .ToListAsync();
    }

    public void Add(Posto entity) => _context.Postos.Add(entity);

    public void Update(Posto entity) => _context.Postos.Update(entity);

    public void Remove(Posto entity) => _context.Postos.Remove(entity);
}

