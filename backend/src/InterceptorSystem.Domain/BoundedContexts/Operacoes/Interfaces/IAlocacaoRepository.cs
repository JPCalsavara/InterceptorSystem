using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces
{
    public interface IAlocacaoRepository : IRepository<Alocacao>
    {
        Task<List<Alocacao>> GetAlocacoesByClienteIdAsync(Guid clienteId);
        Task<IEnumerable<Alocacao>> GetByClienteIdAsync(Guid clienteId);
        Task<IEnumerable<Alocacao>> GetByPostoIdAsync(Guid postoId);
    }
}
