using InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;

public interface IWhatsappAdminService
{
    Task<IEnumerable<SessaoWhatsappDto>> GetSessoesAsync(CancellationToken ct = default);
}
