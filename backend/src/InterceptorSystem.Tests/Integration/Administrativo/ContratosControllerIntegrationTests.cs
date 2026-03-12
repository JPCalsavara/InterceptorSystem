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

    [Fact(DisplayName = "POST /api/contratos - Deve criar contrato")]
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

    [Fact(DisplayName = "POST /api/contratos - Deve retornar 404 quando cliente não existe")]
    public async Task Post_DeveRetornar404_QuandoClienteNaoExiste()
    {
        var input = new CreateContratoDtoInput(
            Guid.NewGuid(),
            "Contrato Cliente Inexistente",
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

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/contratos - Deve retornar 400 com payload inválido")]
    public async Task Post_DeveRetornar400_QuandoPayloadInvalido()
    {
        var clienteId = await CriarClienteAsync();
        var input = new CreateContratoDtoInput(
            clienteId,
            "",
            -1,
            0,
            0.2m,
            -10,
            -0.1m,
            2,
            0.2m,
            0.08m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.PENDENTE);

        var response = await Client.PostAsJsonAsync("/api/contratos", input);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/contratos/{id} - Deve atualizar contrato")]
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

    [Fact(DisplayName = "PUT /api/contratos/{id} - Deve retornar 404 quando contrato não existe")]
    public async Task Put_DeveRetornar404_QuandoContratoNaoExiste()
    {
        var input = new UpdateContratoDtoInput(
            "Contrato Inexistente",
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

        var response = await Client.PutAsJsonAsync($"/api/contratos/{Guid.NewGuid()}", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/contratos/{id} - Deve retornar 400 com payload inválido")]
    public async Task Put_DeveRetornar400_QuandoPayloadInvalido()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);

        var input = new UpdateContratoDtoInput(
            "",
            0,
            -1,
            0.25m,
            -10,
            -0.22m,
            2,
            0.25m,
            0.1m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.ATIVO);

        var response = await Client.PutAsJsonAsync($"/api/contratos/{contrato.Id}", input);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/contratos/{id} - Deve remover contrato")]
    public async Task Delete_DeveRemoverContrato()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);

        var response = await Client.DeleteAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/contratos/{id} - Deve retornar 404 quando contrato não existe")]
    public async Task Delete_DeveRetornar404_QuandoContratoNaoExiste()
    {
        var response = await Client.DeleteAsync($"/api/contratos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/contratos/{id} - Deve retornar 404 ao deletar novamente")]
    public async Task Delete_DeveRetornar404_QuandoJaFoiDeletado()
    {
        var clienteId = await CriarClienteAsync();
        var contrato = await CriarContratoAsync(clienteId);

        var firstDelete = await Client.DeleteAsync($"/api/contratos/{contrato.Id}");
        var secondDelete = await Client.DeleteAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.NoContent, firstDelete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, secondDelete.StatusCode);
    }

    [Fact(DisplayName = "GET /api/contratos - Deve retornar lista")]
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

    [Fact(DisplayName = "GET /api/contratos - Deve retornar 200 com lista vazia")]
    public async Task GetAll_DeveRetornar200_ComListaVazia()
    {
        ClearDatabase();

        var response = await Client.GetAsync("/api/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Empty(result!);
    }

    [Fact(DisplayName = "GET /api/contratos/{id} - Deve retornar contrato")]
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

    [Fact(DisplayName = "GET /api/contratos/{id} - Deve retornar 404 quando contrato não existe")]
    public async Task Get_DeveRetornar404_QuandoContratoNaoExiste()
    {
        var response = await Client.GetAsync($"/api/contratos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/contratos/{id} - Deve retornar 400 quando id inválido")]
    public async Task Get_DeveRetornar400_QuandoIdInvalido()
    {
        var response = await Client.GetAsync("/api/contratos/id-invalido");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
