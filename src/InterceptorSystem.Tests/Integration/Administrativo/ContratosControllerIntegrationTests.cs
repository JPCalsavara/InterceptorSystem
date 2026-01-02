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

    private async Task<Guid> CriarCondominioAsync()
    {
        var input = new CreateCondominioDtoInput(
            $"Condomínio Contrato {DateTime.Now.Ticks}",
            $"{DateTime.Now.Ticks % 100000000:00000000}/0001-55",
            "Rua Contrato, 1");
        var response = await Client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<CondominioDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<ContratoDtoOutput> CriarContratoAsync(Guid condominioId)
    {
        var input = new CreateContratoDtoInput(
            condominioId,
            "Contrato Teste",
            10000,
            500,
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
        var condominioId = await CriarCondominioAsync();
        var input = new CreateContratoDtoInput(
            condominioId,
            "Contrato Segurança",
            20000,
            800,
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
        var condominioId = await CriarCondominioAsync();
        var contrato = await CriarContratoAsync(condominioId);
        var input = new UpdateContratoDtoInput(
            "Contrato Atualizado",
            25000,
            900,
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(10)),
            StatusContrato.PAGO);

        var response = await Client.PutAsJsonAsync($"/api/contratos/{contrato.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        Assert.NotNull(result);
        Assert.Equal(input.Descricao, result!.Descricao);
        Assert.Equal(StatusContrato.PAGO, result.Status);
    }

    [Fact]
    public async Task Delete_DeveRemoverContrato()
    {
        var condominioId = await CriarCondominioAsync();
        var contrato = await CriarContratoAsync(condominioId);

        var response = await Client.DeleteAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_DeveRetornarLista()
    {
        var condominioId = await CriarCondominioAsync();
        await CriarContratoAsync(condominioId);

        var response = await Client.GetAsync("/api/contratos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<List<ContratoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.NotEmpty(result!);
    }

    [Fact]
    public async Task Get_DeveRetornarContrato()
    {
        var condominioId = await CriarCondominioAsync();
        var contrato = await CriarContratoAsync(condominioId);

        var response = await Client.GetAsync($"/api/contratos/{contrato.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        Assert.NotNull(result);
        Assert.Equal(contrato.Id, result!.Id);
    }
}

