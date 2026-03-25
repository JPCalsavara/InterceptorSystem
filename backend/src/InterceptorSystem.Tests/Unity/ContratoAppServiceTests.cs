using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Domain.SharedKernel.Exceptions;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class ContratoAppServiceTests
{
    private readonly Mock<IContratoRepository> _contratoRepo = new();
    private readonly Mock<IClienteRepository> _clienteRepo = new();
    private readonly Mock<ITagRepository> _tagRepo = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly ContratoAppService _service;

    public ContratoAppServiceTests()
    {
        _contratoRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _tenantService.Setup(t => t.EmpresaId).Returns(Guid.NewGuid());
        _service = new ContratoAppService(
            _contratoRepo.Object,
            _clienteRepo.Object,
            _tagRepo.Object,
            _tenantService.Object);
    }

    [Fact]
    public async Task Create_DeveCriarContrato()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var input = new CreateContratoDtoInput(
            clienteId,
            "Contrato Segurança",
            10000,
            500,
            0.2m,
            800,
            0.18m,
            2, // NumeroDePostos (QuantidadeFuncionarios calculado automaticamente)
            0.15m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _clienteRepo.Setup(r => r.GetByIdAsync(clienteId))
            .ReturnsAsync(new Cliente(empresaId, "Cond", "11222333000181", "São Paulo", "SP"));
        
        Contrato? savedContrato = null;
        _contratoRepo.Setup(r => r.Add(It.IsAny<Contrato>())).Callback<Contrato>(c => 
        {
            typeof(Contrato).GetProperty("Cliente")!.SetValue(c, new Cliente(empresaId, "Cond", "11222333000181", "São Paulo", "SP"));
            savedContrato = c;
        });
        _contratoRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Guid id) => savedContrato?.Id == id ? savedContrato : null);
        
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.CreateAsync(input);

        Assert.Equal(input.Descricao, result.Descricao);
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Once);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoTenantNaoDefinido()
    {
        _tenantService.Setup(t => t.EmpresaId).Returns((Guid?)null);

        var input = new CreateContratoDtoInput(
            Guid.NewGuid(),
            "Contrato",
            1000,
            100,
            0.1m,
            200,
            0.15m,
            2,
            0.05m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PENDENTE);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Never);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoClienteNaoExiste()
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
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _clienteRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Cliente?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
        _contratoRepo.Verify(r => r.Add(It.IsAny<Contrato>()), Times.Never);
    }

    [Fact]
    public async Task Create_DeveFalhar_QuandoValoresInvalidos()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var input = new CreateContratoDtoInput(
            clienteId,
            "",
            -10,
            0,
            1.5m,
            -100,
            -0.1m,
            2, // NumeroDePostos
            1.2m,
            1.5m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _clienteRepo.Setup(r => r.GetByIdAsync(clienteId))
            .ReturnsAsync(new Cliente(empresaId, "Cond", "11222333000181", "São Paulo", "SP"));

        await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(input));
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
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.PENDENTE);

        typeof(Contrato).GetProperty("Cliente")!.SetValue(contrato, new Cliente(Guid.NewGuid(), "Cond", "11222333000181", "São Paulo", "SP"));

        var input = new UpdateContratoDtoInput(
            "Novo",
            2000,
            150,
            0.25m,
            400,
            0.2m,
            2,
            0.2m,
            0.08m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            DateOnly.FromDateTime(DateTime.Today.AddDays(20)),
            StatusContrato.ATIVO);

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
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            StatusContrato.ATIVO);

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
            2,
            1.2m,
            1.5m,
            DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            DateOnly.FromDateTime(DateTime.Today),
            StatusContrato.ATIVO);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);

        await Assert.ThrowsAsync<DomainException>(() => _service.UpdateAsync(contrato.Id, input));
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
            2,
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

    [Fact(DisplayName = "CreateAsync - Deve falhar quando já existe contrato vigente")]
    public async Task CreateAsync_DeveFalharQuandoJaExisteContratoVigente()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var cliente = new Cliente(empresaId, "Teste", "11222333000181", "São Paulo", "SP");
        
        var input = new CreateContratoDtoInput(
            clienteId,
            "Contrato novo",
            2000,
            150,
            0.25m,
            400,
            0.2m,
            2, // NumeroDePostos
            0.2m,
            0.08m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(30)),
            StatusContrato.PENDENTE);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _clienteRepo.Setup(r => r.GetByIdAsync(clienteId)).ReturnsAsync(cliente);
        _contratoRepo.Setup(r => r.ExisteContratoVigenteAsync(clienteId, null)).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Já existe um contrato vigente para este cliente", exception.Message);
    }

    [Fact(DisplayName = "UpdateAsync - Deve falhar quando tentar ativar contrato com outro vigente")]
    public async Task UpdateAsync_DeveFalharQuandoTentarAtivarContratoComOutroVigente()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var contrato = new Contrato(
            empresaId,
            clienteId,
            "Contrato inativo",
            1000,
            100,
            0.2m,
            300,
            0.15m,
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.FINALIZADO);

        var input = new UpdateContratoDtoInput(
            "Contrato reativado",
            1500,
            120,
            0.22m,
            350,
            0.16m,
            2,
            0.12m,
            0.06m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(15)),
            StatusContrato.ATIVO);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);
        _contratoRepo.Setup(r => r.ExisteContratoVigenteAsync(clienteId, contrato.Id)).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(contrato.Id, input));
        Assert.Contains("Já existe um contrato vigente para este cliente", exception.Message);
    }

    [Fact(DisplayName = "UpdateAsync - Deve permitir ativar contrato quando não há outro vigente")]
    public async Task UpdateAsync_DevePermitirAtivarContratoQuandoNaoHaOutroVigente()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var contrato = new Contrato(
            empresaId,
            clienteId,
            "Contrato inativo",
            1000,
            100,
            0.2m,
            300,
            0.15m,
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.FINALIZADO);

        typeof(Contrato).GetProperty("Cliente")!.SetValue(contrato, new Cliente(empresaId, "Cond", "11222333000181", "São Paulo", "SP"));

        var input = new UpdateContratoDtoInput(
            "Contrato ativado",
            1500,
            120,
            0.22m,
            350,
            0.16m,
            2,
            0.12m,
            0.06m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(15)),
            StatusContrato.ATIVO);

        _contratoRepo.Setup(r => r.GetByIdAsync(contrato.Id)).ReturnsAsync(contrato);
        _contratoRepo.Setup(r => r.ExisteContratoVigenteAsync(clienteId, contrato.Id)).ReturnsAsync(false);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.UpdateAsync(contrato.Id, input);

        Assert.NotNull(result);
        Assert.Equal(StatusContrato.ATIVO, result.Status);
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
            2,
            0.1m,
            0.05m,
            DateOnly.FromDateTime(DateTime.Today),
            DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            StatusContrato.PENDENTE);
    }
}
