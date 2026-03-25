using InterceptorSystem.Domain.BoundedContexts.Auth.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;

namespace InterceptorSystem.Infrastructure.Adapters.Whatsapp;

public class ContaLookupAdapter : IContaLookupPort
{
    private readonly IContaRepository _contaRepository;

    public ContaLookupAdapter(IContaRepository contaRepository)
    {
        _contaRepository = contaRepository;
    }

    public async Task<ContaVinculadaResumo?> GetContaPorTelefoneVerificadoAsync(string telefone, CancellationToken cancellationToken = default)
    {
        var conta = await _contaRepository.GetByTelefoneVerificadoAsync(telefone);
        return conta is null ? null : new ContaVinculadaResumo(conta.Id);
    }
}
