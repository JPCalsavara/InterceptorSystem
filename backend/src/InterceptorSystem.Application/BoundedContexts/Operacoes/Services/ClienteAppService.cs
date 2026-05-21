using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ClienteAppService : IClienteAppService
{
    private readonly IClienteRepository _repository;
    private readonly ICurrentTenantService _tenantService;

    public ClienteAppService(
        IClienteRepository repository, 
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _tenantService = tenantService;
    }

    public async Task<ClienteDtoOutput> CreateAsync(CreateClienteDtoInput input, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        
        var cliente = new Cliente(
            empresaId,
            input.Nome,
            input.Cnpj,
            input.Cidade,
            input.Estado,
            quantidadeIdealPorTurno: input.QuantidadeIdealPorTurno,
            horarioTrocaTurno: TimeOnly.Parse(input.HorarioTrocaTurno),
            emailGestor: input.EmailGestor,
            telefoneEmergencia: input.TelefoneEmergencia);
        
        _repository.Add(cliente);
        await _repository.UnitOfWork.CommitAsync(ct);
        
        return ClienteDtoOutput.FromEntity(cliente)!;
    }

    public async Task<ClienteDtoOutput> UpdateAsync(Guid id, UpdateClienteDtoInput input, CancellationToken ct = default)
    {
        var cliente = await _repository.GetByIdAsync(id, ct);
        if (cliente == null)
            throw new KeyNotFoundException("Cliente não encontrado.");
        
        cliente.AtualizarDados(
            input.Nome, 
            input.Cnpj,
            input.Cidade, 
            input.Estado, 
            input.QuantidadeIdealPorTurno, 
            TimeOnly.Parse(input.HorarioTrocaTurno), 
            input.EmailGestor, 
            input.TelefoneEmergencia);
        
        _repository.Update(cliente);
        await  _repository.UnitOfWork.CommitAsync(ct);
        
        return ClienteDtoOutput.FromEntity(cliente)!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var affected = await _repository.DeleteDirectlyAsync(id, ct);
            if (affected == 0)
                throw new KeyNotFoundException("Cliente não encontrado.");
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("23503") || ex.InnerException?.Message.Contains("23503") == true || ex.Message.Contains("FK_") || ex.InnerException?.Message.Contains("FK_") == true)
            {
                throw new InvalidOperationException(
                    "Não é possível excluir este cliente porque existem registros vinculados (ex.: contratos). Remova os vínculos antes de excluir.",
                    ex);
            }
            throw;
        }
    }

    public async Task<ClienteDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var cliente = await _repository.GetByIdAsync(id, ct);
        return cliente != null ? ClienteDtoOutput.FromEntity(cliente) : null;
    }

    public async Task<IEnumerable<ClienteDtoOutput>> GetAllAsync(CancellationToken ct = default)
    {
        var lista = await _repository.GetAllAsync(ct);
        return lista.Select(c => ClienteDtoOutput.FromEntity(c)).Where(dto => dto != null)!;
    }
}
