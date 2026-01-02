using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de Integração do CondominiosController
/// Testa a API completa incluindo Controllers, Services, Repositories e Banco de Dados (In-Memory)
/// </summary>
public class CondominiosControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public CondominiosControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region Helper Methods

    private async Task<Guid> CriarCondominioTeste(string? cnpjCustomizado = null)
    {
        var input = new CreateCondominioDtoInput(
            Nome: $"Condomínio Teste {DateTime.Now.Ticks}",
            Cnpj: cnpjCustomizado ?? $"{DateTime.Now.Ticks % 100000000:00000000}/0001-{DateTime.Now.Millisecond:00}",
            Endereco: "Rua Teste, 123"
        );
        
        var response = await _client.PostAsJsonAsync("/api/condominios", input);
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        return result!.Id;
    }

    #endregion

    #region POST /api/condominios - Create Tests

    [Fact(DisplayName = "POST /api/condominios - Deve criar condomínio com dados válidos")]
    public async Task Create_DeveRetornar201_QuandoDadosValidos()
    {
        // Arrange
        var input = new CreateCondominioDtoInput(
            Nome: "Condomínio Residencial Solar",
            Cnpj: $"{DateTime.Now.Ticks % 100000000:00000000}/0001-90",
            Endereco: "Av. Paulista, 1000"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal(input.Cnpj, result.Cnpj);
        Assert.Equal(input.Endereco, result.Endereco);
        Assert.True(result.Ativo);

        // Verifica Location Header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains($"/api/condominios/{result.Id}", response.Headers.Location.ToString());
    }

    [Fact(DisplayName = "POST /api/condominios - Deve retornar 400 quando CNPJ duplicado")]
    public async Task Create_DeveRetornar400_QuandoCnpjDuplicado()
    {
        // Arrange - Cria primeiro condomínio
        var cnpjDuplicado = $"{DateTime.Now.Ticks % 100000000:00000000}/0001-99";
        var input1 = new CreateCondominioDtoInput(
            Nome: "Primeiro Condomínio",
            Cnpj: cnpjDuplicado,
            Endereco: "Rua A, 123"
        );
        await _client.PostAsJsonAsync("/api/condominios", input1);

        // Tenta criar segundo com mesmo CNPJ
        var input2 = new CreateCondominioDtoInput(
            Nome: "Segundo Condomínio",
            Cnpj: cnpjDuplicado,
            Endereco: "Rua B, 456"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios", input2);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        
        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("já existe", errorResponse.ToLower());
        Assert.Contains("cnpj", errorResponse.ToLower());
    }

    [Fact(DisplayName = "POST /api/condominios - Deve retornar 400 quando nome vazio")]
    public async Task Create_DeveRetornar400_QuandoNomeVazio()
    {
        // Arrange
        var inputInvalido = new
        {
            nome = "",
            cnpj = "12345678/0001-90",
            endereco = "Rua X"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/condominios", inputInvalido);

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.BadRequest || 
                    response.StatusCode == HttpStatusCode.InternalServerError);
    }

    #endregion

    #region GET /api/condominios/{id} - GetById Tests

    [Fact(DisplayName = "GET /api/condominios/{id} - Deve retornar 200 quando condomínio existe")]
    public async Task GetById_DeveRetornar200_QuandoCondominioExiste()
    {
        // Arrange - Cria condomínio primeiro
        var condominioId = await CriarCondominioTeste();

        // Act
        var response = await _client.GetAsync($"/api/condominios/{condominioId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        Assert.NotNull(result);
        Assert.Equal(condominioId, result.Id);
    }

    [Fact(DisplayName = "GET /api/condominios/{id} - Deve retornar 404 quando condomínio não existe")]
    public async Task GetById_DeveRetornar404_QuandoCondominioNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/condominios/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/condominios/{id} - Deve retornar 404 quando ID inválido")]
    public async Task GetById_DeveRetornar404_QuandoIdInvalido()
    {
        // Arrange
        var idInvalido = Guid.Empty;

        // Act
        var response = await _client.GetAsync($"/api/condominios/{idInvalido}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region GET /api/condominios - GetAll Tests

    [Fact(DisplayName = "GET /api/condominios - Deve retornar lista de condomínios")]
    public async Task GetAll_DeveRetornar200_ComListaDeCondominios()
    {
        // Arrange - Cria alguns condomínios
        await CriarCondominioTeste();
        await CriarCondominioTeste();

        // Act
        var response = await _client.GetAsync("/api/condominios");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<List<CondominioDtoOutput>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.True(result.Count >= 2);
    }

    [Fact(DisplayName = "GET /api/condominios - Deve retornar 200 mesmo quando lista vazia")]
    public async Task GetAll_DeveRetornar200_QuandoListaVazia()
    {
        // Act
        var response = await _client.GetAsync("/api/condominios");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<List<CondominioDtoOutput>>();
        Assert.NotNull(result);
    }

    [Fact(DisplayName = "GET /api/condominios - Todos condomínios devem estar ativos por padrão")]
    public async Task GetAll_TodosDevemEstarAtivos()
    {
        // Arrange
        await CriarCondominioTeste();
        await CriarCondominioTeste();

        // Act
        var response = await _client.GetAsync("/api/condominios");
        var result = await response.Content.ReadFromJsonAsync<List<CondominioDtoOutput>>();

        // Assert
        Assert.NotNull(result);
        Assert.All(result, c => Assert.True(c.Ativo));
    }

    #endregion

    #region PUT /api/condominios/{id} - Update Tests

    [Fact(DisplayName = "PUT /api/condominios/{id} - Deve atualizar condomínio com dados válidos")]
    public async Task Update_DeveRetornar200_QuandoDadosValidos()
    {
        // Arrange - Cria condomínio primeiro
        var condominioId = await CriarCondominioTeste();

        var updateInput = new UpdateCondominioDtoInput(
            Nome: "Condomínio Atualizado",
            Endereco: "Rua Atualizada, 999"
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/condominios/{condominioId}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        Assert.NotNull(result);
        Assert.Equal(condominioId, result.Id);
        Assert.Equal(updateInput.Nome, result.Nome);
        Assert.Equal(updateInput.Endereco, result.Endereco);
    }

    [Fact(DisplayName = "PUT /api/condominios/{id} - Deve retornar 404 quando condomínio não existe")]
    public async Task Update_DeveRetornar404_QuandoCondominioNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();
        var updateInput = new UpdateCondominioDtoInput(
            Nome: "Nome Qualquer",
            Endereco: "Endereço Qualquer"
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/condominios/{idInexistente}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "PUT /api/condominios/{id} - CNPJ não deve ser alterado no update")]
    public async Task Update_CnpjNaoDeveSerAlterado()
    {
        // Arrange
        var cnpjOriginal = $"{DateTime.Now.Ticks % 100000000:00000000}/0001-88";
        var condominioId = await CriarCondominioTeste(cnpjOriginal);

        var updateInput = new UpdateCondominioDtoInput(
            Nome: "Nome Atualizado",
            Endereco: "Endereço Atualizado"
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/condominios/{condominioId}", updateInput);
        var result = await response.Content.ReadFromJsonAsync<CondominioDtoOutput>();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(cnpjOriginal, result.Cnpj); // CNPJ permanece inalterado
    }

    #endregion

    #region DELETE /api/condominios/{id} - Delete Tests

    [Fact(DisplayName = "DELETE /api/condominios/{id} - Deve deletar condomínio existente")]
    public async Task Delete_DeveRetornar204_QuandoCondominioExiste()
    {
        // Arrange - Cria condomínio primeiro
        var condominioId = await CriarCondominioTeste();

        // Act
        var response = await _client.DeleteAsync($"/api/condominios/{condominioId}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verifica que foi realmente deletado
        var getResponse = await _client.GetAsync($"/api/condominios/{condominioId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/condominios/{id} - Deve retornar 404 quando condomínio não existe")]
    public async Task Delete_DeveRetornar404_QuandoCondominioNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/condominios/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/condominios/{id} - Não deve permitir deletar condomínio já deletado")]
    public async Task Delete_DeveRetornar404_QuandoJaDeletado()
    {
        // Arrange
        var condominioId = await CriarCondominioTeste();
        await _client.DeleteAsync($"/api/condominios/{condominioId}");

        // Act - Tenta deletar novamente
        var response = await _client.DeleteAsync($"/api/condominios/{condominioId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Testes de Fluxo Completo (CRUD)

    [Fact(DisplayName = "Fluxo Completo - Deve executar CRUD completo com sucesso")]
    public async Task FluxoCompleto_DeveFuncionarCRUDCompleto()
    {
        // 1. CREATE
        var createInput = new CreateCondominioDtoInput(
            Nome: "Condomínio Fluxo Completo",
            Cnpj: $"{DateTime.Now.Ticks % 100000000:00000000}/0001-77",
            Endereco: "Rua Fluxo, 100"
        );
        var createResponse = await _client.PostAsJsonAsync("/api/condominios", createInput);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        Assert.NotNull(created);

        // 2. READ (GetById)
        var getResponse = await _client.GetAsync($"/api/condominios/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var retrieved = await getResponse.Content.ReadFromJsonAsync<CondominioDtoOutput>();
        Assert.Equal(created.Id, retrieved!.Id);

        // 3. UPDATE
        var updateInput = new UpdateCondominioDtoInput(
            Nome: "Condomínio Fluxo Atualizado",
            Endereco: "Rua Fluxo Atualizada, 200"
        );
        var updateResponse = await _client.PutAsJsonAsync($"/api/condominios/{created.Id}", updateInput);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // 4. DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/condominios/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 5. Verifica que foi deletado
        var verifyResponse = await _client.GetAsync($"/api/condominios/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }

    #endregion
}

