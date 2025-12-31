using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class PostoDeTrabalhoAppService : IPostoDeTrabalhoAppService
{
    private readonly IPostoDeTrabalhoRepository _repository;
    private readonly ICondominioRepository _condominioRepository;
    private readonly ICurrentTenantService _tenantService;

    public PostoDeTrabalhoAppService(
        IPostoDeTrabalhoRepository repository,
        ICondominioRepository condominioRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _condominioRepository = condominioRepository;
        _tenantService = tenantService;
    }

    public async Task<PostoDeTrabalhoDto> CreateAsync(CreatePostoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        // Verifica se o condomínio existe
        var condominio = await _condominioRepository.GetByIdAsync(input.CondominioId);
        if (condominio == null)
            throw new InvalidOperationException("Condomínio não encontrado.");

        var posto = new PostoDeTrabalho(
            input.CondominioId,
            empresaId,
            input.HorarioInicio,
            input.HorarioFim
        );

        _repository.Add(posto);
        await _repository.UnitOfWork.CommitAsync();

        return PostoDeTrabalhoDto.FromEntity(posto);
    }

    public async Task<PostoDeTrabalhoDto> UpdateAsync(Guid id, UpdatePostoInput input)
    {
        var posto = await _repository.GetByIdAsync(id);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        posto.AtualizarHorario(input.HorarioInicio, input.HorarioFim);

        _repository.Update(posto);
        await _repository.UnitOfWork.CommitAsync();

        return PostoDeTrabalhoDto.FromEntity(posto);
    }

    public async Task DeleteAsync(Guid id)
    {
        var posto = await _repository.GetByIdAsync(id);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        _repository.Remove(posto);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<PostoDeTrabalhoDto?> GetByIdAsync(Guid id)
    {
        var posto = await _repository.GetByIdAsync(id);
        return posto == null ? null : PostoDeTrabalhoDto.FromEntity(posto);
    }

    public async Task<IEnumerable<PostoDeTrabalhoDto>> GetAllAsync()
    {
        var lista = await _repository.GetAllAsync();
        return lista.Select(PostoDeTrabalhoDto.FromEntity);
    }

    public async Task<IEnumerable<PostoDeTrabalhoDto>> GetByCondominioIdAsync(Guid condominioId)
    {
        var lista = await _repository.GetByCondominioIdAsync(condominioId);
        return lista.Select(PostoDeTrabalhoDto.FromEntity);
    }
}

