using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class ContratoAppServiceTests
{
    private readonly Mock<IContratoRepository> _contratoRepo = new();
    private readonly Mock<ICondominioRepository> _condominioRepo = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly ContratoAppService _service;

    public ContratoAppServiceTests()
    {
        _contratoRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _service = new ContratoAppService(_contratoRepo.Object, _condominioRepo.Object, _tenantService.Object);
    }

    [Fact]
    public async Task Create_DeveCriarContrato()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var input = new CreateContratoDtoInput(
            condominioId,
            "Contrato Segurança",
            10000,
            500,
            0.2m,
            800,
            0.18m,
            10,
            0.15m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId))
            .ReturnsAsync(new Condominio(empresaId, "Cond", "11", "Rua"));
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.CreateAsync(input);

        Assert.Equal(input.Descricao, result.Descricao);
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Once);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoTenantNaoDefinido()
    {
        var input = new CreateContratoDtoInput(
            Guid.NewGuid(),
            "Contrato",
            1000,
            100,
            0.1m,
            200,
            0.15m,
            5,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PENDENTE);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Never);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoCondominioNaoExiste()
    {
        var empresaId = Guid.NewGuid();
        var input = new CreateContratoDtoInput(
            Guid.NewGuid(),
            "Contrato",
            1000,
            100,
            0.1m,
            200,
            0.15m,
            5,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Condominio?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Never);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoValoresInvalidos()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var input = new CreateContratoDtoInput(
            condominioId,
            "",
            -10,
            0,
            1.5m,
            -100,
            -0.1m,
            0,
            1.2m,
            1.5m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId))
            .ReturnsAsync(new Condominio(empresaId, "Cond", "11", "Rua"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Never);
    }

    [Fact]
    public async Task Update_DeveAtualizarDados()
    {
        var contrato = new Contrato(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Antigo",
            1000,
            100,
            0.2m,
            300,
            0.15m,
            8,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.PENDENTE);

        var input = new UpdateContratoDtoInput(
            "Novo",
            2000,
            150,
            0.25m,
            400,
            0.2m,
            12,
            0.2m,
            0.08m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            DateOnly.FromDateTime(DateTime.Today.AddDays(20)),
            StatusContrato.PAGO);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.UpdateAsync(contrato.Id, input);

        Assert.Equal(input.Descricao, result.Descricao);
        Assert.Equal(input.Status, result.Status);
    }

    [Fact]
    public async Task Update_DeveFalhar_QuandoContratoNaoExiste()
    {
        _contratoRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Contrato?)null);

        var input = new UpdateContratoDtoInput(
            "Desc",
            1000,
            50,
            0.1m,
            100,
            0.1m,
            5,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PAGO);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(Guid.NewGuid(), input));
    }

    [Fact]
    public async Task Update_DeveFalhar_QuandoDadosInvalidos()
    {
        var contrato = CriarContratoValido();
        var input = new UpdateContratoDtoInput(
            "",
            0,
            -1,
            1.1m,
            -100,
            -0.1m,
            0,
            1.2m,
            1.5m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.PAGO);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(contrato.Id, input));
    }

    [Fact]
    public async Task Delete_DeveRemoverQuandoExiste()
    {
        var contrato = new Contrato(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Contrato",
            100,
            10,
            0.1m,
            50,
            0.1m,
            3,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PENDENTE);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        await _service.DeleteAsync(contrato.Id);

        _contratoRepo.Verify(r => r.Remove(contrato), Times.Once);
    }

    [Fact]
    public async Task Delete_DeveFalhar_QuandoContratoInexistente()
    {
        _contratoRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Contrato?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(Guid.NewGuid()));
        _contratoRepo.Verify(r => r.Remove(It.IsAny<Contrato>()), Times.Never);
    }

    private static Contrato CriarContratoValido()
    {
        return new Contrato(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Contrato base",
            1000,
            100,
            0.2m,
            300,
            0.15m,
            8,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.PENDENTE);
    }
}
