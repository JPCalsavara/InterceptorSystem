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
            NumeroDePostosNoturnos: 1,      // 1 dos 2 postos tem horário noturno
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.15m,    
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

        // Validações do cálculo:
        // Custo Diário Operação = 100 * 2 postos = 200
        // Custo Mensal Salários : 200 * 30 = 6000
        // Adicional Noturno: 6000 * 0.5 * 0.20 = 600
        // Base Com Adicional: 6600
        // Encargos (65%): 6600 * 0.65 = 4290
        // Benefícios Totais (qtd total funcionários = 12): 3600 * 12 = 43200
        // Custo Base Real (com encargos): 6600 + 4290 + 43200 = 54090
        
        // Margens totais: 15% Impostos + 20% Lucro + 10% Faltas = 45% (Sobra 55%)
        // Valor Total: 54090 / 0.55 = 98345.45
        Assert.Equal(98345.45m, result.ValorTotalMensal);
        Assert.Equal(54090m, result.CustoBaseMensal);
        Assert.Equal(600m, result.ValorAdicionalNoturno);
        Assert.Equal(14751.82m, result.ValorImpostos);   // 98345.45 × 0.15
        Assert.Equal(19669.09m, result.ValorMargemLucro); // 98345.45 × 0.20
        Assert.Equal(9834.55m, result.ValorMargemFaltas); // 98345.45 × 0.10
        Assert.Equal(43200m, result.ValorBeneficios);
        Assert.Equal(4290m, result.ValorEncargosTrabalhistas);
        Assert.Equal(6600m, result.BaseParaSalarios); 
    }

    [Fact]
    public async Task CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400()
    {
        // Arrange - Soma de margens >= 100%
        var input = new CalculoValorTotalInput(
            ValorDiariaCobrada: 100m,
            QuantidadeFuncionarios: 12,
            NumeroDePostos: 2,
            NumeroDePostosNoturnos: 1,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.50m, 
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
            NumeroDePostosNoturnos: 1,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualEncargosProvisoes: 0.15m,
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
            NumeroDePostosNoturnos: 1,
            ValorBeneficiosExtrasMensal: 3600m,
            PercentualAdicionalNoturno: 0.2m,
            PercentualEncargosProvisoes: 0.15m,
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
            NumeroDePostosNoturnos: 1,
            ValorBeneficiosExtrasMensal: -100m,     // ❌ Negativo!
            PercentualEncargosProvisoes: 0.15m,
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
            NumeroDePostosNoturnos: 0,      // Sem postos noturnos (cenário mínimo)
            ValorBeneficiosExtrasMensal: 0m,        // Sem benefícios
            PercentualEncargosProvisoes: 0m,      
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

        // Custo Diário da operação: 50 * 2 postos = 100
        // Custo Mensal Salarios: 100 * 30 = 3000
        // Adicional Noturno: 0
        // Encargos (65%): 3000 * 0.65 = 1950
        // Benefícios: 0 * 1 = 0
        // Custo Base Real: 3000 + 1950 = 4950
        
        // Margens: 0%
        // Valor Total: 4950 / 1 = 4950
        Assert.Equal(4950m, result.ValorTotalMensal);
        Assert.Equal(4950m, result.CustoBaseMensal);
        Assert.Equal(1950m, result.ValorEncargosTrabalhistas);
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
            NumeroDePostosNoturnos: 1,      // 1 dos 2 postos tem horário noturno
            ValorBeneficiosExtrasMensal: 15000m,
            PercentualEncargosProvisoes: 0.25m,       
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

        // Custo Diário da operação: 200 * 2 postos = 400
        // Custo Mensal Salários: 400 * 30 = 12000
        // Adicional Noturno (20% sobre 1 posto): 6000 * 0.20 = 1200
        // Base c/ Adicional: 13200
        // Encargos Trabalhistas (65%): 13200 * 0.65 = 8580
        // Benefícios Totais (50 func): 15000 * 50 = 750000
        // Custo Base Real: 13200 + 8580 + 750000 = 771780
        
        // Margens totais: 70% (Divisor 0.3)
        // Valor Total Final: 771780 / 0.3 = 2572600
        Assert.Equal(2572600m, result.ValorTotalMensal);
        Assert.Equal(771780m, result.CustoBaseMensal);

        // Validar proporções
        Assert.Equal(result.ValorTotalMensal * 0.25m, result.ValorImpostos);
        Assert.Equal(result.ValorTotalMensal * 0.30m, result.ValorMargemLucro);
        Assert.Equal(result.ValorTotalMensal * 0.15m, result.ValorMargemFaltas);
    }
}

