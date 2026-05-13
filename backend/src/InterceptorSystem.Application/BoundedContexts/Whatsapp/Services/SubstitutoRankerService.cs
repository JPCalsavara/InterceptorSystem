using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Services;

/// <summary>
/// Ranqueia funcionários disponíveis para substituição em uma data específica.
/// Critérios (por ordem de importância):
/// 1. StatusFuncionario == ATIVO (obrigatório)
/// 2. Não possui diária já confirmada na data alvo (obrigatório)
/// 3. Score = quantidade de diárias nos últimos 30 dias (menor = melhor)
/// </summary>
public class SubstitutoRankerService
{
    private readonly IFuncionarioRepository _funcionarios;
    private readonly IDiariaRepository _diarias;

    public SubstitutoRankerService(
        IFuncionarioRepository funcionarios,
        IDiariaRepository diarias)
    {
        _funcionarios = funcionarios;
        _diarias = diarias;
    }

    public async Task<IEnumerable<SubstitutoDto>> ObterSubstitutosRankeadosAsync(
        Guid clienteId,
        DateOnly data)
    {
        var todos = await _funcionarios.GetByClienteAsync(clienteId);
        var ativos = todos.Where(f => f.StatusFuncionario == StatusFuncionario.ATIVO).ToList();

        var resultado = new List<SubstitutoDto>();

        foreach (var funcionario in ativos)
        {
            var jaAlocado = await _diarias.ExisteDiariaNaDataAsync(funcionario.Id, data);
            if (jaAlocado) continue;

            var diariasRecentes = await _diarias.GetByFuncionarioAsync(funcionario.Id);
            var score = diariasRecentes.Count(a =>
                a.Data >= data.AddDays(-30) &&
                a.Data <= data &&
                a.StatusDiaria != StatusDiaria.CANCELADA);

            var indicador = score <= 10 ? "Alta" :
                            score <= 18 ? "Média" : "Baixa";

            resultado.Add(new SubstitutoDto(
                funcionario.Id,
                funcionario.Nome,
                funcionario.TipoEscala,
                indicador,
                score));
        }

        return resultado.OrderBy(r => r.Score);
    }
}

public record SubstitutoDto(
    Guid Id,
    string Nome,
    TipoEscala TipoEscala,
    string IndicadorDisponibilidade,
    int Score);
