using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Whatsapp.Entidades;
using InterceptorSystem.Domain.Modulos.Whatsapp.Enums;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class SessaoWhatsappRepository : InterceptorSystem.Domain.Modulos.Whatsapp.Interfaces.ISessaoWhatsappRepository
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

    public void Add(SessaoWhatsapp sessao)
    {
        _context.SessoesWhatsapp.Add(sessao);
    }

    public void Remove(SessaoWhatsapp sessao)
    {
        _context.SessoesWhatsapp.Remove(sessao);
    }
}
