using System.Linq;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class ContratoAppService : IContratoAppService
{
    private readonly IContratoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;
    private readonly IMemoryCache _cache;

    public ContratoAppService(
        IContratoRepository repository,
        IClienteRepository clienteRepository,
        ITagRepository tagRepository,
        ICurrentTenantService tenantService,
        IMemoryCache cache)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tagRepository = tagRepository;
        _tenantService = tenantService;
        _cache = cache;
    }

    private static string GetAllCacheKey(Guid empresaId) => $"Contratos_{empresaId}";
    private static string GetByClienteCacheKey(Guid empresaId, Guid clienteId) =>
        $"Contratos_{empresaId}_Cliente_{clienteId}";

    private void InvalidateContratoCache(Guid empresaId, Guid? clienteId = null)
    {
        _cache.Remove(GetAllCacheKey(empresaId));
        if (clienteId.HasValue)
        {
            _cache.Remove(GetByClienteCacheKey(empresaId, clienteId.Value));
        }
    }

    public async Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId)
            ?? throw new KeyNotFoundException("Cliente não encontrado para o contrato.");

        // Validar se já existe um contrato vigente para este cliente
        var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(input.ClienteId);
        if (existeContratoVigente)
        {
            throw new InvalidOperationException("Já existe um contrato vigente para este cliente.");
        }

        var contrato = new Contrato(
            empresaId,
            input.ClienteId,
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.Status,
            input.ValorDiariaVigilante);

        if (input.Tags != null)
        {
            foreach (var tagInput in input.Tags)
            {
                var tag = await _tagRepository.GetByIdAsync(tagInput.TagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagInput.TagId}.");
                }
            }

            var tags = input.Tags
                .DistinctBy(t => t.TagId)
                .Select(t => new ContratoTag(empresaId, contrato.Id, t.TagId, t.ValorDiaria))
                .ToList();
            contrato.DefinirTags(tags);
        }

        _repository.Add(contrato);
        await _repository.UnitOfWork.CommitAsync();

        InvalidateContratoCache(empresaId, input.ClienteId);

        var saved = await _repository.GetByIdAsync(contrato.Id)
            ?? throw new InvalidOperationException("Contrato não encontrado após persistência.");

        return ContratoDtoOutput.FromEntity(saved)!;
    }

    public async Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input)
    {
        var contrato = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        // Validar se não há contrato vigente quando alterando status para ATIVO ou PENDENTE
        if ((input.Status == StatusContrato.ATIVO || input.Status == StatusContrato.PENDENTE) && 
            contrato.Status == StatusContrato.FINALIZADO)
        {
            var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(contrato.ClienteId, id);
            if (existeContratoVigente)
            {
                throw new InvalidOperationException("Já existe um contrato vigente para este cliente.");
            }
        }

        contrato.AtualizarDados(
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.ValorDiariaVigilante);

        if (input.Tags != null)
        {
            var empresaIdForTags = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
            foreach (var tagInput in input.Tags)
            {
                var tag = await _tagRepository.GetByIdAsync(tagInput.TagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagInput.TagId}.");
                }
            }

            var tags = input.Tags
                .DistinctBy(t => t.TagId)
                .Select(t => new ContratoTag(empresaIdForTags, contrato.Id, t.TagId, t.ValorDiaria))
                .ToList();
            contrato.DefinirTags(tags);
        }

        contrato.AtualizarStatus(input.Status);

        _repository.Update(contrato);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidateContratoCache(empresaId, contrato.ClienteId);

        var saved = await _repository.GetByIdAsync(contrato.Id)
            ?? throw new InvalidOperationException("Contrato não encontrado após atualização.");

        return ContratoDtoOutput.FromEntity(saved)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var contrato = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        _repository.Remove(contrato);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidateContratoCache(empresaId, contrato.ClienteId);
    }

    public async Task<ContratoDtoOutput?> GetByIdAsync(Guid id)
    {
        var contrato = await _repository.GetByIdAsync(id);
        return ContratoDtoOutput.FromEntity(contrato!);
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetAllCacheKey(empresaId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<ContratoDtoOutput>? cached) && cached != null)
        {
            return cached;
        }

        var contratos = await _repository.GetAllAsync();
        
        // BL-10: Auto-finalização de contratos vencidos
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var alterados = false;
        
        foreach (var contrato in contratos)
        {
            if (contrato.Status != StatusContrato.FINALIZADO && contrato.DataFim < hoje)
            {
                contrato.AtualizarStatus(StatusContrato.FINALIZADO);
                _repository.Update(contrato);
                alterados = true;
            }
        }
        
        if (alterados)
        {
            await _repository.UnitOfWork.CommitAsync();
            InvalidateContratoCache(empresaId);
        }

        var result = contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));

        return result;
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetByClienteCacheKey(empresaId, clienteId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<ContratoDtoOutput>? cached) && cached != null)
        {
            return cached;
        }

        var contratos = await _repository.GetByClienteIdAsync(clienteId);
        var result = contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        return result;
    }
}
