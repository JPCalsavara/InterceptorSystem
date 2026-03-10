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
/// Testes unitários para criação em lote (batch) de diárias.
/// Foca no método CreateBatchAsync do DiariaAppService.
/// Diaria agora usa AlocacaoId (não PostoId).
/// </summary>
public class DiariaBatchAppServiceTests
{
    private readonly Mock<IDiariaRepository> _mockRepository;
    private readonly Mock<IFuncionarioRepository> _mockFuncionarioRepository;
    private readonly Mock<IAlocacaoRepository> _mockAlocacaoRepository;
    private readonly Mock<ICurrentTenantService> _mockTenantService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly DiariaAppService _service;

    public DiariaBatchAppServiceTests()
    {
        _mockRepository = new Mock<IDiariaRepository>();
        _mockFuncionarioRepository = new Mock<IFuncionarioRepository>();
        _mockAlocacaoRepository = new Mock<IAlocacaoRepository>();
        _mockTenantService = new Mock<ICurrentTenantService>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _mockRepository.Setup(r => r.UnitOfWork).Returns(_mockUnitOfWork.Object);
        _mockTenantService.Setup(t => t.EmpresaId).Returns(Guid.NewGuid());

        _service = new DiariaAppService(
            _mockRepository.Object,
            _mockFuncionarioRepository.Object,
            _mockAlocacaoRepository.Object,
            _mockTenantService.Object
        );
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarMultiplasDiarias_ComSucesso()
    {
        // Arrange
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();

        var diarias = new List<CreateDiariaDtoInput>
        {
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 18), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 20), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 22), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
        };

        var batch = new CreateDiariasBatchDtoInput(diarias);

        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(alocacaoId, a.AlocacaoId));
        Assert.All(result, a => Assert.Equal(StatusDiaria.CONFIRMADA, a.StatusDiaria));
        Assert.All(result, a => Assert.Equal(TipoDiaria.REGULAR, a.TipoDiaria));

        _mockRepository.Verify(r => r.Add(It.IsAny<Diaria>()), Times.Exactly(3));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoListaVazia()
    {
        // Arrange
        var batch = new CreateDiariasBatchDtoInput(new List<CreateDiariaDtoInput>());

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateBatchAsync(batch)
        );

        Assert.Equal("Nenhuma diária foi informada.", exception.Message);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveFalhar_QuandoTenantNaoDefinido()
    {
        // Arrange
        _mockTenantService.Setup(t => t.EmpresaId).Returns((Guid?)null);
        
        // Need a new service instance since the constructor stores the tenant
        var service = new DiariaAppService(
            _mockRepository.Object,
            _mockFuncionarioRepository.Object,
            _mockAlocacaoRepository.Object,
            _mockTenantService.Object
        );

        var diarias = new List<CreateDiariaDtoInput>
        {
            new(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 1, 18), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
        };
        var batch = new CreateDiariasBatchDtoInput(diarias);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateBatchAsync(batch));
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarGrandeLoteDeDiarias_Escala12x36()
    {
        // Arrange - Simular 6 meses de escala 12x36 (~91 diárias)
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();

        // Gerar diárias para 6 meses (escala 12x36 - trabalha 1 dia sim, 1 não)
        var diarias = new List<CreateDiariaDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;
        bool trabalha = true;

        while (dataAtual <= dataFim)
        {
            if (trabalha)
            {
                diarias.Add(new(funcionarioId, alocacaoId, dataAtual, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR));
            }
            trabalha = !trabalha;
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateDiariasBatchDtoInput(diarias);

        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 90 && result.Count <= 92, $"Esperado ~91 diárias, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(alocacaoId, a.AlocacaoId));
        
        _mockRepository.Verify(r => r.Add(It.IsAny<Diaria>()), Times.Exactly(result.Count));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveCriarGrandeLoteDeDiarias_EscalaSemanal()
    {
        // Arrange - Simular 6 meses de escala semanal (~130 diárias)
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();

        // Gerar diárias para 6 meses (escala semanal - seg a sex)
        var diarias = new List<CreateDiariaDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;

        while (dataAtual <= dataFim)
        {
            var diaSemana = dataAtual.DayOfWeek;
            // Trabalha seg-sex (1-5)
            if (diaSemana >= DayOfWeek.Monday && diaSemana <= DayOfWeek.Friday)
            {
                diarias.Add(new(funcionarioId, alocacaoId, dataAtual, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR));
            }
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateDiariasBatchDtoInput(diarias);

        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Count >= 128 && result.Count <= 132, $"Esperado ~130 diárias, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(alocacaoId, a.AlocacaoId));
        
        _mockRepository.Verify(r => r.Add(It.IsAny<Diaria>()), Times.Exactly(result.Count));
        _mockUnitOfWork.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateBatchAsync_DeveRetornarDiasCorretos()
    {
        // Arrange
        var funcionarioId = Guid.NewGuid();
        var alocacaoId = Guid.NewGuid();
        var data1 = new DateOnly(2026, 3, 1);
        var data2 = new DateOnly(2026, 3, 3);

        var diarias = new List<CreateDiariaDtoInput>
        {
            new(funcionarioId, alocacaoId, data1, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new(funcionarioId, alocacaoId, data2, StatusDiaria.CONFIRMADA, TipoDiaria.DOBRA_PROGRAMADA),
        };

        var batch = new CreateDiariasBatchDtoInput(diarias);
        _mockUnitOfWork.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateBatchAsync(batch);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, r => r.TipoDiaria == TipoDiaria.REGULAR);
        Assert.Contains(result, r => r.TipoDiaria == TipoDiaria.DOBRA_PROGRAMADA);
    }
}
