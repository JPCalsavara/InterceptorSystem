using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class PostoAppService : IPostoAppService
{
    private readonly IPostoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;
    private readonly IMemoryCache _cache;

    public PostoAppService(
        IPostoRepository repository,
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

    private static string GetAllCacheKey(Guid empresaId) => $"Postos_{empresaId}";
    private static string GetByClienteCacheKey(Guid empresaId, Guid clienteId) =>
        $"Postos_{empresaId}_Cliente_{clienteId}";

    private void InvalidatePostoCache(Guid empresaId, Guid? clienteId = null)
    {
        _cache.Remove(GetAllCacheKey(empresaId));
        if (clienteId.HasValue)
        {
            _cache.Remove(GetByClienteCacheKey(empresaId, clienteId.Value));
        }
    }

    public async Task<PostoDto> CreateAsync(CreatePostoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId);
        if (cliente == null)
            throw new InvalidOperationException("Cliente não encontrado.");

        var posto = new Posto(
            input.ClienteId,
            empresaId,
            input.Nome,
            input.Cep,
            input.Endereco,
            input.Numero,
            input.Complemento,
            input.Cidade,
            input.Estado
        );

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
                .Select(tagId => new PostoTag(empresaId, posto.Id, tagId))
                .ToList();

            posto.DefinirTags(novasTags);
        }

        _repository.Add(posto);
        await _repository.UnitOfWork.CommitAsync();

        InvalidatePostoCache(empresaId, input.ClienteId);

        return PostoDto.FromEntity(posto);
    }

    public async Task<PostoDto> UpdateAsync(Guid id, UpdatePostoInput input)
    {
        var posto = await _repository.GetByIdAsync(id);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        posto.AtualizarDetalhes(
            input.Nome,
            input.Cep,
            input.Endereco,
            input.Numero,
            input.Complemento,
            input.Cidade,
            input.Estado);

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
                .Select(tagId => new PostoTag(empresaIdForTags, posto.Id, tagId))
                .ToList();

            posto.DefinirTags(novasTags);
        }

        _repository.Update(posto);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidatePostoCache(empresaId, posto.ClienteId);

        return PostoDto.FromEntity(posto);
    }

    public async Task DeleteAsync(Guid id)
    {
        var posto = await _repository.GetByIdAsync(id);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        posto.Desativar();
        _repository.Update(posto);
        await _repository.UnitOfWork.CommitAsync();

        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        InvalidatePostoCache(empresaId, posto.ClienteId);
    }

    public async Task<PostoDto?> GetByIdAsync(Guid id)
    {
        var posto = await _repository.GetByIdAsync(id);
        return posto == null ? null : PostoDto.FromEntity(posto);
    }

    public async Task<IEnumerable<PostoDto>> GetAllAsync()
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetAllCacheKey(empresaId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<PostoDto>? cached) && cached != null)
        {
            return cached;
        }

        var lista = await _repository.GetAllAsync();
        var result = lista.Select(PostoDto.FromEntity);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        return result;
    }

    public async Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
        var cacheKey = GetByClienteCacheKey(empresaId, clienteId);

        if (_cache.TryGetValue(cacheKey, out IEnumerable<PostoDto>? cached) && cached != null)
        {
            return cached;
        }

        var lista = await _repository.GetByClienteIdAsync(clienteId);
        var result = lista.Select(PostoDto.FromEntity);
        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10)));
        return result;
    }
}
