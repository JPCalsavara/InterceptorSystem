using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

/// <summary>
/// Service responsible for managing contract tags.
/// Extracted from ContratoAppService to reduce coupling and improve single responsibility.
/// </summary>
public interface IContratoTagService
{
    /// <summary>
    /// Validates that all provided tag IDs exist in the repository.
    /// </summary>
    /// <param name="tagIds">Collection of tag IDs to validate</param>
    /// <param name="ct">Cancellation token</param>
    /// <exception cref="KeyNotFoundException">Thrown when any tag ID does not exist</exception>
    Task ValidarTagsAsync(IEnumerable<Guid> tagIds, CancellationToken ct = default);

    /// <summary>
    /// Assigns tags to a contract with proper validation.
    /// </summary>
    /// <param name="contrato">The contract to assign tags to</param>
    /// <param name="tagsInput">Tag inputs with ID and valor diaria</param>
    /// <param name="empresaId">The empresa ID for multi-tenancy support</param>
    /// <param name="ct">Cancellation token</param>
    /// <exception cref="InvalidOperationException">Thrown when empresa ID is not set</exception>
    /// <exception cref="KeyNotFoundException">Thrown when any tag does not exist</exception>
    Task AtribuirTagsAsync(
        Contrato contrato,
        IEnumerable<(Guid TagId, decimal ValorDiaria)> tagsInput,
        CancellationToken ct = default);
}

/// <summary>
/// Implementation of IContratoTagService handling tag operations for contracts.
/// </summary>
public class ContratoTagService : IContratoTagService
{
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;

    public ContratoTagService(
        ITagRepository tagRepository,
        ICurrentTenantService tenantService)
    {
        _tagRepository = tagRepository ?? throw new ArgumentNullException(nameof(tagRepository));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
    }

    /// <summary>
    /// Validates that all provided tag IDs exist in the repository.
    /// </summary>
    public async Task ValidarTagsAsync(IEnumerable<Guid> tagIds, CancellationToken ct = default)
    {
        if (tagIds == null || !tagIds.Any())
        {
            return; // No tags to validate
        }

        foreach (var tagId in tagIds.Distinct())
        {
            var tag = await _tagRepository.GetByIdAsync(tagId, ct);
            if (tag == null)
            {
                throw new KeyNotFoundException($"Tag não encontrada: {tagId}.");
            }
        }
    }

    /// <summary>
    /// Assigns tags to a contract with validation and deduplication.
    /// </summary>
    public async Task AtribuirTagsAsync(
        Contrato contrato,
        IEnumerable<(Guid TagId, decimal ValorDiaria)> tagsInput,
        CancellationToken ct = default)
    {
        if (contrato == null)
        {
            throw new ArgumentNullException(nameof(contrato));
        }

        if (tagsInput == null || !tagsInput.Any())
        {
            return; // No tags to assign
        }

        var empresaId = _tenantService.EmpresaId
            ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        // Validate all tags exist
        var tagIds = tagsInput.Select(t => t.TagId).Distinct();
        await ValidarTagsAsync(tagIds, ct);

        // Create ContratoTag objects with deduplication
        var tags = tagsInput
            .DistinctBy(t => t.TagId)
            .Select(t => new ContratoTag(empresaId, contrato.Id, t.TagId, t.ValorDiaria))
            .ToList();

        contrato.DefinirTags(tags);
    }
}
