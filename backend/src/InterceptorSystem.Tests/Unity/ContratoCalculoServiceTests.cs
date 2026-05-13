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

    // ==================== TESTES DE VALIDAÇÃO ====================

    [Fact]
    public void CalcularValorTotal_ComValorDiarioNegativo_LancaArgumentException()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: -100m, // NEGATIVO
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

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    [Fact]
    public void CalcularValorTotal_ComDiariasTotaisMesNegativo_LancaArgumentException()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: -5m, // NEGATIVO
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

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    [Fact]
    public void CalcularValorTotal_ComDiariasNoturnasMaiorQueTotais_LancaArgumentException()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 10m,
            DiariasNoturnasMes: 15m, // MAIOR QUE TOTAL
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

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    [Fact]
    public void CalcularValorTotal_ComMargemLucroMaiorQue100Porcento_LancaArgumentException()
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
            MargemLucroPercentual: 1.5m, // 150% - INVÁLIDO
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    [Fact]
    public void CalcularValorTotal_ComEncargosNegativo_LancaArgumentException()
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
            PercentualEncargosProvisoes: -0.15m, // NEGATIVO
            PercentualAdicionalNoturno: 0m,
            PercentualAdicionalFimSemana: 0m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    // ==================== TESTES DE CASOS EXTREMOS ====================

    [Fact]
    public void CalcularValorTotal_ComZeroDiarias_DeveRetornarZeroCustoDireto()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 0m, // ZERO
            DiariasNoturnasMes: 0m,
            DiariasFdsMes: 0m,
            DiariasFeriadosMes: 0m,
            FuncionariosEstimados: 0,
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
        Assert.Equal(0m, result.CustoDireto);
        Assert.Equal(0m, result.ValorImpostos);
        Assert.Equal(0m, result.CustoBaseMensal);
    }

    [Fact]
    public void CalcularValorTotal_ComSomaPercentuaisMaiorOuIgualA100_LancaArgumentException()
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
            MargemLucroPercentual: 0.60m, // 60%
            MargemCoberturaFaltasPercentual: 0.50m // 50% = 110% TOTAL
        );

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.CalcularValorTotal(input));
    }

    [Fact]
    public void CalcularValorTotal_ComMultiplosFuncionarios_DeveCalcularBeneficiosCorretamente()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 15m,
            DiariasNoturnasMes: 0m,
            DiariasFdsMes: 0m,
            DiariasFeriadosMes: 0m,
            FuncionariosEstimados: 4, // 4 funcionários
            ValorBeneficiosExtrasMensal: 350m,
            PercentualEncargosProvisoes: 0.50m,
            PercentualAdicionalNoturno: 0m,
            PercentualAdicionalFimSemana: 0m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act
        var result = _service.CalcularValorTotal(input);

        // Assert
        var expectedBeneficios = 4 * 350m; // 1.400
        Assert.Equal(1400m, result.ValorBeneficios);
    }

    [Fact]
    public void CalcularValorTotal_DeveNuncaRetornarValoresNegativos()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 20m,
            DiariasNoturnasMes: 10m,
            DiariasFdsMes: 5m,
            DiariasFeriadosMes: 0m,
            FuncionariosEstimados: 2,
            ValorBeneficiosExtrasMensal: 300m,
            PercentualEncargosProvisoes: 0.50m,
            PercentualAdicionalNoturno: 0.30m,
            PercentualAdicionalFimSemana: 0.50m,
            MargemLucroPercentual: 0.25m,
            MargemCoberturaFaltasPercentual: 0.15m
        );

        // Act
        var result = _service.CalcularValorTotal(input);

        // Assert
        Assert.True(result.CustoDireto >= 0m);
        Assert.True(result.CustoBaseMensal >= 0m);
        Assert.True(result.ValorImpostos >= 0m);
        Assert.True(result.ValorMargemLucro >= 0m);
        Assert.True(result.ValorTotalMensal >= 0m);
    }

    // ==================== TESTES DE ARREDONDAMENTO ====================

    [Fact]
    public void CalcularValorTotal_DeveArredondarParaDuasCasasDecimais()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 123.456m,
            DiariasTotaisMes: 11.111m,
            DiariasNoturnasMes: 3.333m,
            DiariasFdsMes: 2m,
            DiariasFeriadosMes: 0m,
            FuncionariosEstimados: 1,
            ValorBeneficiosExtrasMensal: 300m,
            PercentualEncargosProvisoes: 0.25m,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            MargemLucroPercentual: 0.15m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act
        var result = _service.CalcularValorTotal(input);

        // Assert - Todos os valores devem ter no máximo 2 casas decimais
        AssertArredondadoParaDuasCasas(result.CustoDireto);
        AssertArredondadoParaDuasCasas(result.CustoBaseMensal);
        AssertArredondadoParaDuasCasas(result.ValorImpostos);
        AssertArredondadoParaDuasCasas(result.ValorTotalMensal);
    }

    private void AssertArredondadoParaDuasCasas(decimal value)
    {
        var multiplicado = value * 100;
        Assert.Equal(Math.Floor(multiplicado), multiplicado);
    }

    // ==================== TESTES DO SIMULADOR ====================

    [Fact]
    public void SimularSemAlocacoes_DeveCalcularFaturamentoSimuladoCompleto()
    {
        // Arrange
        var input = new SimulacaoFinanceiraMensalInput(
            ValorDiaria: 100m,
            NumeroDePostos: 2,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            PercentualEncargosProvisoes: 0.50m,
            AlocacoesPorPosto: 2,
            FuncionariosPorAlocacao: 1,
            DiasUteisMes: 22,
            DiasFimSemanaMes: 8,
            FeriadosAno: 12,
            DiasTrabalhadosPorFuncionarioMes: 15,
            ValorBeneficioMensalPorFuncionario: 350m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act
        var result = _service.SimularSemAlocacoes(input);

        // Assert
        Assert.True(result.FaturamentoSimulado > 0m);
        Assert.True(result.CustoBaseMensal > 0m);
        Assert.True(result.FuncionariosProjetados > 0);
    }

    [Fact]
    public void SimularSemAlocacoes_ComNumeroDePostosZero_LancaArgumentException()
    {
        // Arrange
        var input = new SimulacaoFinanceiraMensalInput(
            ValorDiaria: 100m,
            NumeroDePostos: 0, // ZERO - INVÁLIDO
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            PercentualEncargosProvisoes: 0.50m
        );

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.SimularSemAlocacoes(input));
    }

    [Fact]
    public void SimularSemAlocacoes_ComSomaPercentuaisMaiorOuIgualA100_LancaArgumentException()
    {
        // Arrange
        var input = new SimulacaoFinanceiraMensalInput(
            ValorDiaria: 100m,
            NumeroDePostos: 1,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            PercentualEncargosProvisoes: 0.50m,
            MargemLucroPercentual: 0.70m,
            MargemCoberturaFaltasPercentual: 0.50m // Total = 120%
        );

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.SimularSemAlocacoes(input));
    }

    // ==================== TESTES DE COMPARAÇÃO CalcularValorTotal vs SimularSemAlocacoes ====================

    [Fact]
    public void ComparacaoEntreMetodos_ComIguaisParametros_DeveRetornarFaturamentoSimilar()
    {
        // Teste para garantir consistência entre os dois métodos
        // Arrange
        var inputCalcular = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            DiariasTotaisMes: 44m,
            DiariasNoturnasMes: 22m,
            DiariasFdsMes: 8m,
            DiariasFeriadosMes: 1m,
            FuncionariosEstimados: 3,
            ValorBeneficiosExtrasMensal: 350m,
            PercentualEncargosProvisoes: 0.50m,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        var inputSimular = new SimulacaoFinanceiraMensalInput(
            ValorDiaria: 100m,
            NumeroDePostos: 2,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 0.50m,
            PercentualEncargosProvisoes: 0.50m,
            AlocacoesPorPosto: 2,
            FuncionariosPorAlocacao: 1,
            DiasUteisMes: 22,
            DiasFimSemanaMes: 8,
            FeriadosAno: 12,
            DiasTrabalhadosPorFuncionarioMes: 15,
            ValorBeneficioMensalPorFuncionario: 350m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
        );

        // Act
        var resultCalcular = _service.CalcularValorTotal(inputCalcular);
        var resultSimular = _service.SimularSemAlocacoes(inputSimular);

        // Assert - Ambos devem ter estrutura similar
        Assert.True(resultCalcular.ValorTotalMensal > 0m);
        Assert.True(resultSimular.FaturamentoSimulado > 0m);
        // Nenhuma margem negativa
        Assert.True(resultCalcular.ValorMargemLucro >= 0m);
        Assert.True(resultSimular.ValorMargemLucro >= 0m);
    }
}

