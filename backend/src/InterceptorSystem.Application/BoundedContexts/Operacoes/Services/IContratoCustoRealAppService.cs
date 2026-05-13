using System;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Dtos;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services
{
    public interface IContratoCustoRealAppService
    {
        Task<CustoRealOutput> CalcularCustoRealAsync(Guid clienteId, decimal faturamentoSimulado);
    }
}
