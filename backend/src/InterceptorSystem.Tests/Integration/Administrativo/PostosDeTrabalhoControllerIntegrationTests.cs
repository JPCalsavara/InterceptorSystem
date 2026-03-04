using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de Integração do PostosDeTrabalhoController
/// Testa a API completa incluindo validação de 12 horas, turnos noturnos e banco de dados (In-Memory)
/// </summary>
public class PostosDeTrabalhoControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public PostosDeTrabalhoControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    #region Helper Methods

    private async Task<Guid> CriarCondominioTeste()
    {
        var input = new CreateCondominioDtoInput(
            Nome: $"Condomínio Teste {DateTime.Now.Ticks}",
            Cnpj: $"{DateTime.Now.Ticks % 100000000:00000000}/0001-{Random.Shared.Next(10, 100)}",
            Endereco: "Rua Teste",
            QuantidadeIdealPorTurno: 10,
            HorarioTrocaTurno: TimeSpan.FromHours(6)
        );

        var response = await _client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        return result!.Id;
    }

    private async Task<Guid> CriarContratoTeste(Guid condominioId, int numeroDePostos = 2, StatusContrato status = StatusContrato.PENDENTE)
    {
        var input = new CreateContratoDtoInput(
            condominioId,
            "Contrato Teste",
            10000m,
            500m,
            0.2m,
            800m,
            0.18m,
            numeroDePostos,
            0.15m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            status);

        var response = await _client.PostAsJsonAsync("/api/contratos", input);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ContratoDtoOutput>(_jsonOptions);
        return result!.Id;
    }

    #endregion

    #region POST /api/postos-de-trabalho - Create Tests

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve criar posto com turno diurno (6h às 18h)")]
    public async Task Create_DeveRetornar201_QuandoTurnoDiurno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(
            condominioId,
            contratoId,
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(condominioId, result.CondominioId);
        Assert.Equal(contratoId, result.ContratoId);
        Assert.Contains("06:00", result.Horario);
        Assert.Contains("18:00", result.Horario);
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve criar posto com turno noturno (18h às 6h)")]
    public async Task Create_DeveRetornar201_QuandoTurnoNoturno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(
            condominioId,
            contratoId,
            new TimeSpan(18, 0, 0),
            new TimeSpan(6, 0, 0),
            false
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(result);
        Assert.Contains("18:00", result.Horario);
        Assert.Contains("06:00", result.Horario);
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 400 quando condomínio não existe")]
    public async Task Create_DeveRetornar400_QuandoCondominioNaoExiste()
    {
        // Arrange
        var condominioInexistente = Guid.NewGuid();
        var contratoInexistente = Guid.NewGuid();
        var input = new CreatePostoInput(
            CondominioId: condominioInexistente,
            ContratoId: contratoInexistente,
            HorarioInicio: new TimeSpan(6, 0, 0),
            HorarioFim: new TimeSpan(18, 0, 0),
            PermiteDobrarEscala: false
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("condomínio", errorResponse.ToLower());
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 400 quando duração não é 12 horas")]
    public async Task Create_DeveRetornar400_QuandoDuracaoInvalida()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(
            CondominioId: condominioId,
            ContratoId: contratoId,
            HorarioInicio: new TimeSpan(8, 0, 0),
            HorarioFim: new TimeSpan(16, 0, 0),
            PermiteDobrarEscala: false
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("12 horas", errorResponse.ToLower());
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 404 quando contrato não existe")]
    public async Task Create_DeveRetornar404_QuandoContratoNaoExiste()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoInexistente = Guid.NewGuid();
        var input = new CreatePostoInput(
            condominioId,
            contratoInexistente,
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 400 quando contrato não pertence ao condomínio")]
    public async Task Create_DeveRetornar400_QuandoContratoNaoPertenceAoCondominio()
    {
        // Arrange
        var condominioId1 = await CriarCondominioTeste();
        var condominioId2 = await CriarCondominioTeste();
        var contratoDoCondominio2 = await CriarContratoTeste(condominioId2);

        var input = new CreatePostoInput(
            condominioId1,         // condomínio diferente do contrato
            contratoDoCondominio2, // contrato pertence ao condomínio 2
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("não pertence ao condomínio", errorResponse);
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 400 quando contrato está FINALIZADO")]
    public async Task Create_DeveRetornar400_QuandoContratoFinalizado()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoFinalizadoId = await CriarContratoTeste(condominioId, status: StatusContrato.FINALIZADO);

        var input = new CreatePostoInput(
            condominioId,
            contratoFinalizadoId,
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("ativo ou pendente", errorResponse.ToLower());
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve retornar 400 quando limite de postos do contrato é atingido")]
    public async Task Create_DeveRetornar400_QuandoLimiteDePostosAtingido()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2); // limite = 2 (mínimo permitido pelo domínio)

        // Cria os 2 postos permitidos (esgota o limite)
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", new CreatePostoInput(
            condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0)));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", new CreatePostoInput(
            condominioId, contratoId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0)));

        // Tenta criar mais um posto além do limite
        var input = new CreatePostoInput(
            condominioId,
            contratoId,
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("Limite de postos", errorResponse);
    }

    #endregion

    #region GET /api/postos-de-trabalho/{id} - GetById Tests

    [Fact(DisplayName = "GET /api/postos-de-trabalho/{id} - Deve retornar 200 quando posto existe")]
    public async Task GetById_DeveRetornar200_QuandoPostoExiste()
    {
        // Arrange - Cria posto primeiro
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/{created!.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho - Deve retornar lista de postos")]
    public async Task GetAll_DeveRetornar200_ComListaDePostos()
    {
        // Arrange - Cria alguns postos
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2);

        var input1 = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var input2 = new CreatePostoInput(condominioId, contratoId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true);

        await _client.PostAsJsonAsync("/api/postos-de-trabalho", input1);
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", input2);

        // Act
        var response = await _client.GetAsync("/api/postos-de-trabalho");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.True(result.Count >= 2);
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho - Deve retornar postos com turnos diurnos e noturnos")]
    public async Task GetAll_DeveRetornarPostosComDiferentesTurnos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2);

        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true));

        // Act
        var response = await _client.GetAsync("/api/postos-de-trabalho");
        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();

        // Assert
        Assert.NotNull(result);
        Assert.Contains(result, p => p.Horario.Contains("06:00") && p.Horario.Contains("18:00"));
        Assert.Contains(result, p => p.Horario.Contains("18:00") && p.Horario.Contains("06:00"));
    }

    #endregion

    #region GET /api/postos-de-trabalho/condominio/{id} - GetByCondominio Tests

    [Fact(DisplayName = "GET /api/postos-de-trabalho/condominio/{id} - Deve retornar postos do condomínio")]
    public async Task GetByCondominio_DeveRetornar200_ComPostosDoCondominio()
    {
        // Arrange
        var condominioId1 = await CriarCondominioTeste();
        var condominioId2 = await CriarCondominioTeste();
        var contratoId1 = await CriarContratoTeste(condominioId1, numeroDePostos: 2);
        var contratoId2 = await CriarContratoTeste(condominioId2, numeroDePostos: 2);

        // Postos do condomínio 1
        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId1, contratoId1, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId1, contratoId1, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId2, contratoId2, new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0), false));

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/condominio/{condominioId1}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.Equal(condominioId1, p.CondominioId));
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho/condominio/{id} - Deve retornar lista vazia quando não há postos")]
    public async Task GetByCondominio_DeveRetornarListaVazia_QuandoNaoHaPostos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/condominio/{condominioId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho/condominio/{id} - Deve retornar 200 mesmo para condomínio inexistente")]
    public async Task GetByCondominio_DeveRetornar200_QuandoCondominioNaoExiste()
    {
        // Arrange
        var condominioInexistente = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/condominio/{condominioInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion

    #region GET /api/postos-de-trabalho/contrato/{contratoId} - GetByContrato Tests

    [Fact(DisplayName = "GET /api/postos-de-trabalho/contrato/{contratoId} - Deve retornar postos do contrato")]
    public async Task GetByContrato_DeveRetornar200_ComPostosDoContrato()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2);

        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true));

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/contrato/{contratoId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.Equal(contratoId, p.ContratoId));
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho/contrato/{contratoId} - Deve retornar lista vazia quando não há postos")]
    public async Task GetByContrato_DeveRetornarListaVazia_QuandoNaoHaPostos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/contrato/{contratoId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion

    #region PUT /api/postos-de-trabalho/{id} - Update Tests

    [Fact(DisplayName = "PUT /api/postos-de-trabalho/{id} - Deve atualizar posto de diurno para noturno")]
    public async Task Update_DeveRetornar200_QuandoAtualizaDiurnoParaNoturno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        var updateInput = new UpdatePostoInput(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/postos-de-trabalho/{created!.Id}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(result);
        Assert.Contains("18:00", result.Horario);
        Assert.Contains("06:00", result.Horario);
    }

    [Fact(DisplayName = "PUT /api/postos-de-trabalho/{id} - Deve retornar 404 quando posto não existe")]
    public async Task Update_DeveRetornar404_QuandoPostoNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();
        var updateInput = new UpdatePostoInput(new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/postos-de-trabalho/{idInexistente}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/postos-de-trabalho/{id} - Deve retornar 400 quando duração inválida")]
    public async Task Update_DeveRetornar400_QuandoDuracaoInvalida()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        var updateInput = new UpdatePostoInput(new TimeSpan(8, 0, 0), new TimeSpan(14, 0, 0), false); // 6 horas

        // Act
        var response = await _client.PutAsJsonAsync($"/api/postos-de-trabalho/{created!.Id}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region DELETE /api/postos-de-trabalho/{id} - Delete Tests

    [Fact(DisplayName = "DELETE /api/postos-de-trabalho/{id} - Deve deletar posto existente")]
    public async Task Delete_DeveRetornar204_QuandoPostoExiste()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId);
        var input = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        // Act
        var response = await _client.DeleteAsync($"/api/postos-de-trabalho/{created!.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verifica que foi realmente deletado
        var getResponse = await _client.GetAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/postos-de-trabalho/{id} - Não deve afetar outros postos do condomínio")]
    public async Task Delete_NaoDeveAfetarOutrosPostos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2);

        var createResponse1 = await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true));
        var posto1 = await createResponse1.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        var createResponse2 = await _client.PostAsJsonAsync("/api/postos-de-trabalho",
            new CreatePostoInput(condominioId, contratoId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true));
        var posto2 = await createResponse2.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        // Act - Deleta apenas o primeiro
        await _client.DeleteAsync($"/api/postos-de-trabalho/{posto1!.Id}");

        // Assert - Segundo posto ainda existe
        var getResponse = await _client.GetAsync($"/api/postos-de-trabalho/{posto2!.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
    }

    #endregion

    #region Testes de Fluxo Completo (CRUD)

    [Fact(DisplayName = "Fluxo Completo - Deve executar CRUD completo de posto com diferentes turnos")]
    public async Task FluxoCompleto_DeveFuncionarCRUDCompletoComDiferentesTurnos()
    {
        // 0. Criar condomínio e contrato
        var condominioId = await CriarCondominioTeste();
        var contratoId = await CriarContratoTeste(condominioId, numeroDePostos: 2);

        // 1. CREATE - Turno Diurno
        var createInput = new CreatePostoInput(condominioId, contratoId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", createInput);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(created);

        // 2. READ (GetById)
        var getResponse = await _client.GetAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        // 3. READ (GetByCondominio)
        var getByCondoResponse = await _client.GetAsync($"/api/postos-de-trabalho/condominio/{condominioId}");
        Assert.Equal(HttpStatusCode.OK, getByCondoResponse.StatusCode);
        var postosDoCondo = await getByCondoResponse.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.Contains(postosDoCondo!, p => p.Id == created.Id);

        // 4. READ (GetByContrato)
        var getByContratoResponse = await _client.GetAsync($"/api/postos-de-trabalho/contrato/{contratoId}");
        Assert.Equal(HttpStatusCode.OK, getByContratoResponse.StatusCode);
        var postosDoContrato = await getByContratoResponse.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.Contains(postosDoContrato!, p => p.Id == created.Id);

        // 5. UPDATE - Mudar para Turno Noturno
        var updateInput = new UpdatePostoInput(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true);
        var updateResponse = await _client.PutAsJsonAsync($"/api/postos-de-trabalho/{created.Id}", updateInput);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // 6. DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 7. Verifica que foi deletado
        var verifyResponse = await _client.GetAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }

    #endregion
}
