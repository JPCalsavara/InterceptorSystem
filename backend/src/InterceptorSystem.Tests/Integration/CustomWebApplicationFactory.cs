using System;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Infrastructure.Auth;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace InterceptorSystem.Tests.Integration;

/// <summary>
/// EmpresaId fixo compartilhado por todos os testes de integração.
/// Garante que todos os requests dentro de uma sessão de testes pertencem ao mesmo tenant.
/// </summary>
public static class TestTenant
{
    public static readonly Guid EmpresaId = Guid.Parse("d3b07384-d9a1-4d3b-923f-561917637840");
}

/// <summary>
/// Implementação no-op do IEmailService para testes (não envia e-mails de verdade).
/// </summary>
public class NoOpEmailService : IEmailService
{
    public Task EnviarVerificacaoEmailAsync(string destinatario, string nomeEmpresa, string link) => Task.CompletedTask;
    public Task EnviarResetSenhaAsync(string destinatario, string nomeEmpresa, string link) => Task.CompletedTask;
    public Task EnviarConfirmacaoAlteracaoEmailAsync(string destinatario, string nomeEmpresa, string link) => Task.CompletedTask;
}

/// <summary>
/// Factory customizado para criar uma aplicação de teste com banco de dados em memória.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private static int _databaseCounter = 0;
    private readonly string _databaseName;

    public CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", "Testing");
        _databaseName = $"InMemoryTestDb_{Interlocked.Increment(ref _databaseCounter)}_{Guid.NewGuid()}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        // Fornecer configurações válidas para IOptions + ValidateOnStart (SEC-2)
        builder.ConfigureAppConfiguration((hostingContext, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestKeyMuitoGrandeParaPassarValidacao1234567890!@#$%^&*",
                ["Jwt:Issuer"] = "InterceptorSystem.Tests",
                ["Jwt:Audience"] = "InterceptorSystem.Tests",
                ["Jwt:ExpiresInHours"] = "24",
                ["Smtp:Host"] = "localhost",
                ["Smtp:Port"] = "587",
                ["Smtp:Username"] = "test@test.com",
                ["Smtp:Password"] = "test-password",
                ["Smtp:FromAddress"] = "noreply@test.com",
                ["Smtp:FromName"] = "Test System",
                ["Meta:PhoneNumberId"] = "test-phone-id",
                ["Meta:AccessToken"] = "test-access-token",
                ["Meta:WebhookVerifyToken"] = "test-verify-token",
                ["App:FrontendBaseUrl"] = "http://localhost:4200"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove o DbContext configurado na aplicação (ex: Npgsql)
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();

            // Adiciona DbContext com banco de dados em memória único por factory
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

            // Garante que o banco de dados seja criado
            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();
            }
        });
    }
}

/// <summary>
/// Handler de autenticação fake para testes.
/// Usa um EmpresaId fixo e o claim "empresaId" (lowercase) para corresponder ao CurrentTenantService.
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
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            // "empresaId" lowercase para corresponder ao CurrentTenantService
            new Claim("empresaId", TestTenant.EmpresaId.ToString()),
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
