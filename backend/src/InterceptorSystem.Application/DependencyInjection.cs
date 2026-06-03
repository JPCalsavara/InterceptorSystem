using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Application.BoundedContexts.Auth.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Auth.Services;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Services;
using InterceptorSystem.Application.BoundedContexts.SystemAdmin.Interfaces;
using InterceptorSystem.Application.BoundedContexts.SystemAdmin.Services;
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
        services.AddScoped<IContratoCalculoService, ContratoCalculoService>();
        services.AddScoped<IContratoTagService, ContratoTagService>();
        services.AddScoped<IContratoCustoRealAppService, ContratoCustoRealAppService>();
        services.AddScoped<IAlocacaoAppService, AlocacaoAppService>();
        services.AddScoped<ITagAppService, TagAppService>(); // Phase 4

        // FASE 5: Serviço Orquestrador para Criação em Cascata
        services.AddScoped<IClienteOrquestradorService, ClienteOrquestradorService>();

        // Auth
        services.AddScoped<IAuthAppService, AuthAppService>();

        // WhatsApp Bot
        services.AddScoped<IWhatsappBotService, WhatsappBotService>();
        services.AddScoped<IWhatsappAdminService, WhatsappAdminService>();
        services.AddScoped<ISystemAdminAppService, SystemAdminAppService>();

        return services;
    }
}
