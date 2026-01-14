using InterceptorSystem.Api.Services;
using InterceptorSystem.Application;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Infrastructure;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURAÇÃO DE SERVIÇOS (DI) ---

// 1. Camadas da Arquitetura (Extension Methods)
// Em testes de integração, evitamos registrar o provider Npgsql da Infrastructure
if (builder.Environment.IsEnvironment("Testing"))
{
    // Registra apenas ApplicationDbContext com InMemory para testes
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("IntegrationTestsDb"));
}
else
{
    builder.Services.AddInfrastructure(builder.Configuration);
}

builder.Services.AddApplication();

// 2. Serviços da API (Presentation Layer)
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// 3. CORS - Permitir comunicação com Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 4. Serviço de Tenant (Especifico da API pois depende de HttpContext)
builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Em testes, o InMemory não usa migrações
        if (!builder.Environment.IsEnvironment("Testing") && context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocorreu um erro ao aplicar as migrações do banco de dados.");
    }
}

// --- PIPELINE HTTP ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS deve vir ANTES de UseHttpsRedirection e UseAuthorization
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Torna a classe Program acessível para testes de integração
public partial class Program { }
