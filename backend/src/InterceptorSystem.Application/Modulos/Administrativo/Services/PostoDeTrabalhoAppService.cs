using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class PostoDeTrabalhoAppService : IPostoDeTrabalhoAppService
{
    private readonly IPostoDeTrabalhoRepository _repository;
    private readonly ICondominioRepository _condominioRepository;
    private readonly IContratoRepository _contratoRepository;
    private readonly ICurrentTenantService _tenantService;

    public PostoDeTrabalhoAppService(
        IPostoDeTrabalhoRepository repository,
        ICondominioRepository condominioRepository,
        IContratoRepository contratoRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _condominioRepository = condominioRepository;
        _contratoRepository = contratoRepository;
        _tenantService = tenantService;
    }

    public async Task<PostoDeTrabalhoDto> CreateAsync(CreatePostoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        // Passo 1: Verifica se o condomínio existe
        var condominio = await _condominioRepository.GetByIdAsync(input.CondominioId);
        if (condominio == null)
            throw new InvalidOperationException("Condomínio não encontrado.");

        // Passo 2: Verifica se o contrato existe
        var contrato = await _contratoRepository.GetByIdAsync(input.ContratoId);
        if (contrato == null)
            throw new KeyNotFoundException("Contrato não encontrado.");

        // Passo 3: Verifica se o contrato pertence ao mesmo condomínio
        if (contrato.CondominioId != input.CondominioId)
            throw new InvalidOperationException("O contrato não pertence ao condomínio informado.");

        // Passo 4: Verifica se o contrato está ATIVO ou PENDENTE
        if (contrato.Status != StatusContrato.ATIVO && contrato.Status != StatusContrato.PENDENTE)
            throw new InvalidOperationException("O contrato não está ativo ou pendente.");

        // Passo 5: Verifica se o limite de postos do contrato foi atingido
        var postosExistentes = await _repository.GetByContratoIdAsync(input.ContratoId);
        if (postosExistentes.Count() >= contrato.NumeroDePostos)
            throw new InvalidOperationException($"Limite de postos do contrato atingido ({contrato.NumeroDePostos} postos).");

        var posto = new PostoDeTrabalho(
            input.CondominioId,
            empresaId,
            input.ContratoId,
            input.HorarioInicio,
            input.HorarioFim,
            input.PermiteDobrarEscala
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

        posto.AtualizarHorario(input.HorarioInicio, input.HorarioFim, input.PermiteDobrarEscala);

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

    public async Task<IEnumerable<PostoDeTrabalhoDto>> GetByContratoIdAsync(Guid contratoId)
    {
        var lista = await _repository.GetByContratoIdAsync(contratoId);
        return lista.Select(PostoDeTrabalhoDto.FromEntity);
    }
}
