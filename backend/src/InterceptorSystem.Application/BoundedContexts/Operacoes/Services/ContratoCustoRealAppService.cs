using System;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Dtos;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services
{
    public class ContratoCustoRealAppService : IContratoCustoRealAppService
    {
        private readonly IAlocacaoRepository _alocacaoRepository;
        private readonly IDiariaRepository _diariaRepository;
        private readonly IContratoRepository _contratoRepository;

        public ContratoCustoRealAppService(
            IAlocacaoRepository alocacaoRepository,
            IDiariaRepository diariaRepository,
            IContratoRepository contratoRepository)
        {
            _alocacaoRepository = alocacaoRepository;
            _diariaRepository = diariaRepository;
            _contratoRepository = contratoRepository;
        }

        public async Task<CustoRealOutput> CalcularCustoRealAsync(Guid clienteId, decimal faturamentoSimulado)
        {
            var alocacoes = await _alocacaoRepository.GetAlocacoesByClienteIdAsync(clienteId);
            var alocacaoIds = alocacoes.Select(a => a.Id).ToList();

            var diarias = await _diariaRepository.GetDiariasByAlocacoesIdsAsync(alocacaoIds);

            var custoTotalDiarias = diarias.Sum(d => d.ValorDiaria);
            var quantidadeDiarias = diarias.Count;

            var quantidadeFuncionarios = alocacoes.Sum(a => a.QuantidadeFuncionarios);

            // Assuming a fixed benefit value per employee for now. This could come from contract or config.
            var valorBeneficio = 500; // Example value
            var custoTotalBeneficios = quantidadeFuncionarios * valorBeneficio;

            var contrato = await _contratoRepository.GetByClienteId(clienteId);
            var percentualImposto = contrato?.PercentualEncargosProvisoes ?? 0;

            var custoReal = (custoTotalDiarias + custoTotalBeneficios) * (1 + percentualImposto);
            var lucroReal = faturamentoSimulado - custoReal;

            return new CustoRealOutput
            {
                CustoTotalDiarias = custoTotalDiarias,
                CustoTotalBeneficios = custoTotalBeneficios,
                CustoReal = custoReal,
                LucroReal = lucroReal,
                QuantidadeFuncionarios = quantidadeFuncionarios,
                QuantidadeDiarias = quantidadeDiarias
            };
        }
    }
}
