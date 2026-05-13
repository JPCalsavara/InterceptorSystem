namespace InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;

/// <summary>
/// ACL do BC WhatsApp para consultar conta autorizada por telefone.
/// </summary>
public interface IContaLookupPort
{
    Task<ContaVinculadaResumo?> GetContaPorTelefoneVerificadoAsync(string telefone, CancellationToken cancellationToken = default);
}

public record ContaVinculadaResumo(Guid ContaId);