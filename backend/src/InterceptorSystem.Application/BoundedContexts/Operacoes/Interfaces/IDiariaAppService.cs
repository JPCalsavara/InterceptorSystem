using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IDiariaAppService
{
    Task<DiariaDtoOutput> CreateAsync(CreateDiariaDtoInput input);
    Task<List<DiariaDtoOutput>> CreateBatchAsync(CreateDiariasBatchDtoInput batch);
    Task<DiariaDtoOutput> UpdateAsync(Guid id, UpdateDiariaDtoInput input);
    Task DeleteAsync(Guid id);
    Task<DiariaDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<DiariaDtoOutput>> GetAllAsync();
    Task<IEnumerable<DiariaDtoOutput>> GetByClienteIdAsync(Guid clienteId);

    /// <summary>Retorna diárias de um posto em uma data específica, incluindo nome do funcionário.</summary>
    Task<IEnumerable<DiariaComFuncionarioDto>> GetByPostoEDataAsync(Guid postoId, DateOnly data);

    /// <summary>Atualiza apenas o status de uma diária (ex: CANCELADA para substituição via bot).</summary>
    Task UpdateStatusAsync(Guid id, StatusDiaria novoStatus);

    /// <summary>Retorna resumo agregado das diárias de um contrato em um período (mês/ano), agrupado por tag.</summary>
    Task<DiariasContratoResumoDto> GetResumoByContratoAsync(Guid contratoId, int ano, int mes);

    /// <summary>Retorna resumo financeiro real de diárias confirmadas de um contrato em um período (mês/ano).</summary>
    Task<ContratoResumoFinanceiroDto> GetResumoFinanceiroContratoAsync(Guid contratoId, int ano, int mes);
}
