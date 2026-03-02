using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Whatsapp.Services;

/// <summary>
/// Ranqueia funcionários disponíveis para substituição em uma data específica.
/// Critérios (por ordem de importância):
/// 1. StatusFuncionario == ATIVO (obrigatório)
/// 2. Não possui alocação já confirmada na data alvo (obrigatório)
/// 3. Score = quantidade de alocações nos últimos 30 dias (menor = melhor)
/// </summary>
public class SubstitutoRankerService
{
    private readonly IFuncionarioRepository _funcionarios;
    private readonly IAlocacaoRepository _alocacoes;

    public SubstitutoRankerService(
        IFuncionarioRepository funcionarios,
        IAlocacaoRepository alocacoes)
    {
        _funcionarios = funcionarios;
        _alocacoes = alocacoes;
    }

    public async Task<IEnumerable<SubstitutoDto>> ObterSubstitutosRankeadosAsync(
        Guid condominioId,
        DateOnly data)
    {
        var todos = await _funcionarios.GetByCondominioAsync(condominioId);
        var ativos = todos.Where(f => f.StatusFuncionario == StatusFuncionario.ATIVO).ToList();

        var resultado = new List<SubstitutoDto>();

        foreach (var funcionario in ativos)
        {
            var jaAlocado = await _alocacoes.ExisteAlocacaoNaDataAsync(funcionario.Id, data);
            if (jaAlocado) continue;

            var alocacoesRecentes = await _alocacoes.GetByFuncionarioAsync(funcionario.Id);
            var score = alocacoesRecentes.Count(a =>
                a.Data >= data.AddDays(-30) &&
                a.Data <= data &&
                a.StatusAlocacao != StatusAlocacao.CANCELADA);

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
