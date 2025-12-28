
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public interface ICondominioAppService
{
    Task<CondominioDtoOutput> CreateAsync(CreateCondominioDtoInput input);
    Task<CondominioDtoOutput> UpdateAsync(Guid id, UpdateCondominioDtoInput input);
    Task DeleteAsync(Guid id);
    Task<CondominioDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<CondominioDtoOutput>> GetAllAsync();
    
    Task<PostoDeTrabalhoDto> AddPostoAsync(Guid condominioId, CreatePostoInput input);
}