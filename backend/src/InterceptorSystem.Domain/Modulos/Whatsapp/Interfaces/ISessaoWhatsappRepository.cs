using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Whatsapp.Entidades;

namespace InterceptorSystem.Domain.Modulos.Whatsapp.Interfaces;

public interface ISessaoWhatsappRepository
{
    Task<SessaoWhatsapp?> GetByTelefoneAsync(string telefone);
    Task<IEnumerable<SessaoWhatsapp>> GetExpiradas(int timeoutMinutos);
    void Add(SessaoWhatsapp sessao);
    void Remove(SessaoWhatsapp sessao);
    IUnitOfWork UnitOfWork { get; }
}
