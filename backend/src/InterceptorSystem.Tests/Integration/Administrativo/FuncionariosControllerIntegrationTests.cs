using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class FuncionariosControllerIntegrationTests : IntegrationTestBase
{
    public FuncionariosControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<Guid> CriarClienteAsync()
    {
        var input = new CreateClienteDtoInput(
            "Cliente Teste", 
            "11222333000181",
            "São Paulo",
            "SP"
        );
        var response = await Client.PostAsJsonAsync("/api/clientes", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ClienteDtoOutput>(response);
        return dto!.Id;
    }

    // FASE 2: Criar contrato vigente para vincular funcionários
    private async Task<Guid> CriarContratoAsync(Guid clienteId)
    {
        var input = new CreateContratoDtoInput(
            clienteId,
            "Contrato Teste",
            10000m,  // ValorTotalMensal
            100m,    // ValorDiariaCobrada
            0.30m,   // PercentualAdicionalNoturno (30% = 0.30)
            1.0m,    // PercentualAdicionalFimSemana (100% = 1.0)
            500m,    // ValorBeneficiosExtrasMensal
            0.15m,   // PercentualEncargosProvisoes (15% = 0.15)
            2,
            0.20m,   // MargemLucroPercentual (20% = 0.20)
            0.10m,   // MargemCoberturaFaltasPercentual (10% = 0.10)
            DateOnly.FromDateTime(DateTime.Today.AddMonths(-1)),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            StatusContrato.ATIVO
        );
        var response = await Client.PostAsJsonAsync("/api/contratos", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ContratoDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<FuncionarioDtoOutput> CriarFuncionarioAsync(Guid clienteId)
    {
        var contratoId = await CriarContratoAsync(clienteId);
        
        // FASE 3: Sem parâmetros de salário (calculados automaticamente)
        var input = new CreateFuncionarioDtoInput(
            clienteId,
            contratoId,
            "Funcionario Teste",
            GerarCpfFake(),
            "+5511999999999",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT);
        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<FuncionarioDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    private string GerarCpfFake()
    {
        var baseDigits = $"{DateTime.UtcNow.Ticks % 1000000000:000000000}";
        var d1 = CalcularDigitoCpf(baseDigits, new[] { 10, 9, 8, 7, 6, 5, 4, 3, 2 });
        var d2 = CalcularDigitoCpf(baseDigits + d1, new[] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 });
        return baseDigits + d1 + d2;
    }

    private static int CalcularDigitoCpf(string input, IReadOnlyList<int> pesos)
    {
        var soma = 0;
        for (var i = 0; i < input.Length; i++)
        {
            soma += (input[i] - '0') * pesos[i];
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    // FASE 2: Helper para criar cliente + contrato juntos
    private async Task<(Guid clienteId, Guid contratoId)> CriarClienteComContratoAsync()
    {
        var clienteId = await CriarClienteAsync();
        var contratoId = await CriarContratoAsync(clienteId);
        return (clienteId, contratoId);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve criar funcionário quando dados válidos")]
    public async Task Post_DeveCriarFuncionario()
    {
        var (clienteId, contratoId) = await CriarClienteComContratoAsync();
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(clienteId, contratoId, "Funcionario Teste", GerarCpfFake(), "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 400 quando CPF duplicado")]
    public async Task Post_DeveFalhar_QuandoCpfDuplicado()
    {
        var (clienteId, contratoId) = await CriarClienteComContratoAsync();
        var cpf = GerarCpfFake();
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(clienteId, contratoId, "Funcionario Teste", cpf, "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        await Client.PostAsJsonAsync("/api/funcionarios", input);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 404 quando cliente inexistente")]
    public async Task Post_DeveFalhar_QuandoClienteNaoExiste()
    {
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(Guid.NewGuid(), Guid.NewGuid(), "Funcionario Teste", GerarCpfFake(), "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/funcionarios/{id} - Deve retornar 200 quando existe")]
    public async Task GetById_DeveRetornar200()
    {
        var clienteId = await CriarClienteAsync();
        var funcionario = await CriarFuncionarioAsync(clienteId);

        var response = await Client.GetAsync($"/api/funcionarios/{funcionario.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/funcionarios/{id} - Deve retornar 404 quando não existe")]
    public async Task GetById_DeveRetornar404()
    {
        var response = await Client.GetAsync($"/api/funcionarios/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/funcionarios - Deve retornar lista")]
    public async Task GetAll_DeveRetornarLista()
    {
        var clienteId = await CriarClienteAsync();
        await CriarFuncionarioAsync(clienteId);

        var response = await Client.GetAsync("/api/funcionarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/funcionarios/{id} - Deve atualizar funcionário")]
    public async Task Put_DeveAtualizarFuncionario()
    {
        var clienteId = await CriarClienteAsync();
        var funcionario = await CriarFuncionarioAsync(clienteId);
        // FASE 3: Sem parâmetros de salário
        var input = new UpdateFuncionarioDtoInput("Atualizado", "+5511777777777", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

        var response = await Client.PutAsJsonAsync($"/api/funcionarios/{funcionario.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/funcionarios/{id} - Deve retornar 404 quando funcionário não existe")]
    public async Task Put_DeveRetornar404_QuandoFuncionarioNaoExiste()
    {
        // FASE 3: Sem parâmetros de salário
        var input = new UpdateFuncionarioDtoInput("Atualizado", "+5511777777777", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

        var response = await Client.PutAsJsonAsync($"/api/funcionarios/{Guid.NewGuid()}", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/funcionarios/{id} - Deve excluir funcionário existente")]
    public async Task Delete_DeveExcluirFuncionario()
    {
        var clienteId = await CriarClienteAsync();
        var funcionario = await CriarFuncionarioAsync(clienteId);

        var response = await Client.DeleteAsync($"/api/funcionarios/{funcionario.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/funcionarios/{id} - Deve retornar 404 quando funcionário inexistente")]
    public async Task Delete_DeveRetornar404()
    {
        var response = await Client.DeleteAsync($"/api/funcionarios/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
