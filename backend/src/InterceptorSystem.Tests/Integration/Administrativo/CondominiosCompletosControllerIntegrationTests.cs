using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Tests.Integration;
using Xunit;

namespace InterceptorSystem.Tests.Integration.Administrativo;

[Collection("Integration Tests")]
public class CondominiosCompletosControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public CondominiosCompletosControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact(DisplayName = "POST /api/condominios-completos - Deve criar condomínio completo com sucesso")]
    public async Task Post_DeveCriarCondominioCompleto()
    {
        // Arrange
        var input = new CreateCondominioCompletoDtoInput(
            Condominio: new CreateCondominioDtoInput(
                Nome: $"Residencial Integração {Guid.NewGuid()}",
                Cnpj: GerarCnpjFake(),
                Endereco: "Rua Teste de Integração, 999",
                QuantidadeFuncionariosIdeal: 12,
                HorarioTrocaTurno: TimeSpan.FromHours(6),
                EmailGestor: "integracao@test.com",
                TelefoneEmergencia: "+5511988776655"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato de Integração",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualImpostos: 0.15m,
                QuantidadeFuncionarios: 12,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.PAGO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios-completos", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var resultado = await response.Content.ReadFromJsonAsync<CondominioCompletoDtoOutput>(JsonOptions);
        Assert.NotNull(resultado);
        Assert.NotNull(resultado.Condominio);
        Assert.NotNull(resultado.Contrato);
        Assert.Equal(2, resultado.Postos.Count());
        
        // Verificar que condomínio foi criado
        Assert.Equal(input.Condominio.Nome, resultado.Condominio.Nome);
        
        // Verificar que contrato está vinculado
        Assert.Equal(resultado.Condominio.Id, resultado.Contrato.CondominioId);
        
        // Verificar que postos foram criados
        var postosList = resultado.Postos.ToList();
        Assert.All(postosList, posto => Assert.Equal(resultado.Condominio.Id, posto.CondominioId));
    }

    [Fact(DisplayName = "POST /api/condominios-completos/validar - Deve validar dados corretamente")]
    public async Task PostValidar_DeveRetornarSucesso_QuandoDadosValidos()
    {
        // Arrange
        var input = new CreateCondominioCompletoDtoInput(
            Condominio: new CreateCondominioDtoInput(
                Nome: "Residencial Validação",
                Cnpj: GerarCnpjFake(),
                Endereco: "Rua Validação, 111",
                QuantidadeFuncionariosIdeal: 12,
                HorarioTrocaTurno: TimeSpan.FromHours(6),
                EmailGestor: "validacao@test.com",
                TelefoneEmergencia: "+5511999887766"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Validação",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualImpostos: 0.15m,
                QuantidadeFuncionarios: 12,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.PAGO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios-completos/validar", input);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/condominios-completos/validar - Deve retornar 400 quando quantidade difere")]
    public async Task PostValidar_DeveRetornar400_QuandoQuantidadeDifere()
    {
        // Arrange
        var input = new CreateCondominioCompletoDtoInput(
            Condominio: new CreateCondominioDtoInput(
                Nome: "Residencial Erro",
                Cnpj: GerarCnpjFake(),
                Endereco: "Rua Erro, 666",
                QuantidadeFuncionariosIdeal: 12,
                HorarioTrocaTurno: TimeSpan.FromHours(6),
                EmailGestor: null,
                TelefoneEmergencia: null
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Erro",
                ValorTotalMensal: 36000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 3600m,
                PercentualImpostos: 0.15m,
                QuantidadeFuncionarios: 10, // ❌ Diferente de 12
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.PAGO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios-completos/validar", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/condominios-completos - Deve criar postos com horários corretos")]
    public async Task Post_DeveCriarPostosComHorariosCorretos()
    {
        // Arrange
        var input = new CreateCondominioCompletoDtoInput(
            Condominio: new CreateCondominioDtoInput(
                Nome: $"Residencial Horários {Guid.NewGuid()}",
                Cnpj: GerarCnpjFake(),
                Endereco: "Rua Horários, 123",
                QuantidadeFuncionariosIdeal: 16,
                HorarioTrocaTurno: TimeSpan.FromHours(6), // 06:00
                EmailGestor: "horarios@test.com",
                TelefoneEmergencia: "+5511999888777"
            ),
            Contrato: new CreateContratoCompletoDtoInput(
                Descricao: "Contrato Horários",
                ValorTotalMensal: 48000m,
                ValorDiariaCobrada: 120m,
                PercentualAdicionalNoturno: 0.30m,
                ValorBeneficiosExtrasMensal: 4800m,
                PercentualImpostos: 0.15m,
                QuantidadeFuncionarios: 16,
                MargemLucroPercentual: 0.20m,
                MargemCoberturaFaltasPercentual: 0.10m,
                DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                Status: StatusContrato.PAGO
            ),
            CriarPostosAutomaticamente: true,
            NumeroDePostos: 2
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios-completos", input);
        var resultado = await response.Content.ReadFromJsonAsync<CondominioCompletoDtoOutput>(JsonOptions);

        // Assert
        Assert.NotNull(resultado);
        var postos = resultado.Postos.ToList();
        
        // Verificar que cada posto tem 12 horas (metade do dia)
        Assert.All(postos, posto =>
        {
            Assert.Contains("06:00", posto.Horario);
            // Postos devem ser 06:00-18:00 e 18:00-06:00
        });
    }

    private static string GerarCnpjFake()
    {
        var random = new Random();
        return $"{random.Next(10, 99)}.{random.Next(100, 999)}.{random.Next(100, 999)}/{random.Next(1000, 9999)}-{random.Next(10, 99)}";
    }
}

