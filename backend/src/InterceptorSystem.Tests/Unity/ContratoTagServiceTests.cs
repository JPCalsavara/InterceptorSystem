using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class ContratoTagServiceTests
{
    private readonly Mock<ITagRepository> _tagRepository = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly ContratoTagService _service;
    private readonly Guid _empresaId = Guid.NewGuid();

    public ContratoTagServiceTests()
    {
        _tenantService.Setup(t => t.EmpresaId).Returns(_empresaId);
        _service = new ContratoTagService(_tagRepository.Object, _tenantService.Object);
    }

    [Fact]
    public async Task ValidarTagsAsync_ComTagsValidas_NaoLancaExcecao()
    {
        var tagId1 = Guid.NewGuid();
        var tagId2 = Guid.NewGuid();

        _tagRepository.Setup(r => r.GetByIdAsync(tagId1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTag(tagId1));
        _tagRepository.Setup(r => r.GetByIdAsync(tagId2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTag(tagId2));

        await _service.ValidarTagsAsync(new[] { tagId1, tagId2 });

        _tagRepository.Verify(r => r.GetByIdAsync(tagId1, It.IsAny<CancellationToken>()), Times.Once);
        _tagRepository.Verify(r => r.GetByIdAsync(tagId2, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ValidarTagsAsync_ComTagInvalida_LancaKeyNotFoundException()
    {
        var tagId = Guid.NewGuid();
        _tagRepository.Setup(r => r.GetByIdAsync(tagId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.ValidarTagsAsync(new[] { tagId }));
    }

    [Fact]
    public async Task ValidarTagsAsync_ComTagsDuplicadas_ConsultaUmaVez()
    {
        var tagId = Guid.NewGuid();
        _tagRepository.Setup(r => r.GetByIdAsync(tagId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTag(tagId));

        await _service.ValidarTagsAsync(new[] { tagId, tagId, tagId });

        _tagRepository.Verify(r => r.GetByIdAsync(tagId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AtribuirTagsAsync_ComTagsValidas_AtribuiCorretamente()
    {
        var contrato = CriarContrato();
        var tagId = Guid.NewGuid();
        _tagRepository.Setup(r => r.GetByIdAsync(tagId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTag(tagId));

        await _service.AtribuirTagsAsync(
            contrato,
            new[] { (tagId, 50m) });

        Assert.Single(contrato.Tags);
        Assert.Equal(tagId, contrato.Tags.First().TagId);
        Assert.Equal(50m, contrato.Tags.First().ValorDiaria);
    }

    [Fact]
    public async Task AtribuirTagsAsync_SemTenant_LancaInvalidOperationException()
    {
        _tenantService.Setup(t => t.EmpresaId).Returns((Guid?)null);

        var contrato = CriarContrato();
        var tagId = Guid.NewGuid();
        _tagRepository.Setup(r => r.GetByIdAsync(tagId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTag(tagId));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.AtribuirTagsAsync(
            contrato,
            new[] { (tagId, 50m) }));
    }

    private static Contrato CriarContrato()
    {
        return new Contrato(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Contrato Teste",
            10000m,
            120m,
            0.2m,
            1.0m,
            350m,
            0.15m,
            2,
            0.2m,
            0.1m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(1)),
            StatusContrato.ATIVO);
    }

    private static Tag CriarTag(Guid id)
    {
        var tag = new Tag(Guid.NewGuid(), $"Tag {id:N}", 10m);
        typeof(InterceptorSystem.Domain.SharedKernel.Entity)
            .GetProperty("Id", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic)!
            .SetValue(tag, id);
        return tag;
    }
}
