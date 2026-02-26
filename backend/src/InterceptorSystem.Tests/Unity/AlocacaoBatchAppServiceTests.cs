using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Moq;
using Xunit;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes unitários para criação em lote (batch) de alocações
/// Foca no método CreateBatchAsync do AlocacaoAppService
/// </summary>
public class AlocacaoBatchAppServiceTests
{
    private readonly Mock<IAlocacaoRepository> _mockRepository;
    private readonly Mock<IFuncionarioRepository> _mockFuncionarioRepository;
    private readonly Mock<IPostoDeTrabalhoRepository> _mockPostoRepository;
    private readonly Mock<ICurrentTenantService> _mockTenantService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly AlocacaoAppService _service;

    public AlocacaoBatchAppServiceTests()
    {
        _mockRepository = new Mock<IAlocacaoRepository>();
        _mockFuncionarioRepository = new Mock<IFuncionarioRepository>();
        _mockPostoRepository = new Mock<IPostoDeTrabalhoRepository>();
        _mockTenantService = new Mock<ICurrentTenantService>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _mockRepository.Setup(r => r.UnitOfWork).Returns(_mockUnitOfWork.Object);
        _mockTenantService.Setup(t => t.EmpresaId).Returns(Guid.NewGuid());

        _service = new AlocacaoAppService(
            _mockRepository.Object,
            _mockFuncionarioRepository.Object,
            _mockPostoRepository.Object,
            _mockTenantService.Object
        );
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarMultiplasAlocacoes_ComSucesso()
    {
        // Arrange
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioId,
            Guid.NewGuid(), // contratoId
            "João da Silva",
            "12345678901",
            "11987654321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );
        // Setar ID usando reflection
        typeof(Funcionario).BaseType!.GetProperty("Id")!.SetValue(funcionario, funcionarioId);

        var posto = new PostoDeTrabalho(
            condominioId,
            empresaId,
            Guid.NewGuid(),
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0),
            true
        );
        // Setar ID usando reflection
        typeof(PostoDeTrabalho).BaseType!.GetProperty("Id")!.SetValue(posto, postoId);

        var alocacoes = new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionarioId, postoId, new DateOnly(2026, 1, 20), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionarioId, postoId, new DateOnly(2026, 1, 22), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        };

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync(posto);
        _mockUnitOfWork.Setup(u => u.CommitAsync())
            .ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(postoId, a.PostoDeTrabalhoId));
        Assert.All(result, a => Assert.Equal(StatusAlocacao.CONFIRMADA, a.StatusAlocacao));
        Assert.All(result, a => Assert.Equal(TipoAlocacao.REGULAR, a.TipoAlocacao));

        _mockRepository.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Exactly(3));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoListaVazia()
    {
        // Arrange
        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>());

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Nenhuma alocação foi informada.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoFuncionarioNaoEncontrado()
    {
        // Arrange
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var alocacoes = new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        };

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync((Funcionario?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Funcionário não encontrado.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoPostoNaoEncontrado()
    {
        // Arrange
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioId,
            Guid.NewGuid(),
            "João da Silva",
            "12345678901",
            "11987654321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        var alocacoes = new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        };

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync((PostoDeTrabalho?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Posto de Trabalho não encontrado.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoCondominiosDiferentes()
    {
        // Arrange
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioFuncionarioId = Guid.NewGuid();
        var condominioPostoId = Guid.NewGuid(); // DIFERENTE
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioFuncionarioId, // Condomínio A
            Guid.NewGuid(),
            "João da Silva",
            "12345678901",
            "11987654321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        var posto = new PostoDeTrabalho(
            condominioPostoId,
            empresaId,
            Guid.NewGuid(),
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0),
            true
        );

        var alocacoes = new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        };

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync(posto);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Funcionário e Posto devem pertencer ao mesmo condomínio.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoAlocacoesDeFuncionariosDiferentes()
    {
        // Arrange
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioId = Guid.NewGuid();
        var funcionario1Id = Guid.NewGuid();
        var funcionario2Id = Guid.NewGuid(); // DIFERENTE
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioId,
            Guid.NewGuid(),
            "João da Silva",
            "12345678901",
            "11987654321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        var posto = new PostoDeTrabalho(
            condominioId,
            empresaId,
            Guid.NewGuid(),
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0),
            true
        );

        var alocacoes = new List<CreateAlocacaoDtoInput>
        {
            new(funcionario1Id, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionario2Id, postoId, new DateOnly(2026, 1, 20), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR), // Funcionário diferente
        };

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionario1Id))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync(posto);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Todas as alocações devem ser do mesmo funcionário e posto.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarGrandeLoteDeAlocacoes_Escala12x36()
    {
        // Arrange - Simular 6 meses de escala 12x36 (~91 alocações)
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioId,
            Guid.NewGuid(),
            "João da Silva",
            "12345678901",
            "11987654321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );
        typeof(Funcionario).BaseType!.GetProperty("Id")!.SetValue(funcionario, funcionarioId);

        var posto = new PostoDeTrabalho(
            condominioId,
            empresaId,
            Guid.NewGuid(),
            new TimeSpan(6, 0, 0),
            new TimeSpan(18, 0, 0),
            true
        );
        typeof(PostoDeTrabalho).BaseType!.GetProperty("Id")!.SetValue(posto, postoId);

        // Gerar alocações para 6 meses (escala 12x36 - trabalha 1 dia sim, 1 não)
        var alocacoes = new List<CreateAlocacaoDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;
        bool trabalha = true;

        while (dataAtual <= dataFim)
        {
            if (trabalha)
            {
                alocacoes.Add(new(funcionarioId, postoId, dataAtual, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR));
            }
            trabalha = !trabalha;
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync(posto);
        _mockUnitOfWork.Setup(u => u.CommitAsync())
            .ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 90 && result.Count <= 92, $"Esperado ~91 alocações, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        
        _mockRepository.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Exactly(result.Count));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarGrandeLoteDeAlocacoes_EscalaSemanal()
    {
        // Arrange - Simular 6 meses de escala semanal (~130 alocações)
        var empresaId = _mockTenantService.Object.EmpresaId!.Value;
        var condominioId = Guid.NewGuid();
        var funcionarioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();

        var funcionario = new Funcionario(
            empresaId,
            condominioId,
            Guid.NewGuid(),
            "Maria Santos",
            "98765432100",
            "11912345678",
            StatusFuncionario.ATIVO,
            TipoEscala.SEMANAL_COMERCIAL,
            TipoFuncionario.CLT
        );
        typeof(Funcionario).BaseType!.GetProperty("Id")!.SetValue(funcionario, funcionarioId);

        // CORREÇÃO: Posto com 12 horas (6h às 18h) ao invés de 8h-17h
        var posto = new PostoDeTrabalho(
            condominioId,
            empresaId,
            Guid.NewGuid(),
            new TimeSpan(6, 0, 0),  // 6h da manhã
            new TimeSpan(18, 0, 0), // 18h (6h da tarde) = 12 horas
            false
        );
        typeof(PostoDeTrabalho).BaseType!.GetProperty("Id")!.SetValue(posto, postoId);

        // Gerar alocações para 6 meses (escala semanal - seg a sex)
        var alocacoes = new List<CreateAlocacaoDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;

        while (dataAtual <= dataFim)
        {
            var diaSemana = dataAtual.DayOfWeek;
            // Trabalha seg-sex (1-5)
            if (diaSemana >= DayOfWeek.Monday && diaSemana <= DayOfWeek.Friday)
            {
                alocacoes.Add(new(funcionarioId, postoId, dataAtual, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR));
            }
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        _mockFuncionarioRepository.Setup(r => r.GetByIdAsync(funcionarioId))
            .ReturnsAsync(funcionario);
        _mockPostoRepository.Setup(r => r.GetByIdAsync(postoId))
            .ReturnsAsync(posto);
        _mockUnitOfWork.Setup(u => u.CommitAsync())
            .ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 128 && result.Count <= 132, $"Esperado ~130 alocações, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        
        _mockRepository.Verify(r => r.Add(It.IsAny<Alocacao>()), Times.Exactly(result.Count));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }
}
