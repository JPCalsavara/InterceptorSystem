using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class ClienteScopedEndpointsIntegrationTests : IntegrationTestBase
{
    public ClienteScopedEndpointsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/alocacoes - Deve retornar alocacoes do cliente")]
    public async Task GetAlocacoesByCliente_DeveRetornarSomenteAlocacoesDoCliente()
    {
        var (clienteId1, contratoId1, postoId1) = await CriarContextoClienteAsync();
        var (clienteId2, contratoId2, postoId2) = await CriarContextoClienteAsync();

        await CriarAlocacaoAsync(postoId1, contratoId1, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
        await CriarAlocacaoAsync(postoId1, contratoId1, new TimeSpan(18, 0, 0), new TimeSpan(23, 0, 0));
        await CriarAlocacaoAsync(postoId2, contratoId2, new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0));

        var response = await Client.GetAsync($"/api/clientes/{clienteId1}/alocacoes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDto>>(response);
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.Equal(postoId1, item.PostoId));
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/alocacoes - Deve retornar lista vazia quando nao ha alocacoes")]
    public async Task GetAlocacoesByCliente_DeveRetornarListaVazia_QuandoNaoHaDados()
    {
        var (clienteId, _, _) = await CriarContextoClienteAsync();

        var response = await Client.GetAsync($"/api/clientes/{clienteId}/alocacoes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDto>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/alocacoes - Deve ignorar cliente inexistente e retornar vazio")]
    public async Task GetAlocacoesByCliente_DeveRetornarVazio_QuandoClienteNaoExiste()
    {
        var response = await Client.GetAsync($"/api/clientes/{Guid.NewGuid()}/alocacoes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDto>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/diarias - Deve retornar diarias do cliente")]
    public async Task GetDiariasByCliente_DeveRetornarSomenteDiariasDoCliente()
    {
        var (clienteId1, contratoId1, postoId1) = await CriarContextoClienteAsync();
        var (clienteId2, contratoId2, postoId2) = await CriarContextoClienteAsync();

        var alocacao1 = await CriarAlocacaoAsync(postoId1, contratoId1, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
        var alocacao2 = await CriarAlocacaoAsync(postoId2, contratoId2, new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0));
        var funcionario1 = await CriarFuncionarioAsync(clienteId1, contratoId1);
        var funcionario2 = await CriarFuncionarioAsync(clienteId2, contratoId2);

        await CriarDiariaAsync(funcionario1, alocacao1, DateOnly.FromDateTime(DateTime.Today));
        await CriarDiariaAsync(funcionario1, alocacao1, DateOnly.FromDateTime(DateTime.Today.AddDays(1)));
        await CriarDiariaAsync(funcionario2, alocacao2, DateOnly.FromDateTime(DateTime.Today));

        var response = await Client.GetAsync($"/api/clientes/{clienteId1}/diarias");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.Equal(alocacao1.Id, item.AlocacaoId));
        Assert.All(result, item => Assert.Equal(funcionario1, item.FuncionarioId));
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/diarias - Deve retornar lista vazia quando nao ha diarias")]
    public async Task GetDiariasByCliente_DeveRetornarListaVazia_QuandoNaoHaDados()
    {
        var (clienteId, _, _) = await CriarContextoClienteAsync();

        var response = await Client.GetAsync($"/api/clientes/{clienteId}/diarias");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/diarias - Deve ignorar cliente inexistente e retornar vazio")]
    public async Task GetDiariasByCliente_DeveRetornarVazio_QuandoClienteNaoExiste()
    {
        var response = await Client.GetAsync($"/api/clientes/{Guid.NewGuid()}/diarias");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/contratos - Deve retornar contratos do cliente")]
    public async Task GetContratosByCliente_DeveRetornarSomenteContratosDoCliente()
    {
        var (clienteId1, _, _) = await CriarContextoClienteAsync();
        await CriarContextoClienteAsync();

        var response = await Client.GetAsync($"/api/clientes/{clienteId1}/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.All(result, item => Assert.Equal(clienteId1, item.ClienteId));
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/contratos - Deve retornar lista vazia quando nao ha contratos")]
    public async Task GetContratosByCliente_DeveRetornarListaVazia_QuandoNaoHaDados()
    {
        var clienteId = await CriarClienteAsync();

        var response = await Client.GetAsync($"/api/clientes/{clienteId}/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/clientes/{id}/contratos - Deve ignorar cliente inexistente e retornar vazio")]
    public async Task GetContratosByCliente_DeveRetornarVazio_QuandoClienteNaoExiste()
    {
        var response = await Client.GetAsync($"/api/clientes/{Guid.NewGuid()}/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    private async Task<(Guid clienteId, Guid contratoId, Guid postoId)> CriarContextoClienteAsync()
    {
        var clienteId = await CriarClienteAsync();
        var contratoId = await CriarContratoAsync(clienteId);
        var postoId = await CriarPostoAsync(clienteId);
        return (clienteId, contratoId, postoId);
    }

    private async Task<Guid> CriarClienteAsync()
    {
        var input = new CreateClienteDtoInput(
            $"Cliente {Guid.NewGuid().ToString()[..8]}",
            "11222333000181",
            "São Paulo",
            "SP");

        var response = await Client.PostAsJsonAsync("/api/clientes", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ClienteDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<Guid> CriarContratoAsync(Guid clienteId)
    {
        var input = new CreateContratoDtoInput(
            clienteId,
            $"Contrato {Guid.NewGuid().ToString()[..8]}",
            10000m,
            100m,
            0.30m,
            500m,
            0.15m,
            2,
            0.20m,
            0.10m,
            DateOnly.FromDateTime(DateTime.Today.AddMonths(-1)),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            StatusContrato.ATIVO);

        var response = await Client.PostAsJsonAsync("/api/contratos", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ContratoDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<Guid> CriarPostoAsync(Guid clienteId)
    {
        var input = new CreatePostoInput(
            clienteId,
            $"Posto {Guid.NewGuid().ToString()[..8]}",
            "01310-100",
            "Rua Teste",
            "123",
            null,
            "São Paulo",
            "SP");

        var response = await Client.PostAsJsonAsync("/api/postos", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<PostoDto>(response);
        return dto!.Id;
    }

    private async Task<AlocacaoDto> CriarAlocacaoAsync(Guid postoId, Guid contratoId, TimeSpan inicio, TimeSpan fim)
    {
        var input = new CreateAlocacaoInput
        {
            PostoId = postoId,
            ContratoId = contratoId,
            HorarioInicio = inicio,
            HorarioFim = fim,
            TipoEscala = TipoEscala.DOZE_POR_TRINTA_SEIS,
            PermiteDobrarEscala = true,
        };

        var response = await Client.PostAsJsonAsync("/api/alocacao", input);
        response.EnsureSuccessStatusCode();
        return (await ReadAsAsync<AlocacaoDto>(response))!;
    }

    private async Task<Guid> CriarFuncionarioAsync(Guid clienteId, Guid contratoId)
    {
        var input = new CreateFuncionarioDtoInput(
            clienteId,
            contratoId,
            $"Funcionario {Guid.NewGuid().ToString()[..8]}",
            GerarCpfFake(),
            "+5511999999999",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<FuncionarioDtoOutput>(response);
        return dto!.Id;
    }

    private async Task CriarDiariaAsync(Guid funcionarioId, AlocacaoDto alocacao, DateOnly data)
    {
        var input = new CreateDiariaDtoInput(
            funcionarioId,
            alocacao.Id,
            data,
            StatusDiaria.CONFIRMADA,
            TipoDiaria.REGULAR);

        var response = await Client.PostAsJsonAsync("/api/diarias", input);
        response.EnsureSuccessStatusCode();
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
}