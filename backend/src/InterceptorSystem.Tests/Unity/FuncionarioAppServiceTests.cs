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
    private readonly Mock<IContratoRepository> _contratoRepo = new(); // FASE 2: Adicionar mock
    private readonly Mock<ICurrentTenantService> _tenantService = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly FuncionarioAppService _service;

    private const string CpfValido = "12345678901";

    // FASE 3: Sem parâmetros de salário (calculados automaticamente)
    private static CreateFuncionarioDtoInput CriarInputValido(Guid condominioId, Guid contratoId) => new(
        condominioId,
        contratoId,
        "João",
        CpfValido,
        "+5511999999999",
        StatusFuncionario.ATIVO,
        TipoEscala.DOZE_POR_TRINTA_SEIS,
        TipoFuncionario.CLT);

    private static Condominio CriarCondominio(Guid empresaId) => new(empresaId, "Cond", "123", "Rua", 10, TimeSpan.FromHours(6));

    // FASE 3: Sem parâmetros de salário (calculados automaticamente)
    private static Funcionario CriarFuncionario(Guid empresaId, Guid condominioId, Guid contratoId) =>
        new(empresaId, condominioId, contratoId, "João", "12345678900", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

    public FuncionarioAppServiceTests()
    {
        _funcionarioRepo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
        _service = new FuncionarioAppService(_funcionarioRepo.Object, _condominioRepo.Object, _contratoRepo.Object, _tenantService.Object); // FASE 2: Adicionar contratoRepo
    }

    [Fact(DisplayName = "CreateAsync - Sucesso quando dados válidos")]
    public async Task CreateAsync_DeveCriarFuncionario()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        // FASE 3: Sem parâmetros de salário
        var input = new CreateFuncionarioDtoInput(condominioId, contratoId, "João", "123", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(input.CondominioId)).ReturnsAsync(new Condominio(empresaId, "Cond", "123", "Rua", 10, TimeSpan.FromHours(6)));
        
        // FASE 2: Mock de contrato vigente
        var contrato = new Contrato(empresaId, condominioId, "Contrato Teste", 10000m, 100m, 0.30m, 500m, 0.15m, 5, 0.20m, 0.10m, 
            DateOnly.FromDateTime(DateTime.Today.AddMonths(-1)), 
            DateOnly.FromDateTime(DateTime.Today.AddMonths(12)), 
            StatusContrato.PAGO);
        _contratoRepo.Setup(r => r.GetByIdAsync(contratoId)).ReturnsAsync(contrato);
        
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
        var input = CriarInputValido(condominioId, Guid.NewGuid());
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando CPF duplicado")]
    public async Task CreateAsync_DeveFalhar_QuandoCpfDuplicado()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        var input = CriarInputValido(condominioId, contratoId);
        
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _condominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(new Condominio(empresaId, "Cond", "123", "Rua", 10, TimeSpan.FromHours(6)));
        
        // FASE 2: Mock de contrato vigente
        var contrato = new Contrato(empresaId, condominioId, "Contrato Teste", 10000m, 100m, 0.30m, 500m, 0.15m, 5, 0.20m, 0.10m, 
            DateOnly.FromDateTime(DateTime.Today.AddMonths(-1)), 
            DateOnly.FromDateTime(DateTime.Today.AddMonths(12)), 
            StatusContrato.PAGO);
        _contratoRepo.Setup(r => r.GetByIdAsync(contratoId)).ReturnsAsync(contrato);
        
        // FASE 3: Sem parâmetros de salário
        _funcionarioRepo.Setup(r => r.GetByCpfAsync(CpfValido)).ReturnsAsync(new Funcionario(empresaId, condominioId, contratoId, "Outro", CpfValido, "+5511888888888", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando Empresa (tenant) não está no contexto")]
    public async Task CreateAsync_DeveFalhar_QuandoTenantNaoDefinido()
    {
        var input = CriarInputValido(Guid.NewGuid(), Guid.NewGuid());

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _funcionarioRepo.Verify(r => r.Add(It.IsAny<Funcionario>()), Times.Never);
    }

    // FASE 3: Teste de salário negativo removido - não há mais campos de salário manual

    [Fact(DisplayName = "UpdateAsync - Falha quando funcionário não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var id = Guid.NewGuid();
        // FASE 3: Sem parâmetros de salário
        var input = new UpdateFuncionarioDtoInput("Jose", "+5511777777777", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(id, input));
    }

    [Fact(DisplayName = "UpdateAsync - Sucesso quando dados válidos")]
    public async Task UpdateAsync_DeveAtualizarFuncionario()
    {
        var funcionario = CriarFuncionario(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        // FASE 3: Sem parâmetros de salário
        var input = new UpdateFuncionarioDtoInput("Atualizado", "+5511888888888", StatusFuncionario.AFASTADO, TipoEscala.SEMANAL_COMERCIAL, TipoFuncionario.TERCEIRIZADO);

        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.UpdateAsync(funcionario.Id, input);

        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal(input.StatusFuncionario, result.StatusFuncionario);
    }

    [Fact(DisplayName = "DeleteAsync - Falha quando funcionário inexistente")]
    public async Task DeleteAsync_DeveFalhar_QuandoFuncionarioNaoExiste()
    {
        var id = Guid.NewGuid();
        _funcionarioRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Funcionario?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(id));
    }

    [Fact(DisplayName = "DeleteAsync - Sucesso quando funcionário existe")]
    public async Task DeleteAsync_DeveExcluirFuncionarioQuandoExiste()
    {
        var funcionario = CriarFuncionario(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        await _service.DeleteAsync(funcionario.Id);

        _funcionarioRepo.Verify(r => r.Remove(funcionario), Times.Once);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista")]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        var empresaId = Guid.NewGuid();
        // FASE 3: Sem parâmetros de salário
        var lista = new List<Funcionario>
        {
            new Funcionario(empresaId, Guid.NewGuid(), Guid.NewGuid(), "João", "111", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT),
            new Funcionario(empresaId, Guid.NewGuid(), Guid.NewGuid(), "Maria", "222", "+5511888888888", StatusFuncionario.AFASTADO, TipoEscala.SEMANAL_COMERCIAL, TipoFuncionario.TERCEIRIZADO)
        };
        _funcionarioRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact(DisplayName = "GetByIdAsync - Retorna funcionário quando existe")]
    public async Task GetByIdAsync_DeveRetornarFuncionario()
    {
        var funcionario = CriarFuncionario(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);

        var result = await _service.GetByIdAsync(funcionario.Id);

        Assert.NotNull(result);
        Assert.Equal(funcionario.Id, result!.Id);
    }

    [Fact(DisplayName = "GetByIdAsync - Retorna nulo quando funcionário não existe")]
    public async Task GetByIdAsync_DeveRetornarNulo_QuandoNaoExiste()
    {
        _funcionarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Funcionario?)null);

        var result = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }
}
