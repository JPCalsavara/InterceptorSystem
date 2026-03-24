using System.Reflection;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Domain.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Infrastructure.Auth;
using InterceptorSystem.Infrastructure.Email;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using InterceptorSystem.Infrastructure.Persistence.Repositories;
using InterceptorSystem.Infrastructure.Whatsapp;
using InterceptorSystem.Infrastructure.Whatsapp.BackgroundServices;
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
        
        // 2.1 Repositórios Sem Cache
        services.AddScoped<IAlocacaoRepository, AlocacaoRepository>();
        services.AddScoped<IDiariaRepository, DiariaRepository>();
        
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
        services.AddScoped<IContaRepository, ContaRepository>();
        services.AddScoped<ITokenVerificacaoRepository, TokenVerificacaoRepository>();
        services.AddScoped<ITagRepository, TagRepository>(); // Phase 4

        // 3. Auth Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();

        // 4. Email Service
        services.AddScoped<IEmailService, SmtpEmailService>();

        // 5. WhatsApp Bot
        services.AddScoped<ISessaoWhatsappRepository, SessaoWhatsappRepository>();
        services.AddScoped<IWhatsappMessageSender, MetaWhatsappMessageSender>();
        services.AddHttpClient<MetaWhatsappMessageSender>();
        services.AddHostedService<SessaoExpiradaCleanupService>();

        // 6. Caching & MediatR Handlers
        services.AddMemoryCache();
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        return services;
    }
}
