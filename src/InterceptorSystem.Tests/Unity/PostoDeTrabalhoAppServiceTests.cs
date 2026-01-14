using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class PostoDeTrabalhoAppServiceTests
{
    private readonly Mock<IPostoDeTrabalhoRepository> _mockRepo;
    private readonly Mock<ICondominioRepository> _mockCondominioRepo;
    private readonly Mock<ICurrentTenantService> _mockTenant;
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly PostoDeTrabalhoAppService _service;

    public PostoDeTrabalhoAppServiceTests()
    {
        _mockRepo = new Mock<IPostoDeTrabalhoRepository>();
        _mockCondominioRepo = new Mock<ICondominioRepository>();
        _mockTenant = new Mock<ICurrentTenantService>();
        _mockUow = new Mock<IUnitOfWork>();

        _mockRepo.Setup(r => r.UnitOfWork).Returns(_mockUow.Object);
        _mockCondominioRepo.Setup(r => r.UnitOfWork).Returns(_mockUow.Object);

        _service = new PostoDeTrabalhoAppService(_mockRepo.Object, _mockCondominioRepo.Object, _mockTenant.Object);
    }

    #region CreateAsync Tests

    [Fact(DisplayName = "CreateAsync - Deve criar posto com turno diurno (6h às 18h)")]
    public async Task CreateAsync_DeveCriar_QuandoTurnoDiurno()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominio = new Condominio(empresaId, "Condomínio Teste", "11.111.111/0001-11", "Rua X", 10, TimeSpan.FromHours(6));
        
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockCondominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominio);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("06:00", result.Horario);
        Assert.Contains("18:00", result.Horario);

        _mockRepo.Verify(r => r.Add(It.Is<PostoDeTrabalho>(p =>
            p.CondominioId == condominioId &&
            p.HorarioInicio == input.HorarioInicio &&
            p.HorarioFim == input.HorarioFim
        )), Times.Once);

        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Deve criar posto com turno noturno (18h às 6h)")]
    public async Task CreateAsync_DeveCriar_QuandoTurnoNoturno()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominio = new Condominio(empresaId, "Condomínio Teste", "11.111.111/0001-11", "Rua X", 10, TimeSpan.FromHours(6));
        
        var input = new CreatePostoInput(condominioId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), false);

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockCondominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominio);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("18:00", result.Horario);
        Assert.Contains("06:00", result.Horario);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando condomínio não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoCondominioNaoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var input = new CreatePostoInput(condominioId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockCondominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Condomínio não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Add(It.IsAny<PostoDeTrabalho>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando duração não é 12 horas")]
    public async Task CreateAsync_DeveFalhar_QuandoDuracaoInvalida()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominio = new Condominio(empresaId, "Condomínio Teste", "11.111.111/0001-11", "Rua X", 10, TimeSpan.FromHours(6));
        
        var input = new CreatePostoInput(condominioId, new TimeSpan(8, 0, 0), new TimeSpan(16, 0, 0), false); // 8 horas

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockCondominioRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominio);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("12 horas", exception.Message);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact(DisplayName = "UpdateAsync - Deve atualizar posto quando dados válidos")]
    public async Task UpdateAsync_DeveAtualizarPostoQuandoDadosValidos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var posto = new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        var input = new UpdatePostoInput(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true);

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.UpdateAsync(postoId, input);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("18:00", result.Horario);
        Assert.Contains("06:00", result.Horario);

        _mockRepo.Verify(r => r.Update(It.IsAny<PostoDeTrabalho>()), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Deve falhar quando posto não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        var input = new UpdatePostoInput(new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((PostoDeTrabalho?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(postoId, input));
        Assert.Contains("Posto de Trabalho não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<PostoDeTrabalho>()), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync - Deve falhar quando duração não é 12 horas")]
    public async Task UpdateAsync_DeveFalhar_QuandoHorarioInvalido()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var posto = new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        var input = new UpdatePostoInput(new TimeSpan(8, 0, 0), new TimeSpan(16, 0, 0), false); // 8 horas

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(postoId, input));
        Assert.Contains("12 horas", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<PostoDeTrabalho>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact(DisplayName = "DeleteAsync - Deve deletar posto existente")]
    public async Task DeleteAsync_DeveRemover_QuandoPostoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var posto = new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        await _service.DeleteAsync(postoId);

        // Assert
        _mockRepo.Verify(r => r.Remove(posto), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve falhar quando posto não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((PostoDeTrabalho?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(postoId));
        Assert.Contains("Posto de Trabalho não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Remove(It.IsAny<PostoDeTrabalho>()), Times.Never);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact(DisplayName = "GetByIdAsync - Deve retornar posto quando existe")]
    public async Task GetByIdAsync_DeveRetornar_QuandoPostoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var posto = new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true);

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);

        // Act
        var result = await _service.GetByIdAsync(postoId);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("06:00", result.Horario);

        _mockRepo.Verify(r => r.GetByIdAsync(postoId), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve retornar null quando posto não existe")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((PostoDeTrabalho?)null);

        // Act
        var result = await _service.GetByIdAsync(postoId);

        // Assert
        Assert.Null(result);
        _mockRepo.Verify(r => r.GetByIdAsync(postoId), Times.Once);
    }

    #endregion

    #region GetAllAsync Tests

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista de postos")]
    public async Task GetAllAsync_DeveRetornarLista()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var postos = new List<PostoDeTrabalho>
        {
            new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true),
            new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true),
            new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0), false)
        };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(postos);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count());

        _mockRepo.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista vazia quando não há postos")]
    public async Task GetAllAsync_DeveRetornarListaVazia_QuandoNaoHaPostos()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<PostoDeTrabalho>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion

    #region GetByCondominioIdAsync Tests

    [Fact(DisplayName = "GetByCondominioIdAsync - Deve retornar postos do condomínio")]
    public async Task GetByCondominioIdAsync_DeveRetornar_QuandoExistemPostos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        // FASE 4: Sem QuantidadeIdealFuncionarios
        var postos = new List<PostoDeTrabalho>
        {
            new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), true),
            new PostoDeTrabalho(condominioId, empresaId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), true)
        };

        _mockRepo.Setup(r => r.GetByCondominioIdAsync(condominioId)).ReturnsAsync(postos);

        // Act
        var result = await _service.GetByCondominioIdAsync(condominioId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.All(result, p => Assert.Equal(condominioId, p.CondominioId));

        _mockRepo.Verify(r => r.GetByCondominioIdAsync(condominioId), Times.Once);
    }

    [Fact(DisplayName = "GetByCondominioIdAsync - Deve retornar lista vazia quando não há postos")]
    public async Task GetByCondominioIdAsync_DeveRetornarVazio_QuandoNaoHaPostos()
    {
        // Arrange
        var condominioId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByCondominioIdAsync(condominioId)).ReturnsAsync(new List<PostoDeTrabalho>());

        // Act
        var result = await _service.GetByCondominioIdAsync(condominioId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion
}

