using System;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InterceptorSystem.Tests.Integration;

/// <summary>
/// Factory customizado para criar uma aplicação de teste com banco de dados em memória
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private static int _databaseCounter = 0;
    private readonly string _databaseName;

    public CustomWebApplicationFactory()
    {
        // Força o ambiente de teste antes da construção do host
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", "Testing");
        // Cria um nome único para o banco de dados em memória
        _databaseName = $"InMemoryTestDb_{Interlocked.Increment(ref _databaseCounter)}_{Guid.NewGuid()}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            // Remove o DbContext configurado na aplicação (ex: Npgsql)
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();

            // Adiciona DbContext com banco de dados em memória único
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            });

            // Configura autenticação fake para testes
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

            // Remove políticas de autorização para testes
            services.AddAuthorization(options =>
            {
                options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });

            // Registra repositórios necessários para os services
            services.AddScoped<ICondominioRepository, CondominioRepository>();
            services.AddScoped<IPostoDeTrabalhoRepository, PostoDeTrabalhoRepository>();
            services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
            services.AddScoped<IAlocacaoRepository, AlocacaoRepository>();
            services.AddScoped<IContratoRepository, ContratoRepository>();

            // Garante que o banco de dados seja criado
            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<ApplicationDbContext>();
                
                // Garante que o banco está limpo e criado
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();
            }
        });
    }
}

/// <summary>
/// Handler de autenticação fake para testes
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Cria claims fake para testes
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim("EmpresaId", Guid.NewGuid().ToString()) // EmpresaId fake para multi-tenancy
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

