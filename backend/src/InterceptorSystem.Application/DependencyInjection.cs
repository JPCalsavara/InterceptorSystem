using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.Services;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.Services;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace InterceptorSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // Registro dos Services de Aplicação
        services.AddScoped<IClienteAppService, ClienteAppService>();
        services.AddScoped<IPostoAppService, PostoAppService>();
        services.AddScoped<IFuncionarioAppService, FuncionarioAppService>();
        services.AddScoped<IDiariaAppService, DiariaAppService>();
        services.AddScoped<IContratoAppService, ContratoAppService>();
        services.AddScoped<IAlocacaoAppService, AlocacaoAppService>();
        services.AddScoped<ITagAppService, TagAppService>(); // Phase 4

        // FASE 5: Serviço Orquestrador para Criação em Cascata
        services.AddScoped<IClienteOrquestradorService, ClienteOrquestradorService>();

        // Auth
        services.AddScoped<IAuthAppService, AuthAppService>();

        // WhatsApp Bot
        services.AddScoped<IWhatsappBotService, WhatsappBotService>();
        services.AddScoped<SubstitutoRankerService>();

        return services;
    }
}
