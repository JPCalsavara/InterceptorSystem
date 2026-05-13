using System.Reflection;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Auth.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;
using InterceptorSystem.Infrastructure.Adapters.Auth;
using InterceptorSystem.Infrastructure.Adapters.Email;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using InterceptorSystem.Infrastructure.Adapters.Whatsapp;
using InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices;
using InterceptorSystem.Infrastructure.Caching.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
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

        // 2. Registro dos Repositórios Base
        services.AddScoped<ClienteRepository>();
        services.AddScoped<ContratoRepository>();
        services.AddScoped<FuncionarioRepository>();
        services.AddScoped<PostoRepository>();
        services.AddScoped<AlocacaoRepository>();
        services.AddScoped<DiariaRepository>();
        
        // 2.2 Registro dos Decorators de Cache (Implementam a interface e envelopam a base)
        services.AddScoped<IClienteRepository>(provider => 
            new CachedClienteRepository(
                provider.GetRequiredService<ClienteRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IContratoRepository>(provider => 
            new CachedContratoRepository(
                provider.GetRequiredService<ContratoRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IFuncionarioRepository>(provider => 
            new CachedFuncionarioRepository(
                provider.GetRequiredService<FuncionarioRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IPostoRepository>(provider => 
            new CachedPostoRepository(
                provider.GetRequiredService<PostoRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IAlocacaoRepository>(provider =>
            new CachedAlocacaoRepository(
                provider.GetRequiredService<AlocacaoRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IDiariaRepository>(provider =>
            new CachedDiariaRepository(
                provider.GetRequiredService<DiariaRepository>(),
                provider.GetRequiredService<IMemoryCache>(),
                provider.GetRequiredService<ICurrentTenantService>()));

        services.AddScoped<IContaRepository, ContaRepository>();
        services.AddScoped<ITokenVerificacaoRepository, TokenVerificacaoRepository>();
        services.AddScoped<ITagRepository, TagRepository>();

        // 3. Auth Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();

        // 4. Email Service
        services.AddScoped<IEmailService, SmtpEmailService>();

        // 5. WhatsApp Bot
        services.AddScoped<ISessaoWhatsappRepository, SessaoWhatsappRepository>();
        services.AddScoped<IContaLookupPort, ContaLookupAdapter>();
        services.AddScoped<IOperacoesQueryPort, OperacoesQueryAdapter>();
        services.AddScoped<IWhatsappMessageSender, MetaWhatsappMessageSender>();
        services.AddHttpClient<MetaWhatsappMessageSender>();

        // Register WhatsApp background cleanup service conditionally.
        // This allows disabling it in production until DB migrations are confirmed applied
        // by setting configuration key `Whatsapp:EnableCleanup` to false.
        var enableWhatsappCleanup = configuration.GetValue<bool?>("Whatsapp:EnableCleanup") ?? true;
        if (enableWhatsappCleanup)
        {
            services.AddHostedService<SessaoExpiradaCleanupService>();
        }

        // 6. Caching & MediatR Handlers
        services.AddMemoryCache();
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        return services;
    }
}
