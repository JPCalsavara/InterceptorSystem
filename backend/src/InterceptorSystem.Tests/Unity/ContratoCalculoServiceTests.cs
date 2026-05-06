using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

namespace InterceptorSystem.Tests.Unity;

public class ContratoCalculoServiceTests
{
    private readonly ContratoCalculoService _service;

    public ContratoCalculoServiceTests()
    {
        _service = new ContratoCalculoService();
    }

    [Fact]
    public void CalcularValorTotal_DeveCalcularCustoDiretoERetornarBreakdownCompleto()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 15m,
            DiariasNoturnasMes: 0m,
            DiariasFdsMes: 0m,
            DiariasFeriadosMes: 0m,
            FuncionariosEstimados: 1,
            ValorBeneficiosExtrasMensal: 300m,
            PercentualEncargosProvisoes: 0.15m,
            PercentualAdicionalNoturno: 0m,
            PercentualAdicionalFimSemana: 0m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act
        var result = _service.CalcularValorTotal(input);

        // Assert
        Assert.Equal(1800m, result.CustoDireto);
        Assert.Equal(2691m, result.ValorTotalMensal);
    }

    [Fact]
    public void CalcularValorTotal_DeveCalcularAdicionalNoturnoEFds()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 15m,
            DiariasNoturnasMes: 15m, // todas noturnas
            DiariasFdsMes: 4m, // 4 fds
            DiariasFeriadosMes: 0m, // 0 feriados
            FuncionariosEstimados: 1,
            ValorBeneficiosExtrasMensal: 300m,
            PercentualEncargosProvisoes: 0.15m,
            PercentualAdicionalNoturno: 0.20m, // 20%
            PercentualAdicionalFimSemana: 1.0m, // 100%
            MargemLucroPercentual: 0.10m,
            MargemCoberturaFaltasPercentual: 0.0m
        );

        // Act
        var result = _service.CalcularValorTotal(input);

        // Assert
        Assert.Equal(2420m, result.CustoDireto);
        Assert.Equal(1320m, result.CustoAdicionalNoturno);
        Assert.Equal(800m, result.CustoDiariasFimSemana);
    }

}
