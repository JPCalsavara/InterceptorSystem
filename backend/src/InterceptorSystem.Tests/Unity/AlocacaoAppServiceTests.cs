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
        StatusAlocacao.CONFIRMADA,
        TipoAlocacao.REGULAR);

    // FASE 3: Sem parâmetros de salário
    private static Funcionario CriarFuncionario(Guid empresaId, Guid condominioId) =>
        new(empresaId, condominioId, Guid.NewGuid(), "João", "123", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);

    // FASE 4: Sem QuantidadeIdealFuncionarios (calculado do Condomínio)
    private static PostoDeTrabalho CriarPosto(Guid condominioId, Guid empresaId) 
    {
        // FASE 4: Criar Condominio mock para cálculo de QuantidadeIdealFuncionarios
        var condominio = new Condominio(
            empresaId, 
            "Condominio Teste", 
            "12345678000190", 
            "Rua Teste", 
            12, // 12 funcionários ideais
            TimeSpan.FromHours(6),
            "test@test.com",
            "+5511999999999");
        
        var posto = new PostoDeTrabalho(condominioId, empresaId, TimeSpan.FromHours(6), TimeSpan.FromHours(18), true);
        
        // Usar reflection para configurar a propriedade de navegação Condominio
        var condominioProperty = typeof(PostoDeTrabalho).GetProperty("Condominio");
        condominioProperty?.SetValue(posto, condominio);
        
        // Adicionar o posto à coleção de postos do condomínio para o cálculo funcionar
        condominio.GetType().GetProperty("PostosDeTrabalho")?.SetValue(condominio, new List<PostoDeTrabalho> { posto });
        
        return posto;
    }

    private static Alocacao CriarAlocacao(Guid empresaId, Guid funcionarioId, Guid postoId, DateOnly data, TipoAlocacao tipo) =>
        new(empresaId, funcionarioId, postoId, data, StatusAlocacao.CONFIRMADA, tipo);

    // FASE 4: Helper para configurar mocks comuns de validação de capacidade
    private void ConfigurarMocksBasicos(Guid empresaId, Funcionario funcionario, PostoDeTrabalho posto, IEnumerable<Alocacao>? alocacoesExistentes = null)
    {
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
        _alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id)).ReturnsAsync(alocacoesExistentes ?? Array.Empty<Alocacao>());
        _alocacaoRepo.Setup(r => r.GetByPostoEDataAsync(posto.Id, It.IsAny<DateOnly>())).ReturnsAsync(alocacoesExistentes ?? Array.Empty<Alocacao>());
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);
    }

    [Fact(DisplayName = "CreateAsync - Sucesso quando dados válidos")]
    public async Task CreateAsync_DeveCriarAlocacao()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var contratoId = Guid.NewGuid();
        var funcionario = new Funcionario(empresaId, condominioId, contratoId, "João", "123", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        var posto = CriarPosto(condominioId, empresaId);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        ConfigurarMocksBasicos(empresaId, funcionario, posto);

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
        var contratoId = Guid.NewGuid();
        // FASE 3: Sem parâmetros de salário
        var funcionario = new Funcionario(empresaId, Guid.NewGuid(), contratoId, "João", "123", "+5511999999999", StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
        var postoId = Guid.NewGuid();
        var input = CriarInputValido(funcionario.Id, postoId);
        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((PostoDeTrabalho?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(input));
    }

    [Fact(DisplayName = "CreateAsync - Falha quando tenant não está definido")]
    public async Task CreateAsync_DeveFalhar_QuandoTenantNaoDefinido()
    {
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var input = CriarInputValido(funcionarioId, postoId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _alocacaoRepo.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Falha quando funcionário e posto são de condomínios diferentes")]
    public async Task CreateAsync_DeveFalhar_QuandoCondominiosDiferentes()
    {
        var empresaId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, Guid.NewGuid());
        var posto = CriarPosto(Guid.NewGuid(), empresaId);
        var input = CriarInputValido(funcionario.Id, posto.Id);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _alocacaoRepo.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Falha quando há alocação consecutiva sem dobra programada")]
    public async Task CreateAsync_DeveFalhar_QuandoConsecutivaSemDobra()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, condominioId);
        var posto = CriarPosto(condominioId, empresaId);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);
        var alocacaoAnterior = CriarAlocacao(empresaId, funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today.AddDays(-1)), TipoAlocacao.REGULAR);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
        _alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id)).ReturnsAsync(new[] { alocacaoAnterior });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _alocacaoRepo.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Permite consecutiva quando tipo é Dobra Programada")]
    public async Task CreateAsync_DevePermitirConsecutivaQuandoDobra()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, condominioId);
        var posto = CriarPosto(condominioId, empresaId);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.DOBRA_PROGRAMADA);
        var alocacaoAnterior = CriarAlocacao(empresaId, funcionario.Id, posto.Id, DateOnly.FromDateTime(DateTime.Today.AddDays(-1)), TipoAlocacao.REGULAR);

        ConfigurarMocksBasicos(empresaId, funcionario, posto, new[] { alocacaoAnterior });

        var result = await _service.CreateAsync(input);

        Assert.Equal(TipoAlocacao.DOBRA_PROGRAMADA, result.TipoAlocacao);
        _alocacaoRepo.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Falha quando alocação não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoAlocacaoNaoExiste()
    {
        var id = Guid.NewGuid();
        var input = new UpdateAlocacaoDtoInput(StatusAlocacao.CANCELADA, TipoAlocacao.SUBSTITUICAO);
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
            new Alocacao(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new Alocacao(empresaId, Guid.NewGuid(), Guid.NewGuid(), DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CANCELADA, TipoAlocacao.SUBSTITUICAO)
        };
        _alocacaoRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(lista);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact(DisplayName = "UpdateAsync - Sucesso quando dados válidos")]
    public async Task UpdateAsync_DeveAtualizarAlocacao()
    {
        var id = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var input = new UpdateAlocacaoDtoInput(StatusAlocacao.CANCELADA, TipoAlocacao.SUBSTITUICAO);
        var alocacaoExistente = new Alocacao(Guid.NewGuid(), funcionarioId, postoId, DateOnly.FromDateTime(DateTime.Today), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        _alocacaoRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(alocacaoExistente);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        var result = await _service.UpdateAsync(id, input);

        Assert.Equal(input.StatusAlocacao, result.StatusAlocacao);
        Assert.Equal(input.TipoAlocacao, result.TipoAlocacao);
        _alocacaoRepo.Verify(r => r.Update(It.IsAny<Alocacao>()), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Falha quando regra de consecutividade violada")]
    public async Task UpdateAsync_DeveFalhar_QuandoConsecutivaSemDobra()
    {
        var empresaId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var alocacao = CriarAlocacao(empresaId, funcionarioId, postoId, DateOnly.FromDateTime(DateTime.Today), TipoAlocacao.REGULAR);
        var input = new UpdateAlocacaoDtoInput(StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);
        var adjacente = CriarAlocacao(empresaId, funcionarioId, postoId, DateOnly.FromDateTime(DateTime.Today.AddDays(1)), TipoAlocacao.REGULAR);

        _alocacaoRepo.Setup(r => r.GetByIdAsync(alocacao.Id)).ReturnsAsync(alocacao);
        _alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionarioId)).ReturnsAsync(new[] { adjacente });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(alocacao.Id, input));
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando funcionário já tem alocação na mesma data")]
    public async Task CreateAsync_DeveFalharQuandoFuncionarioJaTemAlocacaoMesmaData()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, condominioId);
        var posto = CriarPosto(condominioId, empresaId);
        var data = DateOnly.FromDateTime(DateTime.Today);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, data, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
        _alocacaoRepo.Setup(r => r.ExisteAlocacaoNaDataAsync(funcionario.Id, data, null)).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Funcionário já possui alocação neste período", exception.Message);
    }

    [Fact(DisplayName = "CreateAsync - Deve permitir DOBRA_PROGRAMADA após alocação regular")]
    public async Task CreateAsync_DevePermitirDobraProgramadaAposAlocacaoRegular()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, condominioId);
        var posto = CriarPosto(condominioId, empresaId);
        var dataHoje = DateOnly.FromDateTime(DateTime.Today);
        var dataAmanha = dataHoje.AddDays(1);
        
        var alocacaoExistente = CriarAlocacao(empresaId, funcionario.Id, posto.Id, dataHoje, TipoAlocacao.REGULAR);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, dataAmanha, StatusAlocacao.CONFIRMADA, TipoAlocacao.DOBRA_PROGRAMADA);

        ConfigurarMocksBasicos(empresaId, funcionario, posto, new[] { alocacaoExistente });
        _alocacaoRepo.Setup(r => r.ExisteAlocacaoNaDataAsync(funcionario.Id, dataAmanha, null)).ReturnsAsync(false);

        var result = await _service.CreateAsync(input);

        Assert.NotNull(result);
        Assert.Equal(TipoAlocacao.DOBRA_PROGRAMADA, result.TipoAlocacao);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando funcionário tenta trabalhar após DOBRA_PROGRAMADA")]
    public async Task CreateAsync_DeveFalharQuandoFuncionarioTentaTrabalharAposDobraProgramada()
    {
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var funcionario = CriarFuncionario(empresaId, condominioId);
        var posto = CriarPosto(condominioId, empresaId);
        var dataOntem = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));
        var dataHoje = DateOnly.FromDateTime(DateTime.Today);
        
        var dobraOntem = CriarAlocacao(empresaId, funcionario.Id, posto.Id, dataOntem, TipoAlocacao.DOBRA_PROGRAMADA);
        var input = new CreateAlocacaoDtoInput(funcionario.Id, posto.Id, dataHoje, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR);

        _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
        _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
        _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
        _alocacaoRepo.Setup(r => r.ExisteAlocacaoNaDataAsync(funcionario.Id, dataHoje, null)).ReturnsAsync(false);
        _alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id)).ReturnsAsync(new[] { dobraOntem });

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Funcionário deve descansar após dobra programada", exception.Message);
    }
}
