using InterceptorSystem.Domain.Modulos.Whatsapp.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InterceptorSystem.Infrastructure.Whatsapp.BackgroundServices;

/// <summary>
/// Serviço de background que remove sessões WhatsApp expiradas a cada 5 minutos.
/// Evita acúmulo de sessões abandonadas no banco de dados.
/// </summary>
public class SessaoExpiradaCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SessaoExpiradaCleanupService> _logger;
    private static readonly TimeSpan Intervalo = TimeSpan.FromMinutes(5);

    public SessaoExpiradaCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<SessaoExpiradaCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SessaoExpiradaCleanupService iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Intervalo, stoppingToken);
            await LimparSessoesExpiradasAsync(stoppingToken);
        }
    }

    private async Task LimparSessoesExpiradasAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<ISessaoWhatsappRepository>();

            var expiradas = (await repo.GetExpiradas(timeoutMinutos: 15)).ToList();
            if (!expiradas.Any()) return;

            foreach (var sessao in expiradas)
                repo.Remove(sessao);

            await repo.UnitOfWork.CommitAsync();
            _logger.LogInformation("Removidas {Count} sessões WhatsApp expiradas.", expiradas.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao limpar sessões WhatsApp expiradas.");
        }
    }
}
