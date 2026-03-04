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
        services.AddScoped<IContaRepository, ContaRepository>();
        services.AddScoped<ITokenVerificacaoRepository, TokenVerificacaoRepository>();

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

        return services;
    }
}
