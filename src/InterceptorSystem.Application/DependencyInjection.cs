using InterceptorSystem.Application.Modulos.Administrativo.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InterceptorSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Registro dos Services de Aplicação
        services.AddScoped<ICondominioAppService, CondominioAppService>();
        
        // Aqui também entra: AutoMapper, MediatR, FluentValidation se formos usar
        
        return services;
    }
}