using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Tests.Integration;

public class FuncionariosControllerIntegrationTests : IntegrationTestBase
{
    public FuncionariosControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<Guid> CriarCondominioAsync()
    {
        var input = new CreateCondominioDtoInput("Condomínio Func", $"{DateTime.Now.Ticks % 100000000:00000000}/0001-55", "Rua Func");
        var response = await Client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var dto = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        return dto!.Id;
    }

    private async Task<FuncionarioDtoOutput> CriarFuncionarioAsync(Guid condominioId)
    {
        var input = new CreateFuncionarioDtoInput(condominioId, "Funcionario Teste", Guid.NewGuid().ToString(), "Ativo", "12x36", "Porteiro", 2500, 400, 100);
        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<FuncionarioDtoOutput>() ?? throw new InvalidOperationException();
    }

    private string GerarCpfFake() => $"{DateTime.Now.Ticks % 100000000000:00000000000}";

    [Fact(DisplayName = "POST /api/funcionarios - Deve criar funcionário quando dados válidos")]
    public async Task Post_DeveCriarFuncionario()
    {
        var condominioId = await CriarCondominioAsync();
        var input = new CreateFuncionarioDtoInput(condominioId, "Funcionario Teste", Guid.NewGuid().ToString(), "Ativo", "12x36", "Porteiro", 2500, 400, 100);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 400 quando CPF duplicado")]
    public async Task Post_DeveFalhar_QuandoCpfDuplicado()
    {
        var condominioId = await CriarCondominioAsync();
        var cpf = GerarCpfFake();
        var input = new CreateFuncionarioDtoInput(condominioId, "Funcionario Teste", cpf, "Ativo", "12x36", "Porteiro", 2500, 400, 100);
        await Client.PostAsJsonAsync("/api/funcionarios", input);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 404 quando condomínio inexistente")]
    public async Task Post_DeveFalhar_QuandoCondominioNaoExiste()
    {
        var input = new CreateFuncionarioDtoInput(Guid.NewGuid(), "Funcionario Teste", GerarCpfFake(), "Ativo", "12x36", "Porteiro", 2500, 400, 100);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/funcionarios/{id} - Deve retornar 200 quando existe")]
    public async Task GetById_DeveRetornar200()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);

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
        var condominioId = await CriarCondominioAsync();
        await CriarFuncionarioAsync(condominioId);

        var response = await Client.GetAsync("/api/funcionarios");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/funcionarios/{id} - Deve atualizar funcionário")]
    public async Task Put_DeveAtualizarFuncionario()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);
        var input = new UpdateFuncionarioDtoInput("Atualizado", "Ativo", "12x36", "Porteiro", 2600, 420, 110);

        var response = await Client.PutAsJsonAsync($"/api/funcionarios/{funcionario.Id}", input);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/funcionarios/{id} - Deve retornar 404 quando funcionário não existe")]
    public async Task Put_DeveRetornar404_QuandoFuncionarioNaoExiste()
    {
        var input = new UpdateFuncionarioDtoInput("Atualizado", "Ativo", "12x36", "Porteiro", 2600, 420, 110);

        var response = await Client.PutAsJsonAsync($"/api/funcionarios/{Guid.NewGuid()}", input);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/funcionarios/{id} - Deve excluir funcionário existente")]
    public async Task Delete_DeveExcluirFuncionario()
    {
        var condominioId = await CriarCondominioAsync();
        var funcionario = await CriarFuncionarioAsync(condominioId);

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
