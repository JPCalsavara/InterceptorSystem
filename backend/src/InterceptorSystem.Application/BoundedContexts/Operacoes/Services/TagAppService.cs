using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class TagAppService : ITagAppService
{
    private readonly ITagRepository _repository;
    private readonly ICurrentTenantService _tenantService;

    public TagAppService(ITagRepository repository, ICurrentTenantService tenantService)
    {
        _repository = repository;
        _tenantService = tenantService;
    }

    public async Task<TagDtoOutput> CreateAsync(CreateTagDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId
            ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var existente = await _repository.GetByNomeAsync(input.Nome);
        if (existente != null)
            throw new InvalidOperationException($"Já existe uma Tag com o nome '{input.Nome}'.");

        var tag = new Tag(empresaId, input.Nome, input.Descricao);
        _repository.Add(tag);
        await _repository.UnitOfWork.CommitAsync();

        return TagDtoOutput.FromEntity(tag)!;
    }

    public async Task<TagDtoOutput> UpdateAsync(Guid id, UpdateTagDtoInput input)
    {
        var tag = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Tag não encontrada.");

        tag.AtualizarDados(input.Nome, input.Descricao);
        _repository.Update(tag);
        await _repository.UnitOfWork.CommitAsync();

        return TagDtoOutput.FromEntity(tag)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var tag = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Tag não encontrada.");

        _repository.Remove(tag);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<TagDtoOutput?> GetByIdAsync(Guid id)
    {
        var tag = await _repository.GetByIdAsync(id);
        return TagDtoOutput.FromEntity(tag);
    }

    public async Task<IEnumerable<TagDtoOutput>> GetAllAsync()
    {
        var tags = await _repository.GetAllAsync();
        return tags.Select(t => TagDtoOutput.FromEntity(t)!);
    }
}
