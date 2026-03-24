using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

[Collection("Integration Tests")]
public class ClientesCompletosControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public ClientesCompletosControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact(DisplayName = "POST /api/clientes-completos - Deve criar cliente completo com sucesso")]
    public async Task Post_DeveCriarClienteCompleto()
    {
        // Arrange
        var input = new CreateClienteCompletoDtoInput(
            Cliente: new CreateClienteDtoInput(
                Nome: $"Residencial Integração {Guid.NewGuid()}",
                Cnpj: "00000000000000",
                Cidade: "São Paulo",
                Estado: "SP",
                EmailGestor: "integracao@test.com",
                TelefoneEmergencia: "+5511988776655"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato de Integração",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualEncargosProvisoes: 0.15m,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.ATIVO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes-completos", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var resultado = await response.Content.ReadFromJsonAsync<ClienteCompletoDtoOutput>(JsonOptions);
        Assert.NotNull(resultado);
        Assert.NotNull(resultado.Cliente);
        Assert.NotNull(resultado.Contrato);
        // FASE 2B: Postos are created if CriarPostosAutomaticamente is true
        Assert.NotEmpty(resultado.Postos);
        Assert.Equal(2, resultado.Postos.Count());
        
        // Verificar que cliente foi criado
        Assert.Equal(input.Cliente.Nome, resultado.Cliente.Nome);
        
        // Verificar que contrato está vinculado
        Assert.Equal(resultado.Cliente.Id, resultado.Contrato.ClienteId);
    }

    [Fact(DisplayName = "POST /api/clientes-completos/validar - Deve validar dados corretamente")]
    public async Task PostValidar_DeveRetornarSucesso_QuandoDadosValidos()
    {
        // Arrange
        var input = new CreateClienteCompletoDtoInput(
            Cliente: new CreateClienteDtoInput(
                Nome: "Condomínio Residencial Parque das Flores",
                Cnpj: "00000000000000",
                Cidade: "Campinas",
                Estado: "SP",
                EmailGestor: "validacao@test.com",
                TelefoneEmergencia: "+5511999887766"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Validação",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualEncargosProvisoes: 0.15m,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.ATIVO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes-completos/validar", input);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/clientes-completos/validar - Deve retornar 400 quando data de início no passado")]
    public async Task PostValidar_DeveRetornar400_QuandoDataInicioNoPassado()
    {
        // Arrange
        var input = new CreateClienteCompletoDtoInput(
            Cliente: new CreateClienteDtoInput(
                "Condomínio Exemplo",
                "00000000000000",
                "São Paulo",
                "SP"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Erro",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualEncargosProvisoes: 0.15m,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(-10)), // ❌ Data no passado
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.ATIVO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes-completos/validar", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/clientes-completos/validar - Deve retornar 400 quando número de postos inválido")]
    public async Task PostValidar_DeveRetornar400_QuandoNumeroPostosInvalido()
    {
        // Arrange
        var input = new CreateClienteCompletoDtoInput(
            Cliente: new CreateClienteDtoInput(
                Nome: "Residencial Postos Inválidos",
                Cnpj: "00000000000000",
                Cidade: "São Paulo",
                Estado: "SP",
                EmailGestor: "teste@postos.com",
                TelefoneEmergencia: "+5511999887766"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Postos",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualEncargosProvisoes: 0.15m,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.ATIVO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 0 // ❌ Número inválido (deve ser >= 1)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes-completos/validar", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/clientes-completos - Deve criar postos com horários corretos")]
    public async Task Post_DeveCriarPostosComHorariosCorretos()
    {
        // Arrange
        var input = new CreateClienteCompletoDtoInput(
            Cliente: new CreateClienteDtoInput(
                Nome: $"Residencial Horários {Guid.NewGuid()}",
                Cnpj: "00000000000000",
                Cidade: "São Paulo",
                Estado: "SP",
                EmailGestor: "horarios@test.com",
                TelefoneEmergencia: "+5511999888777"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Horários",
                ValorTotalMensal: 48000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 4800m,
                PercentualEncargosProvisoes: 0.15m,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.ATIVO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes-completos", input);
        var resultado = await response.Content.ReadFromJsonAsync<ClienteCompletoDtoOutput>(JsonOptions);

        // Assert
        Assert.NotNull(resultado);
        var postos = resultado.Postos.ToList();
        
        // Verificar que postos foram criados e estão ativos
        Assert.All(postos, posto =>
        {
            Assert.Equal(resultado.Cliente.Id, posto.ClienteId);
            Assert.True(posto.Ativo);
        });
    }

    private static string GerarCnpjFake()
    {
        var random = new Random();
        return $"{random.Next(10, 99)}.{random.Next(100, 999)}.{random.Next(100, 999)}/{random.Next(1000, 9999)}-{random.Next(10, 99)}";
    }
}

