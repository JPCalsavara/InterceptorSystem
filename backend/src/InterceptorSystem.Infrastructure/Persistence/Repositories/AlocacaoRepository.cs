using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories
{
    public class AlocacaoRepository : Repository<Alocacao>, IAlocacaoRepository
    {
        public AlocacaoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Alocacao>> GetAlocacoesByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
        {
            return await _dbSet
                .Include(a => a.Posto)
                .Include(a => a.Contrato)
                .Where(a => a.Contrato != null && a.Contrato.ClienteId == clienteId)
                .ToListAsync(ct);
        }

        public async Task<IEnumerable<Alocacao>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
        {
            return await _dbSet
                .Include(a => a.Posto)
                .Include(a => a.Contrato)
                .Where(a => a.Contrato != null && a.Contrato.ClienteId == clienteId)
                .ToListAsync(ct);
        }

        public async Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId, CancellationToken ct = default)
        {
            return await _dbSet
                .Where(a => a.PostoId == postoId)
                .ToListAsync(ct);
        }
    }
}
