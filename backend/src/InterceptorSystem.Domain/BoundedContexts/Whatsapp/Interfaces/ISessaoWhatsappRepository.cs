using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Aggregates;

namespace InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;

public interface ISessaoWhatsappRepository
{
    Task<SessaoWhatsapp?> GetByTelefoneAsync(string telefone);
    Task<IEnumerable<SessaoWhatsapp>> GetExpiradas(int timeoutMinutos);
    void Add(SessaoWhatsapp sessao);
    void Remove(SessaoWhatsapp sessao);
    IUnitOfWork UnitOfWork { get; }
}
