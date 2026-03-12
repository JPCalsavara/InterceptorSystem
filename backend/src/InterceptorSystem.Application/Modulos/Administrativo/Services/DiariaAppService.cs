using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class DiariaAppService : IDiariaAppService
{
    private readonly IDiariaRepository _repository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IAlocacaoRepository _alocacaoRepository;
    private readonly ICurrentTenantService _tenantService;

    public DiariaAppService(
        IDiariaRepository repository,
        IFuncionarioRepository funcionarioRepository,
        IAlocacaoRepository alocacaoRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _funcionarioRepository = funcionarioRepository;
        _alocacaoRepository = alocacaoRepository;
        _tenantService = tenantService;
    }

    public async Task<DiariaDtoOutput> CreateAsync(CreateDiariaDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");

        var funcionario = await _funcionarioRepository.GetByIdAsync(input.FuncionarioId)
            ?? throw new KeyNotFoundException("Funcionário não encontrado.");

        var alocacao = await _alocacaoRepository.GetByIdAsync(input.AlocacaoId)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        var existeDiariaMesmaData = await _repository.ExisteDiariaNaDataAsync(funcionario.Id, input.Data);
        if (existeDiariaMesmaData)
            throw new InvalidOperationException("Funcionário já possui diária neste período.");

        var diaria = new Diaria(
            empresaId,
            funcionario.Id,
            alocacao.Id,
            input.Data,
            0m,
            input.StatusDiaria,
            input.TipoDiaria);

        _repository.Add(diaria);
        await _repository.UnitOfWork.CommitAsync();

        return DiariaDtoOutput.FromEntity(diaria)!;
    }

    public async Task<List<DiariaDtoOutput>> CreateBatchAsync(CreateDiariasBatchDtoInput batch)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        if (batch.Diarias == null || !batch.Diarias.Any()) throw new InvalidOperationException("Nenhuma diária foi informada.");

        var diariasCriadas = new List<Diaria>();
        
        foreach (var input in batch.Diarias)
        {
            var diaria = new Diaria(
                empresaId,
                input.FuncionarioId,
                input.AlocacaoId,
                input.Data,
                0m,
                input.StatusDiaria,
                input.TipoDiaria
            );

            diariasCriadas.Add(diaria);
            _repository.Add(diaria);
        }

        await _repository.UnitOfWork.CommitAsync();

        return diariasCriadas.Select(a => new DiariaDtoOutput(
            a.Id,
            a.FuncionarioId,
            a.AlocacaoId,
            a.Data,
            a.StatusDiaria,
            a.TipoDiaria
        )).ToList();
    }

    public async Task<DiariaDtoOutput> UpdateAsync(Guid id, UpdateDiariaDtoInput input)
    {
        var diaria = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        diaria.AtualizarStatus(input.StatusDiaria, input.TipoDiaria);

        _repository.Update(diaria);
        await _repository.UnitOfWork.CommitAsync();

        return DiariaDtoOutput.FromEntity(diaria)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var diaria = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        _repository.Remove(diaria);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<DiariaDtoOutput?> GetByIdAsync(Guid id)
    {
        var diaria = await _repository.GetByIdAsync(id);
        return diaria != null ? DiariaDtoOutput.FromEntity(diaria) : null;
    }

    public async Task<IEnumerable<DiariaDtoOutput>> GetAllAsync()
    {
        var diarias = await _repository.GetAllAsync();
        return diarias.Select(DiariaDtoOutput.FromEntity)!;
    }

    public async Task<IEnumerable<DiariaDtoOutput>> GetByClienteIdAsync(Guid clienteId)
    {
        var diarias = await _repository.GetByClienteIdAsync(clienteId);
        return diarias.Select(DiariaDtoOutput.FromEntity)!;
    }

    public async Task<IEnumerable<DiariaComFuncionarioDto>> GetByPostoEDataAsync(Guid postoId, DateOnly data)
    {
        // Bridge: Posto → Alocações → Diárias (since Diária now references AlocacaoId, not PostoId)
        var alocacoes = await _alocacaoRepository.GetByPostoIdAsync(postoId);
        var resultado = new List<DiariaComFuncionarioDto>();

        foreach (var alocacao in alocacoes)
        {
            var diarias = await _repository.GetByAlocacaoEDataAsync(alocacao.Id, data);
            foreach (var diaria in diarias)
            {
                if (diaria.StatusDiaria == StatusDiaria.CANCELADA) continue;

                var funcionario = await _funcionarioRepository.GetByIdAsync(diaria.FuncionarioId);
                resultado.Add(new DiariaComFuncionarioDto(
                    diaria.Id,
                    diaria.FuncionarioId,
                    funcionario?.Nome ?? "Desconhecido",
                    diaria.TipoDiaria,
                    diaria.StatusDiaria));
            }
        }

        return resultado;
    }

    public async Task UpdateStatusAsync(Guid id, StatusDiaria novoStatus)
    {
        var diaria = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        diaria.AtualizarStatus(novoStatus, diaria.TipoDiaria);
        _repository.Update(diaria);
        await _repository.UnitOfWork.CommitAsync();
    }

}
