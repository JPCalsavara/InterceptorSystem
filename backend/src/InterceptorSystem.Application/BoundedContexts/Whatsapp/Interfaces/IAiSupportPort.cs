namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;

public interface IAiSupportPort
{
    Task<string> ProcessSupportMessageAsync(string telefone, Guid tenantId, string message, CancellationToken ct = default);
}
