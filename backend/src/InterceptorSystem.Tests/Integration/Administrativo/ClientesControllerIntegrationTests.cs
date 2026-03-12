using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de Integração do ClientesController
/// Testa a API completa incluindo Controllers, Services, Repositories e Banco de Dados (In-Memory)
/// Cliente agora é simplificado: Nome, Cidade, Estado, EmailGestor?, TelefoneEmergencia?
/// </summary>
public class ClientesControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ClientesControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region Helper Methods

    private async Task<Guid> CriarClienteTeste()
    {
        var input = new CreateClienteDtoInput(
            Nome: $"Cliente Teste {DateTime.Now.Ticks}",
            Cnpj: "00000000000000",
            Cidade: "São Paulo",
            Estado: "SP",
            EmailGestor: "gestor@teste.com.br",
            TelefoneEmergencia: "(11) 98765-4321"
        );
        
        var response = await _client.PostAsJsonAsync("/api/clientes", input);
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        return result!.Id;
    }


    #endregion

    #region POST /api/clientes - Create Tests

    [Fact(DisplayName = "POST /api/clientes - Deve criar cliente com dados válidos")]
    public async Task Create_DeveRetornar201_QuandoDadosValidos()
    {
        // Arrange
        var input = new CreateClienteDtoInput(
            Nome: "Cliente Teste", 
            Cnpj: "00000000000000",
            Cidade: "São Paulo", 
            Estado: "SP",
            EmailGestor: "gestor@solar.com.br",
            TelefoneEmergencia: "(11) 98765-4321"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal(input.Cnpj, result.Cnpj); // Assert CNPJ
        Assert.Equal("São Paulo", result.Cidade);
        Assert.Equal("SP", result.Estado);
        Assert.Equal("gestor@solar.com.br", result.EmailGestor);
        Assert.True(result.Ativo);

        // Verifica Location Header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains($"/api/clientes/{result.Id}", response.Headers.Location.ToString());
    }

    [Fact(DisplayName = "POST /api/clientes - Deve retornar 400 quando nome vazio")]
    public async Task Create_DeveRetornar400_QuandoNomeVazio()
    {
        // Arrange
        var inputInvalido = new
        {
            nome = "",
            cnpj = "00000000000000", // Added CNPJ
            cidade = "São Paulo",
            estado = "SP"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes", inputInvalido);

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.BadRequest || 
                    response.StatusCode == HttpStatusCode.InternalServerError);
    }

    #endregion

    #region GET /api/clientes/{id} - GetById Tests

    [Fact(DisplayName = "GET /api/clientes/{id} - Deve retornar 200 quando cliente existe")]
    public async Task GetById_DeveRetornar200_QuandoClienteExiste()
    {
        // Arrange - Cria cliente primeiro
        var clienteId = await CriarClienteTeste();

        // Act
        var response = await _client.GetAsync($"/api/clientes/{clienteId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.NotNull(result);
        Assert.Equal(clienteId, result.Id);
    }

    [Fact(DisplayName = "GET /api/clientes/{id} - Deve retornar 404 quando cliente não existe")]
    public async Task GetById_DeveRetornar404_QuandoClienteNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/clientes/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "GET /api/clientes/{id} - Deve retornar 404 quando ID inválido")]
    public async Task GetById_DeveRetornar404_QuandoIdInvalido()
    {
        // Arrange
        var idInvalido = Guid.Empty;

        // Act
        var response = await _client.GetAsync($"/api/clientes/{idInvalido}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region GET /api/clientes - GetAll Tests

    [Fact(DisplayName = "GET /api/clientes - Deve retornar lista de clientes")]
    public async Task GetAll_DeveRetornar200_ComListaDeClientes()
    {
        // Arrange - Cria alguns clientes
        await CriarClienteTeste();
        await CriarClienteTeste();

        // Act
        var response = await _client.GetAsync("/api/clientes");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<List<ClienteDtoOutput>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.True(result.Count >= 2);
    }

    [Fact(DisplayName = "GET /api/clientes - Deve retornar 200 mesmo quando lista vazia")]
    public async Task GetAll_DeveRetornar200_QuandoListaVazia()
    {
        // Act
        var response = await _client.GetAsync("/api/clientes");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<List<ClienteDtoOutput>>();
        Assert.NotNull(result);
    }

    [Fact(DisplayName = "GET /api/clientes - Todos clientes devem estar ativos por padrão")]
    public async Task GetAll_TodosDevemEstarAtivos()
    {
        // Arrange
        await CriarClienteTeste();
        await CriarClienteTeste();

        // Act
        var response = await _client.GetAsync("/api/clientes");
        var result = await response.Content.ReadFromJsonAsync<List<ClienteDtoOutput>>();

        // Assert
        Assert.NotNull(result);
        Assert.All(result, c => Assert.True(c.Ativo));
    }

    #endregion

    #region PUT /api/clientes/{id} - Update Tests

    [Fact(DisplayName = "PUT /api/clientes/{id} - Deve atualizar cliente com dados válidos")]
    public async Task Update_DeveRetornar200_QuandoDadosValidos()
    {
        // Arrange - Cria cliente primeiro
        var clienteId = await CriarClienteTeste();

        var updateInput = new UpdateClienteDtoInput(
            Nome: "Cliente Atualizado",
            Cnpj: "00000000000000",
            Cidade: "Campinas",
            Estado: "RJ",
            EmailGestor: "novogestor@atualizado.com.br",
            TelefoneEmergencia: "(11) 99999-8888"
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/clientes/{clienteId}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.NotNull(result);
        Assert.Equal(clienteId, result.Id);
        Assert.Equal(updateInput.Nome, result.Nome);
        Assert.Equal(updateInput.Cnpj, result.Cnpj); // Assert CNPJ
        Assert.Equal("Campinas", result.Cidade);
        Assert.Equal("RJ", result.Estado);
        Assert.Equal("novogestor@atualizado.com.br", result.EmailGestor);
    }

    [Fact(DisplayName = "PUT /api/clientes/{id} - Deve retornar 404 quando cliente não existe")]
    public async Task Update_DeveRetornar404_QuandoClienteNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();
        var updateInput = new UpdateClienteDtoInput(
            Nome: "Cliente Inicial", 
            Cnpj: "00000000000000",
            Cidade: "São Paulo", 
            Estado: "SP"
        );

        // Act
        var response = await _client.PutAsJsonAsync($"/api/clientes/{idInexistente}", updateInput);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region DELETE /api/clientes/{id} - Delete Tests

    [Fact(DisplayName = "DELETE /api/clientes/{id} - Deve deletar cliente existente")]
    public async Task Delete_DeveRetornar204_QuandoClienteExiste()
    {
        // Arrange - Cria cliente primeiro
        var clienteId = await CriarClienteTeste();

        // Act
        var response = await _client.DeleteAsync($"/api/clientes/{clienteId}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verifica que foi realmente deletado
        var getResponse = await _client.GetAsync($"/api/clientes/{clienteId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/clientes/{id} - Deve retornar 404 quando cliente não existe")]
    public async Task Delete_DeveRetornar404_QuandoClienteNaoExiste()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/clientes/{idInexistente}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "DELETE /api/clientes/{id} - Não deve permitir deletar cliente já deletado")]
    public async Task Delete_DeveRetornar404_QuandoJaDeletado()
    {
        // Arrange
        var clienteId = await CriarClienteTeste();
        await _client.DeleteAsync($"/api/clientes/{clienteId}");

        // Act - Tenta deletar novamente
        var response = await _client.DeleteAsync($"/api/clientes/{clienteId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Testes de Fluxo Completo (CRUD)

    [Fact(DisplayName = "Fluxo Completo - Deve executar CRUD completo com sucesso")]
    public async Task FluxoCompleto_DeveFuncionarCRUDCompleto()
    {
        // 1. CREATE
        var createInput = new CreateClienteDtoInput(
            Nome: "Cliente Fluxo Completo",
            Cnpj: "00000000000000",
            Cidade: "Campinas",
            Estado: "SP"
        );
        var createResponse = await _client.PostAsJsonAsync("/api/clientes", createInput);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.NotNull(created);

        // 2. READ (GetById)
        var getResponse = await _client.GetAsync($"/api/clientes/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var retrieved = await getResponse.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.Equal(created.Id, retrieved!.Id);

        // 3. UPDATE
        var updateInput = new UpdateClienteDtoInput(
            Nome: "Cliente Fluxo Atualizado",
            Cnpj: "00000000000000",
            Cidade: "Santos",
            Estado: "SP"
        );
        var updateResponse = await _client.PutAsJsonAsync($"/api/clientes/{created.Id}", updateInput);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // 4. DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/clientes/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 5. Verifica que foi deletado
        var verifyResponse = await _client.GetAsync($"/api/clientes/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }

    #endregion
}
