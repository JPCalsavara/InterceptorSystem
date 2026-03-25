using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface ITagAppService
{
    Task<TagDtoOutput> CreateAsync(CreateTagDtoInput input);
    Task<TagDtoOutput> UpdateAsync(Guid id, UpdateTagDtoInput input);
    Task DeleteAsync(Guid id);
    Task<TagDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<TagDtoOutput>> GetAllAsync();
}
