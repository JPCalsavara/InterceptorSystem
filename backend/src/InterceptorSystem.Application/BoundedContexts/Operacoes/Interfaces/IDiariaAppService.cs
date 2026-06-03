using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;

public interface IDiariaAppService
{
    Task<DiariaDtoOutput> CreateAsync(CreateDiariaDtoInput input, CancellationToken ct = default);
    Task<List<DiariaDtoOutput>> CreateBatchAsync(CreateDiariasBatchDtoInput batch, CancellationToken ct = default);
    Task<DiariaDtoOutput> UpdateAsync(Guid id, UpdateDiariaDtoInput input, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<DiariaDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<DiariaDtoOutput>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<DiariaDtoOutput>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default);

    /// <summary>Retorna diárias de um posto em uma data específica, incluindo nome do funcionário.</summary>
    Task<IEnumerable<DiariaComFuncionarioDto>> GetByPostoEDataAsync(Guid postoId, DateOnly data, CancellationToken ct = default);

    /// <summary>Atualiza apenas o status de uma diária (ex: CANCELADA para substituição via bot).</summary>
    Task UpdateStatusAsync(Guid id, StatusDiaria novoStatus, string? origem = null, CancellationToken ct = default);

    /// <summary>Retorna resumo agregado das diárias de um contrato em um período (mês/ano), agrupado por tag.</summary>
    Task<DiariasContratoResumoDto> GetResumoByContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default);

    /// <summary>Retorna resumo financeiro real de diárias confirmadas de um contrato em um período (mês/ano).</summary>
    Task<ContratoResumoFinanceiroDto> GetResumoFinanceiroContratoAsync(Guid contratoId, int ano, int mes, CancellationToken ct = default);

    /// <summary>Retorna o histórico de substituições de diárias do tenant atual.</summary>
    Task<IEnumerable<DiariaSubstituicaoDto>> GetHistoricoSubstituicoesAsync(CancellationToken ct = default);
}
