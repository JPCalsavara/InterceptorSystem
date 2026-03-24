using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class PostoAppService : IPostoAppService
{
    private readonly IPostoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;

    public PostoAppService(
        IPostoRepository repository,
        IClienteRepository clienteRepository,
        ITagRepository tagRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tagRepository = tagRepository;
        _tenantService = tenantService;
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
    }

    public async Task<PostoDto?> GetByIdAsync(Guid id)
    {
        var posto = await _repository.GetByIdAsync(id);
        return posto == null ? null : PostoDto.FromEntity(posto);
    }

    public async Task<IEnumerable<PostoDto>> GetAllAsync()
    {
        var lista = await _repository.GetAllAsync();
        return lista.Select(PostoDto.FromEntity);
    }

    public async Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId)
    {
        var lista = await _repository.GetByClienteIdAsync(clienteId);
        return lista.Select(PostoDto.FromEntity);
    }
}
