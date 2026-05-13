using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class DiariasControllerIntegrationTests : IntegrationTestBase
{
    public DiariasControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
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
            "Contrato Teste Diárias",
            10000m,  // ValorTotalMensal
            100m,    // ValorDiariaCobrada
            0.30m,   // PercentualAdicionalNoturno (30% = 0.30)
            1.0m,
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

    private async Task<FuncionarioDtoOutput> CriarFuncionarioAsync(Guid clienteId, Guid? contratoId = null)
    {
        var resolvedContratoId = contratoId ?? await CriarContratoAsync(clienteId);

        var input = new CreateFuncionarioDtoInput(
            clienteId,
            resolvedContratoId,
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

    private static string GerarCpfFake()
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

    private async Task<PostoDto> CriarPostoAsync(Guid clienteId)
    {
        var input = new CreatePostoInput(
            clienteId,
            $"Posto Teste {Guid.NewGuid().ToString()[..8]}",
            "01310-100",
            "Rua Teste",
            "123",
            null,
            "São Paulo",
            "SP");
        var response = await Client.PostAsJsonAsync("/api/postos", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<PostoDto>(response) ?? throw new InvalidOperationException();
    }

    private async Task<AlocacaoDto> CriarAlocacaoAsync(Guid postoId, Guid contratoId)
    {
        var input = new CreateAlocacaoInput
        {
            PostoId = postoId,
            ContratoId = contratoId,
            HorarioInicio = new TimeSpan(6, 0, 0),
            HorarioFim = new TimeSpan(18, 0, 0),
            TipoEscala = TipoEscala.DOZE_POR_TRINTA_SEIS,
            PermiteDobrarEscala = true
        };
        var response = await Client.PostAsJsonAsync("/api/alocacao", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<AlocacaoDto>(response) ?? throw new InvalidOperationException();
    }

    private async Task<DiariaDtoOutput> CriarDiariaAsync(Guid funcionarioId, Guid alocacaoId)
    {
        var input = new CreateDiariaDtoInput(
            funcionarioId,
            alocacaoId,
            DateOnly.FromDateTime(DateTime.Today),
            StatusDiaria.CONFIRMADA,
            TipoDiaria.REGULAR);
        var response = await Client.PostAsJsonAsync("/api/diarias", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<DiariaDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    /// <summary>
    /// Helper: creates full chain Cliente → Contrato → Posto → Alocação → Funcionário
    /// </summary>
    private async Task<(Guid clienteId, Guid contratoId, PostoDto posto, AlocacaoDto alocacao, FuncionarioDtoOutput funcionario)> CriarDadosCompletosAsync()
    {
        var clienteId = await CriarClienteAsync();
        var contratoId = await CriarContratoAsync(clienteId);
        var posto = await CriarPostoAsync(clienteId);
        var alocacao = await CriarAlocacaoAsync(posto.Id, contratoId);
        var funcionario = await CriarFuncionarioAsync(clienteId, contratoId);
        return (clienteId, contratoId, posto, alocacao, funcionario);
    }

    [Fact(DisplayName = "POST /api/diarias - Deve criar diária quando dados válidos")]
    public async Task Post_DeveCriarDiaria()
    {
        var (_, _, _, alocacao, funcionario) = await CriarDadosCompletosAsync();

        var input = new CreateDiariaDtoInput(funcionario.Id, alocacao.Id, DateOnly.FromDateTime(DateTime.Today), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR);
        var response = await Client.PostAsJsonAsync("/api/diarias", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/diarias - Deve retornar 404 quando funcionário inexistente")]
    public async Task Post_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var (_, _, _, alocacao, _) = await CriarDadosCompletosAsync();
        var input = new CreateDiariaDtoInput(Guid.NewGuid(), alocacao.Id, DateOnly.FromDateTime(DateTime.Today), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR);

        var response = await Client.PostAsJsonAsync("/api/diarias", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/diarias - Deve retornar 404 quando alocação inexistente")]
    public async Task Post_DeveFalhar_QuandoAlocacaoNaoExiste()
    {
        var clienteId = await CriarClienteAsync();
        var contratoId = await CriarContratoAsync(clienteId);
        var funcionario = await CriarFuncionarioAsync(clienteId, contratoId);
        var input = new CreateDiariaDtoInput(funcionario.Id, Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR);

        var response = await Client.PostAsJsonAsync("/api/diarias", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/diarias/{id} - Deve retornar 200 quando existe")]
    public async Task GetById_DeveRetornar200()
    {
        var (_, _, _, alocacao, funcionario) = await CriarDadosCompletosAsync();
        var diaria = await CriarDiariaAsync(funcionario.Id, alocacao.Id);

        var response = await Client.GetAsync($"/api/diarias/{diaria.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/diarias/{id} - Deve retornar 404 quando não existe")]
    public async Task GetById_DeveRetornar404()
    {
        var response = await Client.GetAsync($"/api/diarias/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/diarias - Deve retornar lista")]
    public async Task GetAll_DeveRetornarLista()
    {
        var (_, _, _, alocacao, funcionario) = await CriarDadosCompletosAsync();
        await CriarDiariaAsync(funcionario.Id, alocacao.Id);

        var response = await Client.GetAsync("/api/diarias");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/diarias/{id} - Deve atualizar diária")]
    public async Task Put_DeveAtualizarDiaria()
    {
        var (_, _, _, alocacao, funcionario) = await CriarDadosCompletosAsync();
        var diaria = await CriarDiariaAsync(funcionario.Id, alocacao.Id);

        var input = new UpdateDiariaDtoInput(StatusDiaria.CANCELADA, TipoDiaria.SUBSTITUICAO);
        var response = await Client.PutAsJsonAsync($"/api/diarias/{diaria.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/diarias/{id} - Deve retornar 404 quando diária não existe")]
    public async Task Put_DeveRetornar404()
    {
        var input = new UpdateDiariaDtoInput(StatusDiaria.CANCELADA, TipoDiaria.SUBSTITUICAO);

        var response = await Client.PutAsJsonAsync($"/api/diarias/{Guid.NewGuid()}", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/diarias/{id} - Deve excluir diária existente")]
    public async Task Delete_DeveExcluirDiaria()
    {
        var (_, _, _, alocacao, funcionario) = await CriarDadosCompletosAsync();
        var diaria = await CriarDiariaAsync(funcionario.Id, alocacao.Id);

        var response = await Client.DeleteAsync($"/api/diarias/{diaria.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/diarias/{id} - Deve retornar 404 quando diária inexistente")]
    public async Task Delete_DeveRetornar404()
    {
        var response = await Client.DeleteAsync($"/api/diarias/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
