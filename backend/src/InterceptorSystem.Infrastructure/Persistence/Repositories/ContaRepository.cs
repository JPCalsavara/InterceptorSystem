using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Auth.Interfaces;
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

    public async Task<Conta?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Contas.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Conta?> GetByEmailAsync(string email)
    {
        var normalizedEmail = (email ?? string.Empty).Trim().ToLowerInvariant();
        return await _context.Contas.FirstOrDefaultAsync(c => c.Email.Valor == normalizedEmail);
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

    public async Task<bool> CommitAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CommitAsync(cancellationToken);
    }
}
