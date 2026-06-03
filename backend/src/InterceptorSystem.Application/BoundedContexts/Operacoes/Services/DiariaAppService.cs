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

    public async Task<DiariaDtoOutput> CreateAsync(CreateDiariaDtoInput input, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");

        var funcionario = await _funcionarioRepository.GetByIdAsync(input.FuncionarioId, ct)
            ?? throw new KeyNotFoundException("Funcionário não encontrado.");

        var alocacao = await _alocacaoRepository.GetByIdAsync(input.AlocacaoId, ct)
            ?? throw new KeyNotFoundException("Alocação não encontrada.");

        var existeDiariaMesmaData = await _repository.ExisteDiariaNaDataAsync(funcionario.Id, input.Data, null, ct);
        if (existeDiariaMesmaData)
            throw new InvalidOperationException("Funcionário já possui diária neste período.");

        var (valorDiaria, tagIdResolvido) = await ResolverTagEValorDiariaAsync(funcionario, alocacao.ContratoId, ct);

        var diaria = new Diaria(
            empresaId,
            funcionario.Id,
            alocacao.Id,
            input.Data,
            valorDiaria,
            input.StatusDiaria,
            input.TipoDiaria,
            tagIdResolvido);

        if (input.DiariaSubstituidaId.HasValue && !string.IsNullOrEmpty(input.OrigemModificacao))
        {
            diaria.RegistrarRastreabilidadeSubstituicao(input.DiariaSubstituidaId.Value, input.OrigemModificacao);
        }

        _repository.Add(diaria);
        await _repository.UnitOfWork.CommitAsync(ct);

        return DiariaDtoOutput.FromEntity(diaria)!;
    }

    public async Task<List<DiariaDtoOutput>> CreateBatchAsync(CreateDiariasBatchDtoInput batch, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado.");
        if (batch.Diarias == null || !batch.Diarias.Any()) throw new InvalidOperationException("Nenhuma diária foi informada.");

        var diariasCriadas = new List<Diaria>();

        foreach (var input in batch.Diarias)
        {
            var funcionario = await _funcionarioRepository.GetByIdAsync(input.FuncionarioId, ct)
                ?? throw new KeyNotFoundException("Funcionário não encontrado.");

            var alocacao = await _alocacaoRepository.GetByIdAsync(input.AlocacaoId, ct)
                ?? throw new KeyNotFoundException("Alocação não encontrada.");

            var (valorDiaria, tagIdResolvido) = await ResolverTagEValorDiariaAsync(funcionario, alocacao.ContratoId, ct);

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

        await _repository.UnitOfWork.CommitAsync(ct);

        return diariasCriadas.Select(a => DiariaDtoOutput.FromEntity(a)!).ToList();
    }

    public async Task<DiariaDtoOutput> UpdateAsync(Guid id, UpdateDiariaDtoInput input, CancellationToken ct = default)
    {
        var diaria = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        diaria.AtualizarStatus(input.StatusDiaria, input.TipoDiaria);

        _repository.Update(diaria);
        await _repository.UnitOfWork.CommitAsync(ct);

        return DiariaDtoOutput.FromEntity(diaria)!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var diaria = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        diaria.PrepararExclusao();
        _repository.Remove(diaria);
        await _repository.UnitOfWork.CommitAsync(ct);
    }

    public async Task<DiariaDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var diaria = await _repository.GetByIdAsync(id, ct);
        return diaria != null ? DiariaDtoOutput.FromEntity(diaria) : null;
    }

    public async Task<IEnumerable<DiariaDtoOutput>> GetAllAsync(CancellationToken ct = default)
    {
        var diarias = await _repository.GetAllAsync(ct);
        return diarias.Select(DiariaDtoOutput.FromEntity)!;
    }

    public async Task<IEnumerable<DiariaDtoOutput>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var diarias = await _repository.GetByClienteIdAsync(clienteId, ct);
        return diarias.Select(DiariaDtoOutput.FromEntity)!;
    }

    public async Task<IEnumerable<DiariaComFuncionarioDto>> GetByPostoEDataAsync(Guid postoId, DateOnly data, CancellationToken ct = default)
    {
        // Bridge: Posto -> Alocacoes -> Diarias (since Diaria now references AlocacaoId, not PostoId)
        var alocacoes = await _alocacaoRepository.GetByPostoIdAsync(postoId, ct);
        var resultado = new List<DiariaComFuncionarioDto>();

        foreach (var alocacao in alocacoes)
        {
            var diarias = await _repository.GetByAlocacaoEDataAsync(alocacao.Id, data, ct);
            foreach (var diaria in diarias)
            {
                if (diaria.StatusDiaria == StatusDiaria.CANCELADA) continue;

                var funcionario = await _funcionarioRepository.GetByIdAsync(diaria.FuncionarioId, ct);
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

    public async Task UpdateStatusAsync(Guid id, StatusDiaria novoStatus, string? origem = null, CancellationToken ct = default)
    {
        var diaria = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Diária não encontrada.");

        diaria.AtualizarStatus(novoStatus, diaria.TipoDiaria, origem);
        _repository.Update(diaria);
        await _repository.UnitOfWork.CommitAsync(ct);
    }

    public async Task<DiariasContratoResumoDto> GetResumoByContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default)
    {
        var inicio = new DateOnly(ano, mes, 1);
        var fim = inicio.AddMonths(1).AddDays(-1);

        var diarias = (await _repository.GetByContratoIdAsync(contratoId, inicio, fim, ct)).ToList();

        var contrato = await _contratoRepository.GetByIdAsync(contratoId, ct);
        var tagNomes = contrato?.Tags.ToDictionary(ct => ct.TagId, ct => ct.Tag?.Nome ?? "Sem Tag")
                       ?? new Dictionary<Guid, string>();

        var totalConfirmadas = diarias.Count(d => d.StatusDiaria == StatusDiaria.CONFIRMADA);
        var totalFaltas = diarias.Count(d => d.StatusDiaria == StatusDiaria.FALTA_INJUSTIFICADA || d.StatusDiaria == StatusDiaria.FALTA_JUSTIFICADA);
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

    public async Task<ContratoResumoFinanceiroDto> GetResumoFinanceiroContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default)
    {
        var diarias = (await _repository.GetResumoFinanceiroByContratoAsync(contratoId, ano, mes, ct)).ToList();

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

        var contrato = await _contratoRepository.GetByIdAsync(contratoId, ct);
        var beneficios = contrato?.ValorBeneficiosExtrasMensal ?? 0m;
        var rawAdicNoturno = contrato?.PercentualAdicionalNoturno ?? 0m;
        var adicNoturno = rawAdicNoturno > 1m ? rawAdicNoturno / 100m : rawAdicNoturno;

        var projecaoPorFuncionario = diarias
            .Where(d => d.Funcionario != null)
            .GroupBy(d => new { d.FuncionarioId, NomeFuncionario = d.Funcionario!.Nome })
            .Select(g => 
            {
                var temNoturno = g.Any(d => d.Alocacao != null && d.Alocacao.TemHorarioNoturno);
                var sumDiarias = g.Sum(d => d.ValorDiaria);
                if (temNoturno) sumDiarias *= (1 + adicNoturno);
                return new ContratoResumoFinanceiroFuncionarioDto(
                    g.Key.FuncionarioId,
                    g.Key.NomeFuncionario,
                    g.Count(),
                    sumDiarias + beneficios,
                    g.Count(d => d.TipoDiaria == TipoDiaria.REGULAR),
                    g.Count(d => d.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA || d.TipoDiaria == TipoDiaria.SUBSTITUICAO),
                    g.Count(d => d.Data.DayOfWeek == DayOfWeek.Saturday || d.Data.DayOfWeek == DayOfWeek.Sunday));
            })
            .OrderByDescending(g => g.CustoTotal)
            .ToList();

        var diariasDiurnas = diarias.Where(d => d.Alocacao != null && !d.Alocacao.TemHorarioNoturno).ToList();
        var totalFuncionariosDiurnos = diariasDiurnas.Select(d => d.FuncionarioId).Distinct().Count();
        var mediaSalarialDiurna = totalFuncionariosDiurnos > 0 
            ? (diariasDiurnas.Sum(d => d.ValorDiaria) / totalFuncionariosDiurnos) + beneficios 
            : 0m;
        
        var diariasNoturnas = diarias.Where(d => d.Alocacao != null && d.Alocacao.TemHorarioNoturno).ToList();
        var totalFuncionariosNoturnos = diariasNoturnas.Select(d => d.FuncionarioId).Distinct().Count();
        var mediaSalarialNoturna = totalFuncionariosNoturnos > 0 
            ? ((diariasNoturnas.Sum(d => d.ValorDiaria) / totalFuncionariosNoturnos) * (1 + adicNoturno)) + beneficios 
            : 0m;

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
            mediaSalarialDiurna,
            mediaSalarialNoturna,
            projecaoPorPosto,
            projecaoPorAlocacao,
            projecaoPorFuncionario);
    }

    private async Task<(decimal ValorDiaria, Guid? TagId)> ResolverTagEValorDiariaAsync(Funcionario funcionario, Guid contratoId, CancellationToken ct = default)
    {
        var contrato = await _contratoRepository.GetByIdAsync(contratoId, ct);
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

    public async Task<IEnumerable<DiariaSubstituicaoDto>> GetHistoricoSubstituicoesAsync(CancellationToken ct = default)
    {
        var diarias = await _repository.GetHistoricoSubstituicoesAsync(ct);
        var result = new List<DiariaSubstituicaoDto>();

        foreach (var diaria in diarias)
        {
            Guid? originalFuncionarioId = null;
            string? originalFuncionarioNome = null;

            if (diaria.DiariaSubstituidaId.HasValue)
            {
                var originalDiaria = await _repository.GetByIdAsync(diaria.DiariaSubstituidaId.Value, ct);
                if (originalDiaria != null)
                {
                    var originalFunc = await _funcionarioRepository.GetByIdAsync(originalDiaria.FuncionarioId, ct);
                    originalFuncionarioId = originalDiaria.FuncionarioId;
                    originalFuncionarioNome = originalFunc?.Nome;
                }
            }

            result.Add(new DiariaSubstituicaoDto(
                diaria.Id,
                diaria.Data,
                diaria.FuncionarioId,
                diaria.Funcionario?.Nome ?? "Desconhecido",
                diaria.DiariaSubstituidaId,
                originalFuncionarioId,
                originalFuncionarioNome,
                diaria.Alocacao?.PostoId ?? Guid.Empty,
                diaria.Alocacao?.Posto?.Nome ?? "Desconhecido",
                diaria.OrigemModificacao ?? "Manual",
                diaria.DataHoraModificacao ?? diaria.CreatedAt
            ));
        }

        return result;
    }
}
