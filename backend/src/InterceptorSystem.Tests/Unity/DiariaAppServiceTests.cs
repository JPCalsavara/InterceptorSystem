using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using Moq;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes unitários para DiariaAppService.
/// Diaria usa AlocacaoId (não PostoId). ValorDiaria defaults to 0m (Phase 3).
/// </summary>
public class DiariaAppServiceTests
{
    private readonly Mock<IDiariaRepository> _diariaRepo = new();
    private readonly Mock<IFuncionarioRepository> _funcionarioRepo = new();
    private readonly Mock<IAlocacaoRepository> _alocacaoRepo = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly DiariaAppService _service;

    public DiariaAppServiceTests()
    {
        _diariaRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _service = new DiariaAppService(_diariaRepo.Object, _funcionarioRepo.Object, _alocacaoRepo.Object, _tenantService.Object);
    }

    private static CreateDiariaDtoInput CriarInputValido(Guid funcionarioId, Guid alocacaoId) => new(
        funcionarioId,
        alocacaoId,
        DateOnly.FromDateTime(DateTime.Today),
        StatusDiaria.CONFIRMADA,
        TipoDiaria.REGULAR);

    private static Funcionario CriarFuncionario(Guid empresaId, Guid clienteId) =>
        new(empresaId, clienteId, Guid.NewGuid(), "João", "11111111111", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

    private static Alocacao CriarAlocacao(Guid postoId, Guid contratoId, Guid empresaId) =>
        new(postoId, contratoId, empresaId, TimeSpan.FromHours(6), TimeSpan.FromHours(18), TipoEscala.DOZE_POR_TRINTA_SEIS, true);

    private static Diaria CriarDiaria(Guid empresaId, Guid funcionarioId, Guid alocacaoId, DateOnly data, TipoDiaria tipo) =>
        new(empresaId, funcionarioId, alocacaoId, data, 0m, StatusDiaria.CONFIRMADA, tipo);

    private void ConfigurarMocksBasicos(Guid empresaId, Funcionario funcionario, Alocacao alocacao)
    {
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _alocacaoRepo.Setup(r => r.GetByIdAsync(alocacao.Id)).ReturnsAsync(alocacao);
        _diariaRepo.Setup(r => r.ExisteDiariaNaDataAsync(funcionario.Id, It.IsAny<DateOnly>(), null)).ReturnsAsync(false);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);
    }

    [Fact(DisplayName = "CreateAsync - Sucesso quando dados válidos")]
    public async Task CreateAsync_DeveCriarDiaria()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, clienteId);
        var alocacao = CriarAlocacao(postoId, contratoId, empresaId);
        var input = CriarInputValido(funcionario.Id, alocacao.Id);

        ConfigurarMocksBasicos(empresaId, funcionario, alocacao);

        var result = await _service.CreateAsync(input);

        Assert.Equal(input.FuncionarioId, result.FuncionarioId);
        Assert.Equal(alocacao.Id, result.AlocacaoId);
        _diariaRepo.Verify(r => r.Add(It.IsAny<Diaria>()), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Funcionário não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var empresaId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();
        var input = CriarInputValido(funcionarioId, alocacaoId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionarioId)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Alocação não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoAlocacaoNaoExiste()
    {
        var empresaId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, Guid.NewGuid());
        var alocacaoId = Guid.NewGuid();
        var input = CriarInputValido(funcionario.Id, alocacaoId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _alocacaoRepo.Setup(r => r.GetByIdAsync(alocacaoId)).ReturnsAsync((Alocacao?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando tenant não está definido")]
    public async Task CreateAsync_DeveFalhar_QuandoTenantNaoDefinido()
    {
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();
        var input = CriarInputValido(funcionarioId, alocacaoId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _diariaRepo.Verify(r => r.Add(It.IsAny<Diaria>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando funcionário já tem diária na mesma data")]
    public async Task CreateAsync_DeveFalharQuandoFuncionarioJaTemDiariaMesmaData()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, clienteId);
        var alocacao = CriarAlocacao(postoId, contratoId, empresaId);
        var data = DateOnly.FromDateTime(DateTime.Today);
        var input = new CreateDiariaDtoInput(funcionario.Id, alocacao.Id, data, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _alocacaoRepo.Setup(r => r.GetByIdAsync(alocacao.Id)).ReturnsAsync(alocacao);
        _diariaRepo.Setup(r => r.ExisteDiariaNaDataAsync(funcionario.Id, data, null)).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Funcionário já possui diária neste período", exception.Message);
    }

    [Fact(DisplayName = "UpdateAsync - Falha quando diária não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoDiariaNaoExiste()
    {
        var id = Guid.NewGuid();
        var input = new UpdateDiariaDtoInput(StatusDiaria.CANCELADA, TipoDiaria.SUBSTITUICAO);
        _diariaRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Diaria?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(id, input));
    }

    [Fact(DisplayName = "UpdateAsync - Sucesso quando dados válidos")]
    public async Task UpdateAsync_DeveAtualizarDiaria()
    {
        var id = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();
        var input = new UpdateDiariaDtoInput(StatusDiaria.CANCELADA, TipoDiaria.SUBSTITUICAO);
        var diariaExistente = new Diaria(Guid.NewGuid(), funcionarioId, alocacaoId, DateOnly.FromDateTime(DateTime.Today), 0m, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR);

        _diariaRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(diariaExistente);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.UpdateAsync(id, input);

        Assert.Equal(input.StatusDiaria, result.StatusDiaria);
        Assert.Equal(input.TipoDiaria, result.TipoDiaria);
        _diariaRepo.Verify(r => r.Update(It.IsAny<Diaria>()), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Falha quando diária não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoNaoExiste()
    {
        var id = Guid.NewGuid();
        _diariaRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Diaria?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(id));
    }

    [Fact(DisplayName = "GetAllAsync - Retorna lista de diárias")]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        var empresaId = Guid.NewGuid();
        var lista = new List<Diaria>
        {
            new Diaria(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), 0m, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new Diaria(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), 0m, StatusDiaria.CANCELADA, TipoDiaria.SUBSTITUICAO)
        };
        _diariaRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact(DisplayName = "UpdateStatusAsync - Sucesso quando diária existe")]
    public async Task UpdateStatusAsync_DeveAtualizarStatus()
    {
        var empresaId = Guid.NewGuid();
        var diaria = CriarDiaria(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), TipoDiaria.REGULAR);

        _diariaRepo.Setup(r => r.GetByIdAsync(diaria.Id)).ReturnsAsync(diaria);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        await _service.UpdateStatusAsync(diaria.Id, StatusDiaria.CANCELADA);

        _diariaRepo.Verify(r => r.Update(It.Is<Diaria>(d => d.StatusDiaria == StatusDiaria.CANCELADA)), Times.Once);
    }

    [Fact(DisplayName = "UpdateStatusAsync - Falha quando diária não existe")]
    public async Task UpdateStatusAsync_DeveFalhar_QuandoNaoExiste()
    {
        var id = Guid.NewGuid();
        _diariaRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Diaria?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateStatusAsync(id, StatusDiaria.CANCELADA));
    }
}
