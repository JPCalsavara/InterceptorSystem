using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

public class FuncionariosControllerIntegrationTests : IntegrationTestBase
{
    public FuncionariosControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    private async Task<Guid> CriarCondominioAsync()
    {
        var input = new CreateCondominioDtoInput(
            "Condomínio Func", 
            $"{DateTime.Now.Ticks % 100000000:00000000}/0001-55", 
            "Rua Func",
            10,
            TimeSpan.FromHours(6)
        );
        var response = await Client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<CondominioDtoOutput>(response);
        return dto!.Id;
    }

    // FASE 2: Criar contrato vigente para vincular funcionários
    private async Task<Guid> CriarContratoAsync(Guid condominioId)
    {
        var input = new CreateContratoDtoInput(
            condominioId,
            "Contrato Teste",
            10000m,  // ValorTotalMensal
            100m,    // ValorDiariaCobrada
            0.30m,   // PercentualAdicionalNoturno (30% = 0.30)
            500m,    // ValorBeneficiosExtrasMensal
            0.15m,   // PercentualImpostos (15% = 0.15)
            5,       // QuantidadeFuncionarios
            0.20m,   // MargemLucroPercentual (20% = 0.20)
            0.10m,   // MargemCoberturaFaltasPercentual (10% = 0.10)
            DateOnly.FromDateTime(DateTime.Today.AddMonths(-1)),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            StatusContrato.PAGO
        );
        var response = await Client.PostAsJsonAsync("/api/contratos", input);
        response.EnsureSuccessStatusCode();
        var dto = await ReadAsAsync<ContratoDtoOutput>(response);
        return dto!.Id;
    }

    private async Task<FuncionarioDtoOutput> CriarFuncionarioAsync(Guid condominioId)
    {
        var contratoId = await CriarContratoAsync(condominioId);
        
        // FASE 3: Sem parâmetros de salário (calculados automaticamente)
        var input = new CreateFuncionarioDtoInput(
            condominioId,
            contratoId,
            "Funcionario Teste",
            Guid.NewGuid().ToString(),
            "+5511999999999",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT);
        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        return await ReadAsAsync<FuncionarioDtoOutput>(response) ?? throw new InvalidOperationException();
    }

    private string GerarCpfFake() => $"{DateTime.Now.Ticks % 100000000000:00000000000}";

    // FASE 2: Helper para criar condomínio + contrato juntos
    private async Task<(Guid condominioId, Guid contratoId)> CriarCondominioComContratoAsync()
    {
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        return (condominioId, contratoId);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve criar funcionário quando dados válidos")]
    public async Task Post_DeveCriarFuncionario()
    {
        var (condominioId, contratoId) = await CriarCondominioComContratoAsync();
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(condominioId, contratoId, "Funcionario Teste", Guid.NewGuid().ToString(), "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 400 quando CPF duplicado")]
    public async Task Post_DeveFalhar_QuandoCpfDuplicado()
    {
        var (condominioId, contratoId) = await CriarCondominioComContratoAsync();
        var cpf = GerarCpfFake();
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(condominioId, contratoId, "Funcionario Teste", cpf, "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        await Client.PostAsJsonAsync("/api/funcionarios", input);

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/funcionarios - Deve retornar 404 quando condomínio inexistente")]
    public async Task Post_DeveFalhar_QuandoCondominioNaoExiste()
    {
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(Guid.NewGuid(), Guid.NewGuid(), "Funcionario Teste", GerarCpfFake(), "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

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
