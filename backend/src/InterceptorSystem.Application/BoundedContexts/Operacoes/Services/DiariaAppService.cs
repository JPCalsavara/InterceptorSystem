using System;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class DiariaAppService : IDiariaAppService
{
    private readonly IDiariaRepository _repository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IAlocacaoRepository _alocacaoRepository;
    private readonly IContratoRepository _contratoRepository;
    private readonly ICurrentTenantService _tenantService;

    public DiariaAppService(
        IDiariaRepository repository,
        IFuncionarioRepository funcionarioRepository,
        IAlocacaoRepository alocacaoRepository,
        IContratoRepository contratoRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _funcionarioRepository = funcionarioRepository;
        _alocacaoRepository = alocacaoRepository;
        _contratoRepository = contratoRepository;
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

        var (valorDiaria, tagIdResolvido) = await ResolverTagEValorDiariaAsync(funcionario, alocacao.ContratoId);

        var diaria = new Diaria(
            empresaId,
            funcionario.Id,
            alocacao.Id,
            input.Data,
            valorDiaria,
            input.StatusDiaria,
            input.TipoDiaria,
            tagIdResolvido);

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
            var funcionario = await _funcionarioRepository.GetByIdAsync(input.FuncionarioId)
                ?? throw new KeyNotFoundException("Funcionário não encontrado.");

            var alocacao = await _alocacaoRepository.GetByIdAsync(input.AlocacaoId)
                ?? throw new KeyNotFoundException("Alocação não encontrada.");

            var (valorDiaria, tagIdResolvido) = await ResolverTagEValorDiariaAsync(funcionario, alocacao.ContratoId);

            var diaria = new Diaria(
                empresaId,
                input.FuncionarioId,
                input.AlocacaoId,
                input.Data,
                valorDiaria,
                input.StatusDiaria,
                input.TipoDiaria,
                tagIdResolvido
            );

            diariasCriadas.Add(diaria);
            _repository.Add(diaria);
        }

        await _repository.UnitOfWork.CommitAsync();

        return diariasCriadas.Select(a => DiariaDtoOutput.FromEntity(a)!).ToList();
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

        diaria.PrepararExclusao();
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
        // Bridge: Posto -> Alocacoes -> Diarias (since Diaria now references AlocacaoId, not PostoId)
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

    public async Task<DiariasContratoResumoDto> GetResumoByContratoAsync(Guid contratoId, int ano, int mes)
    {
        var inicio = new DateOnly(ano, mes, 1);
        var fim = inicio.AddMonths(1).AddDays(-1);

        var diarias = (await _repository.GetByContratoIdAsync(contratoId, inicio, fim)).ToList();

        var contrato = await _contratoRepository.GetByIdAsync(contratoId);
        var tagNomes = contrato?.Tags.ToDictionary(ct => ct.TagId, ct => ct.Tag?.Nome ?? "Sem Tag")
                       ?? new Dictionary<Guid, string>();

        var totalConfirmadas = diarias.Count(d => d.StatusDiaria == StatusDiaria.CONFIRMADA);
        var totalFaltas = diarias.Count(d => d.StatusDiaria == StatusDiaria.FALTA_REGISTRADA);
        var totalCanceladas = diarias.Count(d => d.StatusDiaria == StatusDiaria.CANCELADA);

        var resumoByTag = diarias
            .GroupBy(d => d.TagId)
            .Select(g =>
            {
                var tagNome = g.Key.HasValue && tagNomes.TryGetValue(g.Key.Value, out var nome)
                    ? nome
                    : "Sem Tag";
                return new DiariaTagResumoDto(
                    g.Key,
                    tagNome,
                    g.Count(),
                    g.Sum(d => d.ValorDiaria));
            })
            .OrderByDescending(r => r.TotalValor)
            .ToList();

        return new DiariasContratoResumoDto(
            contratoId,
            ano,
            mes,
            diarias.Count,
            diarias.Sum(d => d.ValorDiaria),
            totalConfirmadas,
            totalFaltas,
            totalCanceladas,
            resumoByTag);
    }

    public async Task<ContratoResumoFinanceiroDto> GetResumoFinanceiroContratoAsync(Guid contratoId, int ano, int mes)
    {
        var diarias = (await _repository.GetResumoFinanceiroByContratoAsync(contratoId, ano, mes)).ToList();

        var totalDiariasNormais = diarias.Count(d => d.TipoDiaria == TipoDiaria.REGULAR);
        var totalDiariasExtras = diarias.Count(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO);
        var totalDiariasFimDeSemana = diarias.Count(d => d.Data.DayOfWeek == DayOfWeek.Saturday || d.Data.DayOfWeek == DayOfWeek.Sunday);
        var custoRealDiariasNormais = diarias
            .Where(d => d.TipoDiaria == TipoDiaria.REGULAR)
            .Sum(d => d.ValorDiaria);
        var custoRealDiariasExtras = diarias
            .Where(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO)
            .Sum(d => d.ValorDiaria);

        var projecaoPorPosto = diarias
            .Where(d => d.Alocacao?.Posto != null)
            .GroupBy(d => new { d.Alocacao!.PostoId, NomePosto = d.Alocacao.Posto!.Nome })
            .Select(g => new ContratoResumoFinanceiroPostoDto(
                g.Key.PostoId,
                g.Key.NomePosto,
                g.Count(),
                g.Sum(d => d.ValorDiaria),
                g.Count(d => d.TipoDiaria == TipoDiaria.REGULAR),
                g.Count(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO),
                g.Count(d => d.Data.DayOfWeek == DayOfWeek.Saturday || d.Data.DayOfWeek == DayOfWeek.Sunday)))
            .OrderByDescending(g => g.CustoTotal)
            .ToList();

        var projecaoPorAlocacao = diarias
            .Where(d => d.Alocacao != null)
            .GroupBy(d => new { d.AlocacaoId, d.Alocacao!.TipoEscala, d.Alocacao.TemHorarioNoturno })
            .Select(g => new ContratoResumoFinanceiroAlocacaoDto(
                g.Key.AlocacaoId,
                g.Key.TipoEscala,
                g.Key.TemHorarioNoturno,
                g.Count(),
                g.Sum(d => d.ValorDiaria),
                g.Count(d => d.TipoDiaria == TipoDiaria.REGULAR),
                g.Count(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO),
                g.Count(d => d.Data.DayOfWeek == DayOfWeek.Saturday || d.Data.DayOfWeek == DayOfWeek.Sunday)))
            .OrderByDescending(g => g.CustoTotal)
            .ToList();

        var projecaoPorFuncionario = diarias
            .Where(d => d.Funcionario != null)
            .GroupBy(d => new { d.FuncionarioId, NomeFuncionario = d.Funcionario!.Nome })
            .Select(g => new ContratoResumoFinanceiroFuncionarioDto(
                g.Key.FuncionarioId,
                g.Key.NomeFuncionario,
                g.Count(),
                g.Sum(d => d.ValorDiaria),
                g.Count(d => d.TipoDiaria == TipoDiaria.REGULAR),
                g.Count(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO),
                g.Count(d => d.Data.DayOfWeek == DayOfWeek.Saturday || d.Data.DayOfWeek == DayOfWeek.Sunday)))
            .OrderByDescending(g => g.CustoTotal)
            .ToList();

        return new ContratoResumoFinanceiroDto(
            contratoId,
            ano,
            mes,
            custoRealDiariasNormais,
            custoRealDiariasExtras,
            diarias.Sum(d => d.ValorDiaria),
            totalDiariasNormais,
            totalDiariasExtras,
            totalDiariasFimDeSemana,
            projecaoPorPosto,
            projecaoPorAlocacao,
            projecaoPorFuncionario);
    }

    private async Task<(decimal ValorDiaria, Guid? TagId)> ResolverTagEValorDiariaAsync(Funcionario funcionario, Guid contratoId)
    {
        var contrato = await _contratoRepository.GetByIdAsync(contratoId);
        if (contrato == null) return (0m, null);

        var valorDiariaFallback = contrato.ValorDiariaVigilante ?? 0m;
        if (contrato.Tags.Count == 0) return (valorDiariaFallback, null);

        var funcionarioTagIds = funcionario.Tags
            .Select(ft => ft.TagId)
            .ToHashSet();

        if (funcionarioTagIds.Count == 0) return (valorDiariaFallback, null);

        var melhorContratoTag = contrato.Tags
            .Where(ct => funcionarioTagIds.Contains(ct.TagId))
            .OrderByDescending(ct => ct.ValorDiaria)
            .FirstOrDefault();

        return melhorContratoTag != null
            ? (melhorContratoTag.ValorDiaria, melhorContratoTag.TagId)
            : (valorDiariaFallback, null);
    }
}
