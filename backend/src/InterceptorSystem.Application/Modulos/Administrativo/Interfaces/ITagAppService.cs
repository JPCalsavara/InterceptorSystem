using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface ITagAppService
{
    Task<TagDtoOutput> CreateAsync(CreateTagDtoInput input);
    Task<TagDtoOutput> UpdateAsync(Guid id, UpdateTagDtoInput input);
    Task DeleteAsync(Guid id);
    Task<TagDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<TagDtoOutput>> GetAllAsync();
}
