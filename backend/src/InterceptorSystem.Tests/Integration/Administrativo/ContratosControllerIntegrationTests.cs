using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class ContratosControllerIntegrationTests : IntegrationTestBase
{
    public ContratosControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<Guid> CriarClienteAsync()
    {
        var input = new CreateClienteDtoInput(
            $"Cliente Contrato {DateTime.Now.Ticks}",
            "00000000000000",
            "São Paulo",
            "SP"
        );
        var response = await Client.PostAsJsonAsync("/api/clientes", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ClienteDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<ContratoDtoOutput> CriarContratoAsync(Guid clienteId)
    {
        var input = new CreateContratoDtoInput(
            clienteId,
            "Contrato Teste",
            10000,
            500,
            0.2m,
            800,
            0.18m,
            2,
            0.15m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            StatusContrato.PENDENTE);

        var response = await Client.PostAsJsonAsync("/api/contratos", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<ContratoDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    [Fact]
    public async Task Post_DeveCriarContrato()
    {
        var clienteId = await CriarClienteAsync();
        var input = new CreateContratoDtoInput(
            clienteId,
            "Contrato Segurança",
            20000,
            800,
            0.2m,
            1200,
            0.2m,
            2,
            0.2m,
            0.08m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            StatusContrato.PENDENTE);

        var response = await Client.PostAsJsonAsync("/api/contratos", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        Assert.NotNull(result);
        Assert.Equal(input.Descricao, result!.Descricao);
    }

    [Fact]
    public async Task Put_DeveAtualizarContrato()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);
        var input = new UpdateContratoDtoInput(
            "Contrato Atualizado",
            25000,
            900,
            0.25m,
            1300,
            0.22m,
            2,
            0.25m,
            0.1m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(10)),
            StatusContrato.ATIVO);

        var response = await Client.PutAsJsonAsync($"/api/contratos/{contrato.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        Assert.NotNull(result);
        Assert.Equal(input.Descricao, result!.Descricao);
        Assert.Equal(StatusContrato.ATIVO, result.Status);
    }

    [Fact]
    public async Task Delete_DeveRemoverContrato()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);

        var response = await Client.DeleteAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_DeveRetornarLista()
    {
        var clienteId = await CriarClienteAsync();
        await CriarContratoAsync(clienteId);

        var response = await Client.GetAsync("/api/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.NotEmpty(result!);
    }

    [Fact]
    public async Task Get_DeveRetornarContrato()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);

        var response = await Client.GetAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        Assert.NotNull(result);
        Assert.Equal(contrato.Id, result!.Id);
    }
}
