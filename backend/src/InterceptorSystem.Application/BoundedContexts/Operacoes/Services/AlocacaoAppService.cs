using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class AlocacaoAppService : IAlocacaoAppService
{
    private readonly IAlocacaoRepository _repository;
    private readonly IPostoRepository _postoRepository;
    private readonly IContratoRepository _contratoRepository;
    private readonly ICurrentTenantService _tenantService;

    public AlocacaoAppService(
        IAlocacaoRepository repository,
        IPostoRepository postoRepository,
        IContratoRepository contratoRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _postoRepository = postoRepository;
        _contratoRepository = contratoRepository;
        _tenantService = tenantService;
    }

    public async Task<AlocacaoDto> CreateAsync(CreateAlocacaoInput input, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");

        var posto = await _postoRepository.GetByIdAsync(input.PostoId, ct)
            ?? throw new KeyNotFoundException("Posto não encontrado.");
            
        var contrato = await _contratoRepository.GetByIdAsync(input.ContratoId, ct)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        var alocacao = new Alocacao(
            input.PostoId,
            input.ContratoId,
            empresaId,
            input.HorarioInicio,
            input.HorarioFim,
            input.TipoEscala,
            input.PermiteDobrarEscala,
            Math.Max(1, input.QuantidadeFuncionarios)
        );

        _repository.Add(alocacao);
        await _repository.UnitOfWork.CommitAsync(ct);

        return AlocacaoDto.FromEntity(alocacao);
    }

    public async Task<AlocacaoDto> UpdateAsync(Guid id, UpdateAlocacaoInput input, CancellationToken ct = default)
    {
        var alocacao = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        alocacao.AtualizarHorario(
            input.HorarioInicio,
            input.HorarioFim,
            input.TipoEscala,
            input.PermiteDobrarEscala,
            Math.Max(1, input.QuantidadeFuncionarios)
        );

        _repository.Update(alocacao);
        await _repository.UnitOfWork.CommitAsync(ct);

        return AlocacaoDto.FromEntity(alocacao);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var alocacao = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        alocacao.PrepararExclusao();
        _repository.Remove(alocacao);
        await _repository.UnitOfWork.CommitAsync(ct);
    }

    public async Task<AlocacaoDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var alocacao = await _repository.GetByIdAsync(id, ct);
        return alocacao != null ? AlocacaoDto.FromEntity(alocacao) : null;
    }

    public async Task<IEnumerable<AlocacaoDto>> GetAllAsync(CancellationToken ct = default)
    {
        var alocacoes = await _repository.GetAllAsync(ct);
        return alocacoes.Select(AlocacaoDto.FromEntity);
    }

    public async Task<IEnumerable<AlocacaoDto>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var alocacoes = await _repository.GetByClienteIdAsync(clienteId, ct);
        return alocacoes.Select(AlocacaoDto.FromEntity);
    }

    public async Task<IEnumerable<AlocacaoDto>> GetByPostoIdAsync(Guid postoId, CancellationToken ct = default)
    {
        var alocacoes = await _repository.GetByPostoIdAsync(postoId, ct);
        return alocacoes.Select(AlocacaoDto.FromEntity);
    }

    public async Task<IEnumerable<AlocacaoDto>> GetByContratoIdAsync(Guid contratoId, CancellationToken ct = default)
    {
        // Simple filter for now
        var alocacoes = await _repository.GetAllAsync(ct);
        return alocacoes.Where(a => a.ContratoId == contratoId).Select(AlocacaoDto.FromEntity);
    }
}
