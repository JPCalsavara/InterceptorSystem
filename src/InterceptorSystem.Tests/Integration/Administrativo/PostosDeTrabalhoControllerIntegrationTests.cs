using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de Integração do PostosDeTrabalhoController
/// Testa a API completa incluindo validação de 12 horas, turnos noturnos e banco de dados (In-Memory)
/// </summary>
public class PostosDeTrabalhoControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public PostosDeTrabalhoControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region Helper Methods

    private async Task<Guid> CriarCondominioTeste()
    {
        var input = new CreateCondominioDtoInput(
            Nome: $"Condomínio Teste {DateTime.Now.Ticks}",
            Cnpj: $"{DateTime.Now.Ticks % 100000000:00000000}/0001-{DateTime.Now.Millisecond:00}",
            Endereco: "Rua Teste"
        );
        
        var response = await _client.PostAsJsonAsync("/api/condominios", input);
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        return result!.Id;
    }

    #endregion

    #region POST /api/postos-de-trabalho - Create Tests

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve criar posto com turno diurno (6h às 18h)")]
    public async Task Create_DeveRetornar201_QuandoTurnoDiurno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var input = new CreatePostoInput(
            CondominioId: condominioId,
            HorarioInicio: new TimeSpan(6, 0, 0),
            HorarioFim: new TimeSpan(18, 0, 0)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(condominioId, result.CondominioId);
        Assert.Contains("06:00", result.Horario);
        Assert.Contains("18:00", result.Horario);
    }

    [Fact(DisplayName = "POST /api/postos-de-trabalho - Deve criar posto com turno noturno (18h às 6h)")]
    public async Task Create_DeveRetornar201_QuandoTurnoNoturno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var input = new CreatePostoInput(
            CondominioId: condominioId,
            HorarioInicio: new TimeSpan(18, 0, 0),
            HorarioFim: new TimeSpan(6, 0, 0)
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
        var input = new CreatePostoInput(
            CondominioId: condominioInexistente,
            HorarioInicio: new TimeSpan(6, 0, 0),
            HorarioFim: new TimeSpan(18, 0, 0)
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
        var input = new CreatePostoInput(
            CondominioId: condominioId,
            HorarioInicio: new TimeSpan(8, 0, 0),
            HorarioFim: new TimeSpan(16, 0, 0) // 8 horas
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("12 horas", errorResponse.ToLower());
    }

    #endregion

    #region GET /api/postos-de-trabalho/{id} - GetById Tests

    [Fact(DisplayName = "GET /api/postos-de-trabalho/{id} - Deve retornar 200 quando posto existe")]
    public async Task GetById_DeveRetornar200_QuandoPostoExiste()
    {
        // Arrange - Cria posto primeiro
        var condominioId = await CriarCondominioTeste();
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
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

    [Fact(DisplayName = "GET /api/postos-de-trabalho/{id} - Deve retornar 404 quando posto não existe")]
    public async Task GetById_DeveRetornar404_QuandoPostoNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho/{id} - Deve retornar 404 quando ID inválido")]
    public async Task GetById_DeveRetornar404_QuandoIdInvalido()
    {
        // Arrange
        var idInvalido = Guid.Empty;

        // Act
        var response = await _client.GetAsync($"/api/postos-de-trabalho/{idInvalido}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region GET /api/postos-de-trabalho - GetAll Tests

    [Fact(DisplayName = "GET /api/postos-de-trabalho - Deve retornar lista de postos")]
    public async Task GetAll_DeveRetornar200_ComListaDePostos()
    {
        // Arrange - Cria alguns postos
        var condominioId = await CriarCondominioTeste();
        
        var input1 = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
        var input2 = new CreatePostoInput(condominioId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0));
        
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

    [Fact(DisplayName = "GET /api/postos-de-trabalho - Deve retornar 200 mesmo quando lista vazia")]
    public async Task GetAll_DeveRetornar200_QuandoListaVazia()
    {
        // Act
        var response = await _client.GetAsync("/api/postos-de-trabalho");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<List<PostoDeTrabalhoDto>>();
        Assert.NotNull(result);
    }

    [Fact(DisplayName = "GET /api/postos-de-trabalho - Deve retornar postos com turnos diurnos e noturnos")]
    public async Task GetAll_DeveRetornarPostosComDiferentesTurnos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0)));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0)));

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
        
        // Postos do condomínio 1
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId1, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0)));
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId1, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0)));
        
        // Posto do condomínio 2
        await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId2, new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0)));

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

    #region PUT /api/postos-de-trabalho/{id} - Update Tests

    [Fact(DisplayName = "PUT /api/postos-de-trabalho/{id} - Deve atualizar posto de diurno para noturno")]
    public async Task Update_DeveRetornar200_QuandoAtualizaDiurnoParaNoturno()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        var updateInput = new UpdatePostoInput(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0));

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
        var updateInput = new UpdatePostoInput(new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));

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
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
        var createResponse = await _client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();

        var updateInput = new UpdatePostoInput(new TimeSpan(8, 0, 0), new TimeSpan(14, 0, 0)); // 6 horas

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
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
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

    [Fact(DisplayName = "DELETE /api/postos-de-trabalho/{id} - Deve retornar 404 quando posto não existe")]
    public async Task Delete_DeveRetornar404_QuandoPostoNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/postos-de-trabalho/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/postos-de-trabalho/{id} - Não deve afetar outros postos do condomínio")]
    public async Task Delete_NaoDeveAfetarOutrosPostos()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        
        var createResponse1 = await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0)));
        var posto1 = await createResponse1.Content.ReadFromJsonAsync<PostoDeTrabalhoDto>();
        
        var createResponse2 = await _client.PostAsJsonAsync("/api/postos-de-trabalho", 
            new CreatePostoInput(condominioId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0)));
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
        // 0. Criar condomínio
        var condominioId = await CriarCondominioTeste();

        // 1. CREATE - Turno Diurno
        var createInput = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0));
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

        // 4. UPDATE - Mudar para Turno Noturno
        var updateInput = new UpdatePostoInput(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0));
        var updateResponse = await _client.PutAsJsonAsync($"/api/postos-de-trabalho/{created.Id}", updateInput);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // 5. DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 6. Verifica que foi deletado
        var verifyResponse = await _client.GetAsync($"/api/postos-de-trabalho/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }

    #endregion
}

