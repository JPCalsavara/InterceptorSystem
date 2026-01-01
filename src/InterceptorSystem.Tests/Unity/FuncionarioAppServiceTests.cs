using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class FuncionarioAppServiceTests
{
    private readonly Mock<IFuncionarioRepository> _funcionarioRepo = new();
    private readonly Mock<ICondominioRepository> _condominioRepo = new();
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly FuncionarioAppService _service;

    private const string CpfValido = "12345678901";

    private static CreateFuncionarioDtoInput CriarInputValido(Guid condominioId) => new(
        condominioId,
        "João",
        CpfValido,
        "+5511999999999",
        StatusFuncionario.ATIVO,
        TipoEscala.DOZE_POR_TRINTA_SEIS,
        TipoFuncionario.CLT,
        2000,
        300,
        100);

    public FuncionarioAppServiceTests()
    {
        _funcionarioRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _service = new FuncionarioAppService(_funcionarioRepo.Object, _condominioRepo.Object, _tenantService.Object);
    }

    [Fact(DisplayName = "CreateAsync - Sucesso quando dados válidos")]
    public async Task CreateAsync_DeveCriarFuncionario()
    {
        var empresaId = Guid.NewGuid();
        var input = new CreateFuncionarioDtoInput(Guid.NewGuid(), "João", "123", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT, 2000, 300, 100);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(input.CondominioId)).ReturnsAsync(new Condominio(empresaId, "Cond", "123", "Rua"));
        _funcionarioRepo.Setup(r => r.GetByCpfAsync(input.Cpf)).ReturnsAsync((Funcionario?)null);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.CreateAsync(input);

        Assert.Equal(input.Nome, result.Nome);
        _funcionarioRepo.Verify(r => r.Add(It.IsAny<Funcionario>()), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Condomínio não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoCondominioInvalido()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var input = CriarInputValido(condominioId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando CPF duplicado")]
    public async Task CreateAsync_DeveFalhar_QuandoCpfDuplicado()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var input = CriarInputValido(condominioId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(new Condominio(empresaId, "Cond", "123", "Rua"));
        _funcionarioRepo.Setup(r => r.GetByCpfAsync(CpfValido)).ReturnsAsync(new Funcionario(empresaId, condominioId, "Outro", CpfValido, "+5511888888888", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT, 2000, 300, 100));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "UpdateAsync - Falha quando funcionário não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var id = Guid.NewGuid();
        var input = new UpdateFuncionarioDtoInput("Jose", "+5511777777777", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT, 2100, 320, 110);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(id, input));
    }

    [Fact(DisplayName = "DeleteAsync - Falha quando funcionário inexistente")]
    public async Task DeleteAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var id = Guid.NewGuid();
        _funcionarioRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(id));
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista")]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        var empresaId = Guid.NewGuid();
        var lista = new List<Funcionario>
        {
            new Funcionario(empresaId, Guid.NewGuid(), "João", "111", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT, 2000, 300, 100),
            new Funcionario(empresaId, Guid.NewGuid(), "Maria", "222", "+5511888888888", StatusFuncionario.AFASTADO, TipoEscala.SEMANAL_COMERCIAL, TipoFuncionario.TERCEIRIZADO, 3000, 500, 0)
        };
        _funcionarioRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }
}
