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
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class AlocacaoAppServiceTests
{
    private readonly Mock<IAlocacaoRepository> _alocacaoRepo = new();
    private readonly Mock<IFuncionarioRepository> _funcionarioRepo = new();
    private readonly Mock<IPostoDeTrabalhoRepository> _postoRepo = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly AlocacaoAppService _service;

    public AlocacaoAppServiceTests()
    {
        _alocacaoRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _service = new AlocacaoAppService(_alocacaoRepo.Object, _funcionarioRepo.Object, _postoRepo.Object, _tenantService.Object);
    }

    private static CreateAlocacaoDtoInput CriarInputValido(Guid funcionarioId, Guid postoId) => new(
        funcionarioId,
        postoId,
        DateOnly.FromDateTime(DateTime.Today),
        "Ativo",
        "Regular");

    [Fact(DisplayName = "CreateAsync - Sucesso quando dados válidos")]
    public async Task CreateAsync_DeveCriarAlocacao()
    {
        var empresaId = Guid.NewGuid();
        var funcionario = new Funcionario(empresaId, Guid.NewGuid(), "João", "123", "Ativo", "12x36", "Porteiro", 2000, 300, 100);
        var posto = new PostoDeTrabalho(Guid.NewGuid(), empresaId, TimeSpan.FromHours(6), TimeSpan.FromHours(18));
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today), "Ativo", "Regular");

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.CreateAsync(input);

        Assert.Equal(input.FuncionarioId, result.FuncionarioId);
        _alocacaoRepo.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Funcionário não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var empresaId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var input = CriarInputValido(funcionarioId, postoId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionarioId)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Posto não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoPostoNaoExiste()
    {
        var empresaId = Guid.NewGuid();
        var funcionario = new Funcionario(empresaId, Guid.NewGuid(), "João", "123", "Ativo", "12x36", "Porteiro", 2000, 300, 100);
        var postoId = Guid.NewGuid();
        var input = CriarInputValido(funcionario.Id, postoId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((PostoDeTrabalho?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "UpdateAsync - Falha quando alocação não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoAlocacaoNaoExiste()
    {
        var id = Guid.NewGuid();
        var input = new UpdateAlocacaoDtoInput("Inativo", "Reserva");
        _alocacaoRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Alocacao?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(id, input));
    }

    [Fact(DisplayName = "DeleteAsync - Falha quando alocação não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoNaoExiste()
    {
        var id = Guid.NewGuid();
        _alocacaoRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Alocacao?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(id));
    }

    [Fact(DisplayName = "GetAllAsync - Retorna lista de alocações")]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        var empresaId = Guid.NewGuid();
        var lista = new List<Alocacao>
        {
            new Alocacao(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), "Ativo", "Regular"),
            new Alocacao(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), "Pendente", "Reserva")
        };
        _alocacaoRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }
}
