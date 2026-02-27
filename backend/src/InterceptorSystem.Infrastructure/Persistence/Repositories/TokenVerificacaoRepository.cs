using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class TokenVerificacaoRepository : ITokenVerificacaoRepository
{
    private readonly ApplicationDbContext _context;

    public TokenVerificacaoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TokenVerificacao?> GetByTokenAsync(string token, TipoTokenVerificacao tipo)
    {
        return await _context.TokensVerificacao
            .FirstOrDefaultAsync(t => t.Token == token && t.Tipo == tipo);
    }

    public void Add(TokenVerificacao token)
    {
        _context.TokensVerificacao.Add(token);
    }

    public async Task InvalidarTokensAnterioresAsync(Guid contaId, TipoTokenVerificacao tipo)
    {
        var tokens = await _context.TokensVerificacao
            .Where(t => t.ContaId == contaId && t.Tipo == tipo && !t.Usado)
            .ToListAsync();

        foreach (var token in tokens)
            token.Consumir();
    }

    public async Task<bool> CommitAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
