using InterceptorSystem.Api.Services;
using InterceptorSystem.Application;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURAÇÃO DE SERVIÇOS (DI) ---

// 1. Camadas da Arquitetura (Extension Methods)
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// 2. Serviços da API (Presentation Layer)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// 3. Serviço de Tenant (Especifico da API pois depende de HttpContext)
builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext>();
        
        // Aplica migrações pendentes automaticamente ao iniciar
        if (context.Database.GetPendingMigrations().Any())
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

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();