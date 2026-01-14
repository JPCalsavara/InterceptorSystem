using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

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
            QuantidadeFuncionarios: 12,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.15m,              // 15%
            MargemLucroPercentual: 0.20m,           // 20%
            MargemCoberturaFaltasPercentual: 0.10m  // 10%
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

        // Validações do cálculo:
        // Custo Base: (100 × 30 × 12) + 3600 = 39600
        // Margens totais: 45%
        // Valor Total: 39600 / (1 - 0.45) = 39600 / 0.55 = 72000
        Assert.Equal(72000m, result.ValorTotalMensal);
        Assert.Equal(39600m, result.CustoBaseMensal);
        Assert.Equal(10800m, result.ValorImpostos);   // 72000 × 0.15
        Assert.Equal(14400m, result.ValorMargemLucro); // 72000 × 0.20
        Assert.Equal(7200m, result.ValorMargemFaltas); // 72000 × 0.10
        Assert.Equal(3600m, result.ValorBeneficios);
        Assert.Equal(36000m, result.BaseParaSalarios); // 72000 - 10800 - 14400 - 7200 - 3600
    }

    [Fact]
    public async Task CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400()
    {
        // Arrange - Soma de margens >= 100%
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            QuantidadeFuncionarios: 12,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.50m,              // 50%
            MargemLucroPercentual: 0.40m,           // 40%
            MargemCoberturaFaltasPercentual: 0.20m  // 20%
            // Total: 110% ❌ impossível!
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
            QuantidadeFuncionarios: 12,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
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
    public async Task CalcularValorTotal_FuncionariosZero_DeveRetornar400()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            QuantidadeFuncionarios: 0,              // ❌ Zero!
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
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
    public async Task CalcularValorTotal_BeneficiosNegativos_DeveRetornar400()
    {
        // Arrange
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            QuantidadeFuncionarios: 12,
            ValorBeneficiosExtrasMensal: -100m,     // ❌ Negativo!
            PercentualImpostos: 0.15m,
            MargemLucroPercentual: 0.20m,
            MargemCoberturaFaltasPercentual: 0.10m
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
            QuantidadeFuncionarios: 1,              // 1 funcionário
            ValorBeneficiosExtrasMensal: 0m,        // Sem benefícios
            PercentualImpostos: 0m,                 // Sem impostos
            MargemLucroPercentual: 0m,              // Sem lucro
            MargemCoberturaFaltasPercentual: 0m     // Sem margem faltas
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

        // Custo Base: 50 × 30 × 1 = 1500
        // Margens: 0%
        // Valor Total: 1500 / 1 = 1500
        Assert.Equal(1500m, result.ValorTotalMensal);
        Assert.Equal(1500m, result.CustoBaseMensal);
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
            QuantidadeFuncionarios: 50,
            ValorBeneficiosExtrasMensal: 15000m,
            PercentualImpostos: 0.25m,              // 25%
            MargemLucroPercentual: 0.30m,           // 30%
            MargemCoberturaFaltasPercentual: 0.15m  // 15%
            // Total margens: 70%
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

        // Custo Base: (200 × 30 × 50) + 15000 = 315000
        // Margens: 70%
        // Valor Total: 315000 / 0.30 = 1050000
        Assert.Equal(1050000m, result.ValorTotalMensal);
        Assert.Equal(315000m, result.CustoBaseMensal);

        // Validar proporções
        Assert.Equal(result.ValorTotalMensal * 0.25m, result.ValorImpostos);
        Assert.Equal(result.ValorTotalMensal * 0.30m, result.ValorMargemLucro);
        Assert.Equal(result.ValorTotalMensal * 0.15m, result.ValorMargemFaltas);
    }
}

