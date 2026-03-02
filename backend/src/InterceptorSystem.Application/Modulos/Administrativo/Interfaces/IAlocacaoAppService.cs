using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

public interface IAlocacaoAppService
{
    Task<AlocacaoDtoOutput> CreateAsync(CreateAlocacaoDtoInput input);
    Task<List<AlocacaoDtoOutput>> CreateBatchAsync(CreateAlocacoesBatchDtoInput batch);
    Task<AlocacaoDtoOutput> UpdateAsync(Guid id, UpdateAlocacaoDtoInput input);
    Task DeleteAsync(Guid id);
    Task<AlocacaoDtoOutput?> GetByIdAsync(Guid id);
    Task<IEnumerable<AlocacaoDtoOutput>> GetAllAsync();

    /// <summary>Retorna alocações de um posto em uma data específica, incluindo nome do funcionário.</summary>
    Task<IEnumerable<AlocacaoComFuncionarioDto>> GetByPostoEDataAsync(Guid postoId, DateOnly data);

    /// <summary>Atualiza apenas o status de uma alocação (ex: CANCELADA para substituição via bot).</summary>
    Task UpdateStatusAsync(Guid id, StatusAlocacao novoStatus);
}
