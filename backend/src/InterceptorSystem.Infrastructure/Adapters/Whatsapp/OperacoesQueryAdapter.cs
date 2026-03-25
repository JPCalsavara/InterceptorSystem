using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;

namespace InterceptorSystem.Infrastructure.Adapters.Whatsapp;

public class OperacoesQueryAdapter : IOperacoesQueryPort
{
    private readonly IClienteRepository _clienteRepository;
    private readonly IPostoRepository _postoRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IDiariaRepository _diariaRepository;
    private readonly IDiariaAppService _diariaAppService;

    public OperacoesQueryAdapter(
        IClienteRepository clienteRepository,
        IPostoRepository postoRepository,
        IFuncionarioRepository funcionarioRepository,
        IDiariaRepository diariaRepository,
        IDiariaAppService diariaAppService)
    {
        _clienteRepository = clienteRepository;
        _postoRepository = postoRepository;
        _funcionarioRepository = funcionarioRepository;
        _diariaRepository = diariaRepository;
        _diariaAppService = diariaAppService;
    }

    public async Task<IReadOnlyList<ClienteResumo>> GetClientesAtivosAsync(CancellationToken cancellationToken = default)
    {
        var clientes = await _clienteRepository.GetAllAsync(cancellationToken);
        return clientes
            .Where(c => c.Ativo)
            .Select(c => new ClienteResumo(c.Id, c.Nome))
            .ToList();
    }

    public async Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(Guid clienteId, CancellationToken cancellationToken = default)
    {
        var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
        return postos
            .Select(p => new PostoResumo(p.Id, p.Nome, p.Cidade))
            .ToList();
    }

    public async Task<IReadOnlyList<DiariaResumo>> GetDiariasByPostoEDataAsync(Guid postoId, DateOnly data, CancellationToken cancellationToken = default)
    {
        var diarias = await _diariaAppService.GetByPostoEDataAsync(postoId, data);
        return diarias
            .Select(d => new DiariaResumo(d.Id, d.FuncionarioId, Guid.Empty, d.NomeFuncionario, d.TipoDiaria, d.StatusDiaria))
            .ToList();
    }

    public async Task<IReadOnlyList<SubstitutoResumo>> GetSubstitutosRankeadosAsync(Guid clienteId, DateOnly data, CancellationToken cancellationToken = default)
    {
        var todos = await _funcionarioRepository.GetByClienteAsync(clienteId);
        var ativos = todos.Where(f => f.StatusFuncionario == StatusFuncionario.ATIVO).ToList();

        var resultado = new List<SubstitutoResumo>();

        foreach (var funcionario in ativos)
        {
            var jaAlocado = await _diariaRepository.ExisteDiariaNaDataAsync(funcionario.Id, data);
            if (jaAlocado)
            {
                continue;
            }

            var diariasRecentes = await _diariaRepository.GetByFuncionarioAsync(funcionario.Id);
            var score = diariasRecentes.Count(a =>
                a.Data >= data.AddDays(-30) &&
                a.Data <= data &&
                a.StatusDiaria != StatusDiaria.CANCELADA);

            var indicador = score <= 10 ? "Alta" :
                            score <= 18 ? "Média" : "Baixa";

            resultado.Add(new SubstitutoResumo(
                funcionario.Id,
                funcionario.Nome,
                funcionario.TipoEscala,
                indicador,
                score));
        }

        return resultado.OrderBy(r => r.Score).ToList();
    }

    public async Task CancelarDiariaAsync(Guid diariaId, CancellationToken cancellationToken = default)
    {
        await _diariaAppService.UpdateStatusAsync(diariaId, StatusDiaria.CANCELADA);
    }

    public async Task<DiariaResumo?> GetDiariaByIdAsync(Guid diariaId, CancellationToken cancellationToken = default)
    {
        var diaria = await _diariaAppService.GetByIdAsync(diariaId);
        if (diaria is null)
        {
            return null;
        }

        return new DiariaResumo(
            diaria.Id,
            diaria.FuncionarioId,
            diaria.AlocacaoId,
            string.Empty,
            diaria.TipoDiaria,
            diaria.StatusDiaria);
    }

    public async Task CriarDiariaSubstituicaoAsync(Guid funcionarioId, Guid alocacaoId, DateOnly data, CancellationToken cancellationToken = default)
    {
        await _diariaAppService.CreateAsync(new CreateDiariaDtoInput(
            funcionarioId,
            alocacaoId,
            data,
            StatusDiaria.CONFIRMADA,
            TipoDiaria.SUBSTITUICAO));
    }
}
