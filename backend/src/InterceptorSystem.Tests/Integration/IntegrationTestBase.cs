using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.Extensions.DependencyInjection;

namespace InterceptorSystem.Tests.Integration;

/// <summary>
/// Classe base para testes de integração com métodos auxiliares
/// </summary>
public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    protected Task<T?> ReadAsAsync<T>(HttpResponseMessage response) => response.Content.ReadFromJsonAsync<T>(JsonOptions);

    /// <summary>
    /// Limpa o banco de dados entre os testes
    /// </summary>
    protected void ClearDatabase()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
    }

    /// <summary>
    /// Obtém uma instância do DbContext para manipulação direta (arrange/assert)
    /// </summary>
    protected ApplicationDbContext GetDbContext()
    {
        var scope = Factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }
}
