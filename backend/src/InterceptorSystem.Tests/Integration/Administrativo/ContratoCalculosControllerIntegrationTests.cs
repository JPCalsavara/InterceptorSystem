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
            NumeroDePostos: 2,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.15m,    
            PercentualAdicionalNoturno: 0.2m,// 15%
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

        // Validações do cálculo (com NumeroDePostos multiplicador):
        // Total Funcionários: 12 × 2 postos = 24 funcionários
        // Custo Diário: 100 × 24 = 2400
        // Custo Mensal Salários: 2400 × 30 = 72000
        // Adicional Noturno: 72000 × 0.20 = 14400
        // Custo Base: 72000 + 14400 + 3600 = 90000
        // Margens totais: 45%
        // Valor Total: 90000 / 0.55 = 163636.36
        Assert.Equal(163636.36m, result.ValorTotalMensal);
        Assert.Equal(90000m, result.CustoBaseMensal);
        Assert.Equal(14400m, result.ValorAdicionalNoturno);
        Assert.Equal(24545.45m, result.ValorImpostos);   // 163636.36 × 0.15
        Assert.Equal(32727.27m, result.ValorMargemLucro); // 163636.36 × 0.20
        Assert.Equal(16363.64m, result.ValorMargemFaltas); // 163636.36 × 0.10
        Assert.Equal(3600m, result.ValorBeneficios);
        Assert.Equal(86400m, result.BaseParaSalarios); // 163636.36 - 24545.45 - 32727.27 - 16363.64 - 3600
    }

    [Fact]
    public async Task CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400()
    {
        // Arrange - Soma de margens >= 100%
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            QuantidadeFuncionarios: 12,
            NumeroDePostos: 2,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.50m, 
            PercentualAdicionalNoturno: 0.2m,// 50%
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
            NumeroDePostos: 2,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualImpostos: 0.15m,
            PercentualAdicionalNoturno: 0.2m,
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
            QuantidadeFuncionarios: 0,
            NumeroDePostos: 2,              // ❌ Zero!
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualAdicionalNoturno: 0.2m,
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
            NumeroDePostos: 2,
            ValorBeneficiosExtrasMensal: -100m,     // ❌ Negativo!
            PercentualImpostos: 0.15m,
            PercentualAdicionalNoturno: 0.2m,
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
            QuantidadeFuncionarios: 1,
            NumeroDePostos: 2,              // 1 funcionário
            ValorBeneficiosExtrasMensal: 0m,        // Sem benefícios
            PercentualImpostos: 0m,      
            PercentualAdicionalNoturno: 0m,// Sem impostos
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

        // Custo com multiplicação de postos:
        // Total Funcionários: 1 × 2 postos = 2 funcionários
        // Custo Mensal: 50 × 30 × 2 = 3000
        // Margens: 0%
        // Valor Total: 3000 / 1 = 3000
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
            QuantidadeFuncionarios: 50,
            NumeroDePostos: 2,
            ValorBeneficiosExtrasMensal: 15000m,
            PercentualImpostos: 0.25m,       
            PercentualAdicionalNoturno: 0.2m,// 25%
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

        // Custo com multiplicação de postos:
        // Total Funcionários: 50 × 2 postos = 100 funcionários
        // Custo Diário: 200 × 100 = 20000
        // Custo Mensal Salários: 20000 × 30 = 600000
        // Adicional Noturno: 600000 × 0.20 = 120000
        // Custo Base: 600000 + 120000 + 15000 = 735000
        // Margens: 70%
        // Valor Total: 735000 / 0.30 = 2450000
        Assert.Equal(2450000m, result.ValorTotalMensal);
        Assert.Equal(735000m, result.CustoBaseMensal);

        // Validar proporções
        Assert.Equal(result.ValorTotalMensal * 0.25m, result.ValorImpostos);
        Assert.Equal(result.ValorTotalMensal * 0.30m, result.ValorMargemLucro);
        Assert.Equal(result.ValorTotalMensal * 0.15m, result.ValorMargemFaltas);
    }
}

