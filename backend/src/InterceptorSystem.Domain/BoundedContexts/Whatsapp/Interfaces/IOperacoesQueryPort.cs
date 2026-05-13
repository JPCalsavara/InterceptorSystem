using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Whatsapp.Interfaces;

/// <summary>
/// ACL do BC WhatsApp para leituras/escritas necessárias no BC Operacoes.
/// Evita dependência direta de repositórios/serviços do domínio operacional.
/// </summary>
public interface IOperacoesQueryPort
{
    Task<IReadOnlyList<ClienteResumo>> GetClientesAtivosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(Guid clienteId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DiariaResumo>> GetDiariasByPostoEDataAsync(Guid postoId, DateOnly data, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubstitutoResumo>> GetSubstitutosRankeadosAsync(Guid clienteId, DateOnly data, CancellationToken cancellationToken = default);

    Task CancelarDiariaAsync(Guid diariaId, CancellationToken cancellationToken = default);
    Task<DiariaResumo?> GetDiariaByIdAsync(Guid diariaId, CancellationToken cancellationToken = default);
    Task CriarDiariaSubstituicaoAsync(Guid funcionarioId, Guid alocacaoId, DateOnly data, CancellationToken cancellationToken = default);
}

public record ClienteResumo(Guid Id, string Nome);

public record PostoResumo(Guid Id, string Nome, string Cidade);

public record DiariaResumo(
    Guid Id,
    Guid FuncionarioId,
    Guid AlocacaoId,
    string NomeFuncionario,
    TipoDiaria TipoDiaria,
    StatusDiaria StatusDiaria);

public record SubstitutoResumo(
    Guid Id,
    string Nome,
    TipoEscala TipoEscala,
    string IndicadorDisponibilidade,
    int Score);