using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace InterceptorSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Configuração do Banco de Dados
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        // 2. Registro dos Repositórios
        services.AddScoped<ICondominioRepository, CondominioRepository>();
        services.AddScoped<IPostoDeTrabalhoRepository, PostoDeTrabalhoRepository>();
        services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
        services.AddScoped<IAlocacaoRepository, AlocacaoRepository>();
        services.AddScoped<IContratoRepository, ContratoRepository>();
        

        // Dica: Podemos usar reflection aqui no futuro para registrar todos os repositórios de uma vez

        return services;
    }
}