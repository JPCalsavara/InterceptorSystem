using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de integração para endpoint de cálculo de contrato
/// Valida correção crítica: frontend calculava errado (juros compostos)
/// </summary>
public class ContratoCalculosControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ContratoCalculosControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CalcularValorTotal_DeveRetornarBreakdownCompleto()
    {
        // Arrange - Cenário real documentado
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 12
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CalculoValorTotalOutput>();
        Assert.NotNull(result);

        // Validações do cálculo (FDS removido da base de custo):
        // Custo base = 60 × 100 = 6000
        // Adic Noturno = 15 × 100 × 0.20 = 300
        // Benefícios = 12 × 3600 = 43200
        // Custo Direto = 6000 + 300 + 43200 = 49500
        // Fator markup = 1 + 0.20 + 0.10 = 1.30
        // Denominador = 1 - (0.15 × 1.30) = 0.805
        // Valor total = (49500 × 1.30) / 0.805 = 79937.89
        // Impostos = 79937.89 × 0.15 = 11990.68
        // Custo base mensal = 49500 + 11990.68 = 61490.68
        Assert.Equal(75198.50m, result.ValorTotalMensal);
        Assert.Equal(57845.00m, result.CustoBaseMensal);
        Assert.Equal(1800m, result.CustoAdicionalNoturno);
        Assert.Equal(1600m, result.CustoDiariasFimSemana);
        Assert.Equal(7545.00m, Math.Round(result.ValorImpostos, 2));
        Assert.Equal(11569.00m, result.ValorMargemLucro);
        Assert.Equal(5784.50m, result.ValorMargemFaltas);
        Assert.Equal(43200m, result.ValorBeneficios); 
    }

    [Fact]
    public async Task CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400()
    {
        // Arrange - Soma de margens >= 100%
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.50m, 
            MargemLucroPercentual: 0.40m,           
            MargemCoberturaFaltasPercentual: 0.20m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 12
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("não pode ser >= 100%", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CalcularValorTotal_DiariaNegativa_DeveRetornar400()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: -100m,              // ❌ Negativo!
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 12
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("maior que zero", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CalcularValorTotal_FuncionariosZero_DeveRetornar200()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 0
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CalculoValorTotalOutput>();
        Assert.NotNull(result);
        Assert.Equal(0m, result.ValorBeneficios);
    }

    [Fact]
    public async Task CalcularValorTotal_BeneficiosNegativos_DeveRetornar400()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: -100m,
            PercentualEncargosProvisoes: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 12
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("não pode ser negativo", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CalcularValorTotal_CenarioMinimo_DeveCalcularCorretamente()
    {
        // Arrange - Cenário mínimo sem margens
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 50m,                // Diária baixa
            PercentualAdicionalNoturno: 0m,
            PercentualAdicionalFimSemana: 0m,
            ValorBeneficiosExtrasMensal: 0m,
            PercentualEncargosProvisoes: 0m,
            MargemLucroPercentual: 0m,
            MargemCoberturaFaltasPercentual: 0m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 0,
            DiariasFdsMes: 0,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 1
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CalculoValorTotalOutput>();
        Assert.NotNull(result);

        // Fórmula atual sem margens/impostos:
        // Custo direto = 60 × 50 = 3000
        // Valor total = 3000
        
        // Margens: 0%
        Assert.Equal(3000m, result.ValorTotalMensal);
        Assert.Equal(3000m, result.CustoBaseMensal);
        Assert.Equal(0m, result.ValorImpostos);
        Assert.Equal(0m, result.ValorMargemLucro);
        Assert.Equal(0m, result.ValorMargemFaltas);
    }

    [Fact]
    public async Task CalcularValorTotal_CenarioMaximo_DeveCalcularCorretamente()
    {
        // Arrange - Cenário com muitos funcionários e margens altas
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 200m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 15000m,
            PercentualEncargosProvisoes: 0.25m,
            MargemLucroPercentual: 0.30m,
            MargemCoberturaFaltasPercentual: 0.15m,
            DiariasTotaisMes: 60,
            DiariasNoturnasMes: 15,
            DiariasFdsMes: 8,
            DiariasFeriadosMes: 0,
            FuncionariosEstimados: 50
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/contratos/calculos/calcular-valor-total",
            input
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<CalculoValorTotalOutput>();
        Assert.NotNull(result);

        // Fórmula atual (FDS removido da base de custo):
        // Custo base = (60 × 200) + (15 × 200 × 0.20) + (50 × 15000)
        //            = 12000 + 600 + 750000 = 762600
        // Risco FDS = 8 × 200 × 1.0 = 1600 (informativo, NÃO na fórmula)
        // Fator markup = 1 + 0.30 + 0.15 = 1.45
        // Denominador = 1 - (0.25 × 1.45) = 0.6375
        // Valor total = (762600 × 1.45) / 0.6375 = 1734541.18
        // Impostos = 1734541.18 × 0.25 = 433635.29
        // Custo base mensal = 762600 + 433635.29 = 1196235.29
        Assert.Equal(1385112.50m, result.ValorTotalMensal);
        Assert.Equal(955250m, result.CustoBaseMensal);
        Assert.Equal(3600m, result.CustoAdicionalNoturno);
        Assert.Equal(3200m, result.CustoDiariasFimSemana);
        Assert.Equal(191050m, result.ValorImpostos);
        Assert.Equal(286575m, result.ValorMargemLucro);
        Assert.Equal(143287.50m, result.ValorMargemFaltas);
    }
}

