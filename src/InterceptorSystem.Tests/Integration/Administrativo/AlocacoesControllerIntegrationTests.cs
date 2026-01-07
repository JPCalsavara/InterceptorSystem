using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class AlocacoesControllerIntegrationTests : IntegrationTestBase
{
    public AlocacoesControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<Guid> CriarCondominioAsync()
    {
        var input = new CreateCondominioDtoInput("Condomínio Aloc", $"{DateTime.Now.Ticks % 100000000:00000000}/0001-66", "Rua Aloc");
        var response = await Client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<CondominioDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<FuncionarioDtoOutput> CriarFuncionarioAsync(Guid condominioId)
    {
        var input = new CreateFuncionarioDtoInput(
            condominioId,
            "Funcionario Teste",
            Guid.NewGuid().ToString(),
            "+5511999999999",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT,
            2500,
            400,
            100);
        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<FuncionarioDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    private async Task<PostoDeTrabalhoDto> CriarPostoAsync(Guid condominioId)
    {
        var input = new CreatePostoInput(condominioId, TimeSpan.FromHours(6), TimeSpan.FromHours(18), 2, true);
        var response = await Client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<PostoDeTrabalhoDto>(response) ?? throw new InvalidOperationException();
    }

    private async Task<AlocacaoDtoOutput> CriarAlocacaoAsync(Guid funcionarioId, Guid postoId)
    {
        var input = new CreateAlocacaoDtoInput(
            funcionarioId,
            postoId,
            DateOnly.FromDateTime(DateTime.Today),
            StatusAlocacao.CONFIRMADA,
            TipoAlocacao.REGULAR);
        var response = await Client.PostAsJsonAsync("/api/alocacoes", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<AlocacaoDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    [Fact(DisplayName = "POST /api/alocacoes - Deve criar alocação quando dados válidos")]
    public async Task Post_DeveCriarAlocacao()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var posto = await CriarPostoAsync(condominioId);

        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);
        var response = await Client.PostAsJsonAsync("/api/alocacoes", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/alocacoes - Deve retornar 404 quando funcionário inexistente")]
    public async Task Post_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var condominioId = await CriarCondominioAsync();
        var posto = await CriarPostoAsync(condominioId);
        var input = new CreateAlocacaoDtoInput(Guid.NewGuid(), posto.Id, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        var response = await Client.PostAsJsonAsync("/api/alocacoes", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/alocacoes - Deve retornar 404 quando posto inexistente")]
    public async Task Post_DeveFalhar_QuandoPostoNaoExiste()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        var response = await Client.PostAsJsonAsync("/api/alocacoes", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/alocacoes/{id} - Deve retornar 200 quando existe")]
    public async Task GetById_DeveRetornar200()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var posto = await CriarPostoAsync(condominioId);
        var alocacao = await CriarAlocacaoAsync(funcionario.Id, posto.Id);

        var response = await Client.GetAsync($"/api/alocacoes/{alocacao.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/alocacoes/{id} - Deve retornar 404 quando não existe")]
    public async Task GetById_DeveRetornar404()
    {
        var response = await Client.GetAsync($"/api/alocacoes/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/alocacoes - Deve retornar lista")]
    public async Task GetAll_DeveRetornarLista()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var posto = await CriarPostoAsync(condominioId);
        await CriarAlocacaoAsync(funcionario.Id, posto.Id);

        var response = await Client.GetAsync("/api/alocacoes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/alocacoes/{id} - Deve atualizar alocação")]
    public async Task Put_DeveAtualizarAlocacao()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var posto = await CriarPostoAsync(condominioId);
        var alocacao = await CriarAlocacaoAsync(funcionario.Id, posto.Id);

        var input = new UpdateAlocacaoDtoInput(StatusAlocacao.CANCELADA, TipoAlocacao.SUBSTITUICAO);
        var response = await Client.PutAsJsonAsync($"/api/alocacoes/{alocacao.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/alocacoes/{id} - Deve retornar 404 quando alocação não existe")]
    public async Task Put_DeveRetornar404()
    {
        var input = new UpdateAlocacaoDtoInput(StatusAlocacao.CANCELADA, TipoAlocacao.SUBSTITUICAO);

        var response = await Client.PutAsJsonAsync($"/api/alocacoes/{Guid.NewGuid()}", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/alocacoes/{id} - Deve excluir alocação existente")]
    public async Task Delete_DeveExcluirAlocacao()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var posto = await CriarPostoAsync(condominioId);
        var alocacao = await CriarAlocacaoAsync(funcionario.Id, posto.Id);

        var response = await Client.DeleteAsync($"/api/alocacoes/{alocacao.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/alocacoes/{id} - Deve retornar 404 quando alocação inexistente")]
    public async Task Delete_DeveRetornar404()
    {
        var response = await Client.DeleteAsync($"/api/alocacoes/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
