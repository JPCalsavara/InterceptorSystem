using System.Linq;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class FuncionarioAppService : IFuncionarioAppService
{
    private readonly IFuncionarioRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IContratoRepository _contratoRepository;
    private readonly ITagRepository _tagRepository; // Phase 4
    private readonly ICurrentTenantService _tenantService;
    private readonly IMemoryCache _cache;

    public FuncionarioAppService(
        IFuncionarioRepository repository,
        IClienteRepository clienteRepository,
        IContratoRepository contratoRepository,
        ITagRepository tagRepository, // Phase 4
        ICurrentTenantService tenantService,
        IMemoryCache cache)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _contratoRepository = contratoRepository;
        _tagRepository = tagRepository;
        _tenantService = tenantService;
        _cache = cache;
    }

    private static string GetAllCacheKey(Guid empresaId) => $"Funcionarios_{empresaId}";
    private static string GetByClienteCacheKey(Guid empresaId, Guid clienteId) =>
        $"Funcionarios_{empresaId}_Cliente_{clienteId}";

    private void InvalidateFuncionarioCache(Guid empresaId, Guid? clienteId = null)
    {
        _cache.Remove(GetAllCacheKey(empresaId));
        if (clienteId.HasValue)
        {
            _cache.Remove(GetByClienteCacheKey(empresaId, clienteId.Value));
        }
    }

    public async Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var contrato = await _contratoRepository.GetByIdAsync(input.ContratoId);
        if (contrato == null)
        {
            throw new KeyNotFoundException("Contrato não encontrado.");
        }

        if (input.ClienteId.HasValue)
        {
            var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId.Value);
            if (cliente == null)
            {
                throw new KeyNotFoundException("Cliente não encontrado para o funcionário.");
            }

            if (contrato.ClienteId != input.ClienteId.Value)
            {
                throw new InvalidOperationException("O contrato não pertence ao cliente informado.");
            }
        }

        // Apenas verificar se o contrato está ATIVO ou PENDENTE (sem validação rigorosa de datas)
        if (contrato.Status != StatusContrato.ATIVO && contrato.Status != StatusContrato.PENDENTE)
        {
            throw new InvalidOperationException($"Não é possível vincular funcionário a um contrato com status {contrato.Status}.");
        }


        var cpfExistente = await _repository.GetByCpfAsync(input.Cpf);
        if (cpfExistente != null)
        {
            throw new InvalidOperationException("Já existe um funcionário cadastrado com este CPF.");
        }

        var funcionario = new Funcionario(
            empresaId,
            input.ClienteId,
            input.ContratoId,
            input.Nome,
            input.Cpf,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario);

        // Phase 4: assign initial tags
        if (input.TagIds != null && input.TagIds.Count > 0)
        {
            foreach (var tagId in input.TagIds)
            {
                var tag = await _tagRepository.GetByIdAsync(tagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagId}.");
                }
            }

            var novasTags = input.TagIds
                .Distinct()
                .Select(tagId => new FuncionarioTag(empresaId, funcionario.Id, tagId))
                .ToList();
            funcionario.DefinirTags(novasTags);
        }

        _repository.Add(funcionario);
        await _repository.UnitOfWork.CommitAsync();

        InvalidateFuncionarioCache(empresaId, input.ClienteId);

        return FuncionarioDtoOutput.FromEntity(funcionario)!;
    }

    public async Task<FuncionarioDtoOutput> UpdateAsync(Guid id, UpdateFuncionarioDtoInput input)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        if (funcionario == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado.");
        }

        funcionario.AtualizarDados(
            input.Nome,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario);

        // Phase 4: replace tags if provided
        if (input.TagIds != null)
        {
            var empresaIdForTags = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
            foreach (var tagId in input.TagIds)
            {
                var tag = await _tagRepository.GetByIdAsync(tagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagId}.");
                }
            }

            var novasTags = input.TagIds
                .Distinct()
                .Select(tagId => new FuncionarioTag(empresaIdForTags, funcionario.Id, tagId))
                .ToList();
            funcionario.DefinirTags(novasTags);
        }

        _repository.Update(funcionario);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidateFuncionarioCache(empresaId, funcionario.ClienteId);

        return FuncionarioDtoOutput.FromEntity(funcionario)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        if (funcionario == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado.");
        }

        _repository.Remove(funcionario);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidateFuncionarioCache(empresaId, funcionario.ClienteId);
    }

    public async Task<FuncionarioDtoOutput?> GetByIdAsync(Guid id)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        return FuncionarioDtoOutput.FromEntity(funcionario!);
    }

    public async Task<IEnumerable<FuncionarioDtoOutput>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetAllCacheKey(empresaId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<FuncionarioDtoOutput>? cached) && cached != null)
        {
            return cached;
        }

        var funcionarios = await _repository.GetAllAsync();
        var result = funcionarios.Select(f => FuncionarioDtoOutput.FromEntity(f)!);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        return result;
    }

    public async Task<bool> CpfJaExisteAsync(string cpf)
    {
        var existente = await _repository.GetByCpfAsync(cpf);
        return existente != null;
    }

    public async Task<bool> ClienteExisteAsync(Guid clienteId)
    {
        var cliente = await _clienteRepository.GetByIdAsync(clienteId);
        return cliente != null;
    }
    public async Task<IEnumerable<FuncionarioDtoOutput>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetByClienteCacheKey(empresaId, clienteId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<FuncionarioDtoOutput>? cached) && cached != null)
        {
            return cached;
        }

        var funcionarios = await _repository.GetByClienteAsync(clienteId);
        var result = funcionarios.Select(f => FuncionarioDtoOutput.FromEntity(f)!);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        return result;
    }
}
