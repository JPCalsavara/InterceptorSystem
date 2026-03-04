using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class ContaRepository : IContaRepository
{
    private readonly ApplicationDbContext _context;

    public ContaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Conta?> GetByIdAsync(Guid id)
    {
        return await _context.Contas.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Conta?> GetByEmailAsync(string email)
    {
        return await _context.Contas.FirstOrDefaultAsync(c => c.Email == email.ToLower().Trim());
    }

    public async Task<Conta?> GetByTelefoneVerificadoAsync(string telefone)
    {
        return await _context.Contas.FirstOrDefaultAsync(
            c => c.Telefone == telefone && c.TelefoneVerificado);
    }

    public void Add(Conta conta)
    {
        _context.Contas.Add(conta);
    }

    public async Task<bool> CommitAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
