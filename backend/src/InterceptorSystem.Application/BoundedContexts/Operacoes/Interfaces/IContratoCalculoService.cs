using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IContratoCalculoService
{
    CalculoValorTotalOutput CalcularValorTotal(CalculoValorTotalInput input);
    SimulacaoFinanceiraMensalOutput SimularSemAlocacoes(SimulacaoFinanceiraMensalInput input);
}
