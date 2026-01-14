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

        // Validar se já existe alocação na mesma data
        var existeAlocacaoMesmaData = await _repository.ExisteAlocacaoNaDataAsync(funcionario.Id, input.Data);
        if (existeAlocacaoMesmaData)
        {
            throw new InvalidOperationException("Funcionário já possui alocação neste período.");
        }

        await ValidarRegrasDeConsecutividade(funcionario.Id, input.Data, input.TipoAlocacao);

        if (!await ValidarCapacidadeDoPosto(posto, input.Data))
        {
            throw new InvalidOperationException("Capacidade máxima do posto atingida para esta data.");
        }

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

        // Validar se não há alocação simultânea na mesma data (ignorando a atual)
        var existeAlocacaoMesmaData = await _repository.ExisteAlocacaoNaDataAsync(alocacao.FuncionarioId, alocacao.Data, id);
        if (existeAlocacaoMesmaData)
        {
            throw new InvalidOperationException("Funcionário já possui alocação neste período.");
        }

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
        var alocacoesFuncionario = await _repository.GetByFuncionarioAsync(funcionarioId);
        var alocacoesRelevantes = alocacoesFuncionario.Where(a => a.Id != alocacaoIdIgnorado).ToList();

        // Verifica se há dobra programada no dia anterior
        var dobraProgramadaAnterior = alocacoesRelevantes
            .FirstOrDefault(a => a.Data == data.AddDays(-1) && a.TipoAlocacao == TipoAlocacao.DOBRA_PROGRAMADA);

        if (dobraProgramadaAnterior != null)
        {
            throw new InvalidOperationException("Funcionário deve descansar após dobra programada.");
        }

        // Se é DOBRA_PROGRAMADA, permite criar mesmo com alocação no dia anterior
        if (tipoSolicitado == TipoAlocacao.DOBRA_PROGRAMADA)
        {
            return;
        }

        // Para alocações regulares/substituição, verifica dias consecutivos
        var existeAdjacente = alocacoesRelevantes.Any(a =>
            (a.Data == data.AddDays(-1) || a.Data == data.AddDays(1)) &&
            a.TipoAlocacao != TipoAlocacao.DOBRA_PROGRAMADA);

        if (existeAdjacente)
        {
            throw new InvalidOperationException("Não é permitido duas alocações em dias consecutivos, exceto em dobra programada.");
        }
    }

    private async Task<bool> ValidarCapacidadeDoPosto(PostoDeTrabalho posto, DateOnly data)
    {
        // Lógica para validar a capacidade do posto na data informada
        // Isso pode envolver verificar quantos funcionários já estão alocados no posto nesse dia
        // e comparar com a capacidade máxima permitida.

        // Exemplo fictício:
        var capacidadeMaxima = posto.CapacidadeMaximaPorDobras;
        var alocacoesNoPosto = await _repository.GetByPostoEDataAsync(posto.Id, data);
        var quantidadeAtual = alocacoesNoPosto.Count();

        return quantidadeAtual < capacidadeMaxima;
    }
}
