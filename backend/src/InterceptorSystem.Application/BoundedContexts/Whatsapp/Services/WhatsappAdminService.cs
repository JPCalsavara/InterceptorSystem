using InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Services;

public class WhatsappAdminService : IWhatsappAdminService
{
    private readonly ISessaoWhatsappRepository _repository;
    private readonly ICurrentTenantService _tenantService;

    public WhatsappAdminService(ISessaoWhatsappRepository repository, ICurrentTenantService tenantService)
    {
        _repository = repository;
        _tenantService = tenantService;
    }

    public async Task<IEnumerable<SessaoWhatsappDto>> GetSessoesAsync(CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto.");
        var sessoes = await _repository.GetAllByTenantAsync(empresaId, ct);
        
        return sessoes.Select(s => new SessaoWhatsappDto(
            s.Id,
            s.Telefone,
            s.ContaId,
            s.Estado,
            s.ClienteIdSelecionado,
            s.PostoIdSelecionado,
            s.DataSelecionada,
            s.DiariaIdParaSubstituir,
            s.FuncionarioSubstitutoId,
            s.CriadoEm,
            s.UltimaAtividade
        ));
    }
}
