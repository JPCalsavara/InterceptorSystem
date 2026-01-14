using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class CondominioRepository : ICondominioRepository
{   
    private readonly ApplicationDbContext _context;
    
    public CondominioRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;
    
    public async Task<Condominio?> GetByIdAsync(Guid id)
    {
        return await _context.Condominios.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Condominio>> GetAllAsync()
    {
        return await _context.Condominios.ToListAsync();
    }

    public async Task<Condominio?> GetByCnpjAsync(string cnpj)
    {
        return await _context.Condominios.FirstOrDefaultAsync(c => c.Cnpj == cnpj);
    }
    public void Add(Condominio entity) => _context.Condominios.Add(entity);

    public void Update(Condominio entity) => _context.Condominios.Update(entity);

    public void Remove(Condominio entity) => _context.Condominios.Remove(entity);
}