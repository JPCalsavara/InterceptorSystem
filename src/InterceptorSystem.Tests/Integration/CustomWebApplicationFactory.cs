using System;
using System.Threading;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Repositories;

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

            // Registra repositórios necessários para os services
            services.AddScoped<ICondominioRepository, CondominioRepository>();
            services.AddScoped<IPostoDeTrabalhoRepository, PostoDeTrabalhoRepository>();

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
