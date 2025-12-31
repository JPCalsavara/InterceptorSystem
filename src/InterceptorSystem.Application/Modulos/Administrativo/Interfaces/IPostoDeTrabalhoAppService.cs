using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IPostoDeTrabalhoAppService
{
    Task<PostoDeTrabalhoDto> CreateAsync(CreatePostoInput input);
    Task<PostoDeTrabalhoDto> UpdateAsync(Guid id, UpdatePostoInput input);
    Task DeleteAsync(Guid id);
    Task<PostoDeTrabalhoDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PostoDeTrabalhoDto>> GetAllAsync();
    Task<IEnumerable<PostoDeTrabalhoDto>> GetByCondominioIdAsync(Guid condominioId);
}

