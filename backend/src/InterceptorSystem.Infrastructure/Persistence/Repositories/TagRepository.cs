using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class TagRepository : ITagRepository
{
    private readonly ApplicationDbContext _context;

    public TagRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Tag?> GetByIdAsync(Guid id)
        => await _context.Tags.FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<Tag>> GetAllAsync()
        => await _context.Tags.ToListAsync();

    public async Task<Tag?> GetByNomeAsync(string nome)
        => await _context.Tags.FirstOrDefaultAsync(t => t.Nome == nome);

    public void Add(Tag entity) => _context.Tags.Add(entity);
    public void Update(Tag entity) => _context.Tags.Update(entity);
    public void Remove(Tag entity) => _context.Tags.Remove(entity);
}
