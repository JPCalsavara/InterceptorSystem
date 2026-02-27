using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Infrastructure.Auth;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace InterceptorSystem.Tests.Integration.Auth;

/// <summary>
/// Factory sem TestAuthHandler - usa autenticação JWT real para testar o fluxo de login.
/// </summary>
public class AuthWebApplicationFactory : WebApplicationFactory<Program>
{
    private static int _counter = 0;
    private readonly string _databaseName;

    public AuthWebApplicationFactory()
    {
        System.Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        System.Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", "Testing");
        _databaseName = $"AuthTestDb_{Interlocked.Increment(ref _counter)}_{Guid.NewGuid()}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((hostingContext, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["App:FrontendBaseUrl"] = "http://localhost:4200"
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.EnableSensitiveDataLogging();
            });

            // Repositórios do domínio administrativo
            services.AddScoped<ICondominioRepository, CondominioRepository>();
            services.AddScoped<IPostoDeTrabalhoRepository, PostoDeTrabalhoRepository>();
            services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
            services.AddScoped<IAlocacaoRepository, AlocacaoRepository>();
            services.AddScoped<IContratoRepository, ContratoRepository>();

            // Repositório e serviços de autenticação
            services.AddScoped<IContaRepository, ContaRepository>();
            services.AddScoped<ITokenVerificacaoRepository, TokenVerificacaoRepository>();
            services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();

            // E-mail no-op para testes
            services.AddScoped<IEmailService, NoOpEmailService>();

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
        });
    }

    public HttpClient CreateUnauthenticatedClient()
    {
        return CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
    }

    public async Task<(HttpClient client, AuthResultDtoOutput auth)> CreateAuthenticatedClientAsync(
        string email = "test@empresa.com",
        string senha = "senha123456",
        string nomeEmpresa = "Empresa Teste")
    {
        var client = CreateUnauthenticatedClient();

        var registrarDto = new RegistrarContaDtoInput(email, senha, nomeEmpresa);
        var response = await client.PostAsJsonAsync("/api/auth/registrar", registrarDto);
        response.EnsureSuccessStatusCode();

        var auth = await response.Content.ReadFromJsonAsync<AuthResultDtoOutput>(
            new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
                Converters = { new JsonStringEnumConverter() }
            });

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth!.Token);

        return (client, auth!);
    }

    /// <summary>
    /// Busca o token de verificação mais recente e não usado de uma conta diretamente no banco de testes.
    /// Útil para simular o clique no link do e-mail sem precisar de um SMTP real.
    /// </summary>
    public string? ObterTokenVerificacao(Guid contaId, TipoTokenVerificacao tipo = TipoTokenVerificacao.EmailVerificacao)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return db.TokensVerificacao
            .Where(t => t.ContaId == contaId && t.Tipo == tipo && !t.Usado)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => t.Token)
            .FirstOrDefault();
    }
}
