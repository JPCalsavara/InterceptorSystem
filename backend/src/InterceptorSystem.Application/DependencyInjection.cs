using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.Services;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InterceptorSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Registro dos Services de Aplicação
        services.AddScoped<ICondominioAppService, CondominioAppService>();
        services.AddScoped<IPostoDeTrabalhoAppService, PostoDeTrabalhoAppService>();
        services.AddScoped<IFuncionarioAppService, FuncionarioAppService>();
        services.AddScoped<IAlocacaoAppService, AlocacaoAppService>();
        services.AddScoped<IContratoAppService, ContratoAppService>();

        // FASE 5: Serviço Orquestrador para Criação em Cascata
        services.AddScoped<ICondominioOrquestradorService, CondominioOrquestradorService>();

        // Auth
        services.AddScoped<IAuthAppService, AuthAppService>();

        // WhatsApp Bot
        services.AddScoped<IWhatsappBotService, WhatsappBotService>();
        services.AddScoped<SubstitutoRankerService>();

        return services;
    }
}
