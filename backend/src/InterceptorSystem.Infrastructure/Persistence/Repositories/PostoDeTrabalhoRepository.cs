using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class PostoDeTrabalhoRepository : IPostoDeTrabalhoRepository
{
    private readonly ApplicationDbContext _context;

    public PostoDeTrabalhoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    // FASE 4: Eager loading do Condominio necessário para QuantidadeIdealFuncionarios (vem de Condominio.QuantidadeIdealPorTurno)
    public async Task<PostoDeTrabalho?> GetByIdAsync(Guid id)
    {
        return await _context.PostosDeTrabalho
            .Include(p => p.Condominio)
            .Include(p => p.Contrato)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<PostoDeTrabalho>> GetAllAsync()
    {
        return await _context.PostosDeTrabalho
            .Include(p => p.Condominio)
            .Include(p => p.Contrato)
            .ToListAsync();
    }

    public async Task<IEnumerable<PostoDeTrabalho>> GetByCondominioIdAsync(Guid condominioId)
    {
        return await _context.PostosDeTrabalho
            .Include(p => p.Condominio)
            .Include(p => p.Contrato)
            .Where(p => p.CondominioId == condominioId)
            .ToListAsync();
    }

    public async Task<IEnumerable<PostoDeTrabalho>> GetByContratoIdAsync(Guid contratoId)
    {
        return await _context.PostosDeTrabalho
            .Include(p => p.Condominio)
            .Include(p => p.Contrato)
            .Where(p => p.ContratoId == contratoId)
            .ToListAsync();
    }

    public void Add(PostoDeTrabalho entity) => _context.PostosDeTrabalho.Add(entity);

    public void Update(PostoDeTrabalho entity) => _context.PostosDeTrabalho.Update(entity);

    public void Remove(PostoDeTrabalho entity) => _context.PostosDeTrabalho.Remove(entity);
}

