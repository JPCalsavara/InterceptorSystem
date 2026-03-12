using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

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
}
