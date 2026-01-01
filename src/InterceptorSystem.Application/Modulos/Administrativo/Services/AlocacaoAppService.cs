using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class AlocacaoAppService : IAlocacaoAppService
{
    private readonly IAlocacaoRepository _repository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IPostoDeTrabalhoRepository _postoRepository;
    private readonly ICurrentTenantService _tenantService;

    public AlocacaoAppService(
        IAlocacaoRepository repository,
        IFuncionarioRepository funcionarioRepository,
        IPostoDeTrabalhoRepository postoRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _funcionarioRepository = funcionarioRepository;
        _postoRepository = postoRepository;
        _tenantService = tenantService;
    }

    public async Task<AlocacaoDtoOutput> CreateAsync(CreateAlocacaoDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var funcionario = await _funcionarioRepository.GetByIdAsync(input.FuncionarioId)
            ?? throw new KeyNotFoundException("Funcionário não encontrado para alocação.");

        var posto = await _postoRepository.GetByIdAsync(input.PostoDeTrabalhoId)
            ?? throw new KeyNotFoundException("Posto de Trabalho não encontrado para alocação.");

        if (funcionario.CondominioId != posto.CondominioId)
        {
            throw new InvalidOperationException("Funcionário e Posto devem pertencer ao mesmo condomínio.");
        }

        await ValidarRegrasDeConsecutividade(funcionario.Id, input.Data, input.TipoAlocacao);

        var alocacao = new Alocacao(
            empresaId,
            funcionario.Id,
            posto.Id,
            input.Data,
            input.StatusAlocacao,
            input.TipoAlocacao);

        _repository.Add(alocacao);
        await _repository.UnitOfWork.CommitAsync();

        return AlocacaoDtoOutput.FromEntity(alocacao)!;
    }

    public async Task<AlocacaoDtoOutput> UpdateAsync(Guid id, UpdateAlocacaoDtoInput input)
    {
        var alocacao = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        await ValidarRegrasDeConsecutividade(alocacao.FuncionarioId, alocacao.Data, input.TipoAlocacao, alocacaoIdIgnorado: id);

        alocacao.AtualizarStatus(input.StatusAlocacao, input.TipoAlocacao);

        _repository.Update(alocacao);
        await _repository.UnitOfWork.CommitAsync();

        return AlocacaoDtoOutput.FromEntity(alocacao)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var alocacao = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        _repository.Remove(alocacao);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<AlocacaoDtoOutput?> GetByIdAsync(Guid id)
    {
        var alocacao = await _repository.GetByIdAsync(id);
        return AlocacaoDtoOutput.FromEntity(alocacao!);
    }

    public async Task<IEnumerable<AlocacaoDtoOutput>> GetAllAsync()
    {
        var alocacoes = await _repository.GetAllAsync();
        return alocacoes.Select(AlocacaoDtoOutput.FromEntity)!;
    }

    public async Task<bool> FuncionarioExisteAsync(Guid funcionarioId)
    {
        var funcionario = await _funcionarioRepository.GetByIdAsync(funcionarioId);
        return funcionario != null;
    }

    public async Task<bool> PostoExisteAsync(Guid postoId)
    {
        var posto = await _postoRepository.GetByIdAsync(postoId);
        return posto != null;
    }

    private async Task ValidarRegrasDeConsecutividade(Guid funcionarioId, DateOnly data, TipoAlocacao tipoSolicitado, Guid? alocacaoIdIgnorado = null)
    {
        if (tipoSolicitado == TipoAlocacao.DOBRA_PROGRAMADA)
        {
            return;
        }

        var alocacoesFuncionario = await _repository.GetByFuncionarioAsync(funcionarioId);
        var existeAdjacente = alocacoesFuncionario.Any(a =>
            a.Id != alocacaoIdIgnorado &&
            (a.Data == data.AddDays(-1) || a.Data == data.AddDays(1)) &&
            a.TipoAlocacao != TipoAlocacao.DOBRA_PROGRAMADA);

        if (existeAdjacente)
        {
            throw new InvalidOperationException("Não é permitido duas alocações em dias consecutivos, exceto em dobra programada.");
        }
    }
}
