using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de Integração do PostosController
/// Posto agora é apenas locação física (Nome, Endereço, Cidade, Estado).
/// Testes de scheduling/turnos pertencem a AlocacaoController.
/// </summary>
public class PostosControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public PostosControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    #region Helper Methods

    private async Task<Guid> CriarClienteTeste()
    {
        var input = new CreateClienteDtoInput(
            "Cliente Aloc", 
            "11222333000181",
            "São Paulo",
            "SP"
        );

        var response = await _client.PostAsJsonAsync("/api/clientes", input);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>(_jsonOptions);
        return result!.Id;
    }

    private async Task<PostoDto> CriarPostoTeste(Guid clienteId, string nome = "Portaria A")
    {
        var input = new CreatePostoInput(clienteId, nome, "01310-100", "Rua Teste", "123", null, "São Paulo", "SP");
        var response = await _client.PostAsJsonAsync("/api/postos", input);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions))!;
    }

    #endregion

    #region POST /api/postos - Create Tests

    [Fact(DisplayName = "POST /api/postos - Deve criar posto com dados válidos")]
    public async Task Create_DeveRetornar201_QuandoDadosValidos()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        var input = new CreatePostoInput(clienteId, "Portaria Principal", "01310-100", "Av. Paulista", "1000", "Conj. 10", "São Paulo", "SP");

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(clienteId, result.ClienteId);
        Assert.Equal("Portaria Principal", result.Nome);
        Assert.Equal("01310100", result.Cep);
        Assert.Equal("Av. Paulista", result.Endereco);
        Assert.Equal("1000", result.Numero);
        Assert.Equal("Conj. 10", result.Complemento);
        Assert.Equal("São Paulo", result.Cidade);
        Assert.Equal("SP", result.Estado);
        Assert.True(result.Ativo);
    }

    [Fact(DisplayName = "POST /api/postos - Deve retornar 400 quando cliente não existe")]
    public async Task Create_DeveRetornar400_QuandoClienteNaoExiste()
    {
        // Arrange
        var clienteInexistente = Guid.NewGuid();
        var input = new CreatePostoInput(clienteInexistente, "Portaria A", "01310-100", "Rua X", "10", null, "São Paulo", "SP");

        // Act
        var response = await _client.PostAsJsonAsync("/api/postos", input);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errorResponse = await response.Content.ReadAsStringAsync();
        Assert.Contains("cliente", errorResponse.ToLower());
    }

    #endregion

    #region GET /api/postos/{id} - GetById Tests

    [Fact(DisplayName = "GET /api/postos/{id} - Deve retornar 200 quando posto existe")]
    public async Task GetById_DeveRetornar200_QuandoPostoExiste()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        var created = await CriarPostoTeste(clienteId);

        // Act
        var response = await _client.GetAsync($"/api/postos/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.NotNull(result);
        Assert.Equal(created.Id, result.Id);
    }

    [Fact(DisplayName = "GET /api/postos - Deve retornar lista de postos")]
    public async Task GetAll_DeveRetornar200_ComListaDePostos()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        await CriarPostoTeste(clienteId, "Portaria A");
        await CriarPostoTeste(clienteId, "Portaria B");

        // Act
        var response = await _client.GetAsync("/api/postos");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDto>>(_jsonOptions);
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.True(result.Count >= 2);
    }

    #endregion

    #region GET /api/postos/cliente/{id} - GetByCliente Tests

    [Fact(DisplayName = "GET /api/postos/cliente/{id} - Deve retornar postos do cliente")]
    public async Task GetByCliente_DeveRetornar200_ComPostosDoCliente()
    {
        // Arrange
        var clienteId1 = await CriarClienteTeste();
        var clienteId2 = await CriarClienteTeste();

        await CriarPostoTeste(clienteId1, "Portaria A");
        await CriarPostoTeste(clienteId1, "Portaria B");
        await CriarPostoTeste(clienteId2, "Portaria C");

        // Act
        var response = await _client.GetAsync($"/api/clientes/{clienteId1}/postos");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDto>>(_jsonOptions);
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.Equal(clienteId1, p.ClienteId));
    }

    [Fact(DisplayName = "GET /api/postos/cliente/{id} - Deve retornar lista vazia quando não há postos")]
    public async Task GetByCliente_DeveRetornarListaVazia_QuandoNaoHaPostos()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();

        // Act
        var response = await _client.GetAsync($"/api/clientes/{clienteId}/postos");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<PostoDto>>(_jsonOptions);
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion

    #region PUT /api/postos/{id} - Update Tests

    [Fact(DisplayName = "PUT /api/postos/{id} - Deve atualizar posto com dados válidos")]
    public async Task Update_DeveRetornar200_QuandoDadosValidos()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        var created = await CriarPostoTeste(clienteId);

        var updateInput = new UpdatePostoInput("Portaria Atualizada", "13010-111", "Rua Nova", "456", "Bloco B", "Campinas", "SP");

        // Act
        var response = await _client.PutAsJsonAsync($"/api/postos/{created.Id}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.NotNull(result);
        Assert.Equal("Portaria Atualizada", result.Nome);
        Assert.Equal("13010111", result.Cep);
        Assert.Equal("Rua Nova", result.Endereco);
        Assert.Equal("456", result.Numero);
        Assert.Equal("Bloco B", result.Complemento);
        Assert.Equal("Campinas", result.Cidade);
    }

    [Fact(DisplayName = "PUT /api/postos/{id} - Deve retornar 404 quando posto não existe")]
    public async Task Update_DeveRetornar404_QuandoPostoNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();
        var updateInput = new UpdatePostoInput("Nome", "01310-100", "Endereço", "10", null, "Cidade", "SP");

        // Act
        var response = await _client.PutAsJsonAsync($"/api/postos/{idInexistente}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region DELETE /api/postos/{id} - Delete Tests

    [Fact(DisplayName = "DELETE /api/postos/{id} - Deve deletar posto existente")]
    public async Task Delete_DeveRetornar204_QuandoPostoExiste()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        var created = await CriarPostoTeste(clienteId);

        // Act
        var response = await _client.DeleteAsync($"/api/postos/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verifica que foi desativado (soft delete)
        var getResponse = await _client.GetAsync($"/api/postos/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var result = await getResponse.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.False(result!.Ativo);
    }

    [Fact(DisplayName = "DELETE /api/postos/{id} - Não deve afetar outros postos do cliente")]
    public async Task Delete_NaoDeveAfetarOutrosPostos()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        var posto1 = await CriarPostoTeste(clienteId, "Portaria A");
        var posto2 = await CriarPostoTeste(clienteId, "Portaria B");

        // Act - Deleta apenas o primeiro
        await _client.DeleteAsync($"/api/postos/{posto1.Id}");

        // Assert - Segundo posto ainda existe
        var getResponse = await _client.GetAsync($"/api/postos/{posto2.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
    }

    #endregion

    #region Testes de Fluxo Completo (CRUD)

    [Fact(DisplayName = "Fluxo Completo - Deve executar CRUD completo de posto")]
    public async Task FluxoCompleto_DeveFuncionarCRUDCompleto()
    {
        // 0. Criar cliente
        var clienteId = await CriarClienteTeste();

        // 1. CREATE
        var createInput = new CreatePostoInput(clienteId, "Portaria Fluxo", "01310-100", "Rua A", "100", null, "São Paulo", "SP");
        var createResponse = await _client.PostAsJsonAsync("/api/postos", createInput);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.NotNull(created);

        // 2. READ (GetById)
        var getResponse = await _client.GetAsync($"/api/postos/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        // 3. READ (GetByCliente)
        var getByClienteResponse = await _client.GetAsync($"/api/clientes/{clienteId}/postos");
        Assert.Equal(HttpStatusCode.OK, getByClienteResponse.StatusCode);
        var postosDoCliente = await getByClienteResponse.Content.ReadFromJsonAsync<List<PostoDto>>(_jsonOptions);
        Assert.Contains(postosDoCliente!, p => p.Id == created.Id);

        // 4. UPDATE
        var updateInput = new UpdatePostoInput("Portaria Atualizada", "13010-111", "Rua B", "200", null, "Campinas", "SP");
        var updateResponse = await _client.PutAsJsonAsync($"/api/postos/{created.Id}", updateInput);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // 5. DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/postos/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 6. Verifica que foi desativado (soft delete)
        var verifyResponse = await _client.GetAsync($"/api/postos/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, verifyResponse.StatusCode);
        var verified = await verifyResponse.Content.ReadFromJsonAsync<PostoDto>(_jsonOptions);
        Assert.False(verified!.Ativo);
    }

    #endregion
}
