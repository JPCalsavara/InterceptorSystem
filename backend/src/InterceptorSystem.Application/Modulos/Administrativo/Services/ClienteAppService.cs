using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class ClienteAppService : IClienteAppService
{
    private readonly IClienteRepository _repository;
    private readonly ICurrentTenantService _tenantService;
    private readonly IMemoryCache _cache;

    public ClienteAppService(
        IClienteRepository repository, 
        ICurrentTenantService tenantService,
        IMemoryCache cache)
    {
        _repository = repository;
        _tenantService = tenantService;
        _cache = cache;
    }

    public async Task<ClienteDtoOutput> CreateAsync(CreateClienteDtoInput input)
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
        await _repository.UnitOfWork.CommitAsync();
        
        _cache.Remove($"Clientes_{empresaId}");
        
        return ClienteDtoOutput.FromEntity(cliente)!;
    }

    public async Task<ClienteDtoOutput> UpdateAsync(Guid id, UpdateClienteDtoInput input)
    {
        var cliente = await _repository.GetByIdAsync(id);
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
        await  _repository.UnitOfWork.CommitAsync();
        
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("...");
        _cache.Remove($"Clientes_{empresaId}");
        
        return ClienteDtoOutput.FromEntity(cliente)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var cliente = await _repository.GetByIdAsync(id);
        if (cliente == null)
            throw new KeyNotFoundException("Cliente não encontrado.");

        _repository.Remove(cliente);
        await _repository.UnitOfWork.CommitAsync();
        
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("...");
        _cache.Remove($"Clientes_{empresaId}");
    }

    public async Task<ClienteDtoOutput?> GetByIdAsync(Guid id)
    {
        var cliente = await _repository.GetByIdAsync(id);
        return cliente != null ? ClienteDtoOutput.FromEntity(cliente) : null;
    }

    public async Task<IEnumerable<ClienteDtoOutput>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = $"Clientes_{empresaId}";

        if (!_cache.TryGetValue(cacheKey, out IEnumerable<ClienteDtoOutput>? cachedList))
        {
            var lista = await _repository.GetAllAsync();
            cachedList = lista.Select(c => ClienteDtoOutput.FromEntity(c)).Where(dto => dto != null)!;

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));

            _cache.Set(cacheKey, cachedList, cacheOptions);
        }

        return cachedList ?? Enumerable.Empty<ClienteDtoOutput>();
    }
}
