using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Enums;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class SessaoWhatsappRepository : InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces.ISessaoWhatsappRepository
{
    private readonly ApplicationDbContext _context;

    public SessaoWhatsappRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<SessaoWhatsapp?> GetByTelefoneAsync(string telefone)
    {
        return await _context.SessoesWhatsapp
            .FirstOrDefaultAsync(s => s.Telefone == telefone);
    }

    public async Task<IEnumerable<SessaoWhatsapp>> GetExpiradas(int timeoutMinutos)
    {
        var limite = DateTime.UtcNow.AddMinutes(-timeoutMinutos);
        return await _context.SessoesWhatsapp
            .Where(s => s.UltimaAtividade < limite)
            .ToListAsync();
    }

    public async Task<IEnumerable<SessaoWhatsapp>> GetAllByTenantAsync(Guid contaId, CancellationToken ct = default)
    {
        return await _context.SessoesWhatsapp
            .Where(s => s.ContaId == contaId)
            .OrderByDescending(s => s.CriadoEm)
            .ToListAsync(ct);
    }

    public void Add(SessaoWhatsapp sessao)
    {
        _context.SessoesWhatsapp.Add(sessao);
    }

    public void Remove(SessaoWhatsapp sessao)
    {
        _context.SessoesWhatsapp.Remove(sessao);
    }
}
