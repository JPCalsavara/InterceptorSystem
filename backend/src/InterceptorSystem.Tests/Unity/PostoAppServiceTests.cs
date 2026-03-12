using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Moq;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes unitários para PostoAppService.
/// Posto agora é apenas locação física (Nome, Endereço, Cidade, Estado).
/// A lógica de agendamento/escala foi movida para AlocacaoAppService.
/// </summary>
public class PostoAppServiceTests
{
    private readonly Mock<IPostoRepository> _mockRepo;
    private readonly Mock<IClienteRepository> _mockClienteRepo;
    private readonly Mock<ICurrentTenantService> _mockTenant;
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly PostoAppService _service;

    public PostoAppServiceTests()
    {
        _mockRepo = new Mock<IPostoRepository>();
        _mockClienteRepo = new Mock<IClienteRepository>();
        _mockTenant = new Mock<ICurrentTenantService>();
        _mockUow = new Mock<IUnitOfWork>();

        _mockRepo.Setup(r => r.UnitOfWork).Returns(_mockUow.Object);
        _mockTenant.Setup(t => t.EmpresaId).Returns(Guid.NewGuid());

        _service = new PostoAppService(
            _mockRepo.Object,
            _mockClienteRepo.Object,
            _mockTenant.Object,
            new MemoryCache(new MemoryCacheOptions()));
    }

    #region CreateAsync Tests

    [Fact(DisplayName = "CreateAsync - Deve criar posto com dados válidos")]
    public async Task CreateAsync_DeveCriar_QuandoDadosValidos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var cliente = new Cliente(empresaId, "Cliente Teste", "00000000000000", "São Paulo", "SP");
        var input = new CreatePostoInput(clienteId, "Portaria A", "Rua das Flores, 123", "São Paulo", "SP");

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockClienteRepo.Setup(r => r.GetByIdAsync(clienteId)).ReturnsAsync(cliente);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Portaria A", result.Nome);
        Assert.Equal("Rua das Flores, 123", result.Endereco);
        Assert.Equal("São Paulo", result.Cidade);
        Assert.Equal("SP", result.Estado);
        Assert.True(result.Ativo);

        _mockRepo.Verify(r => r.Add(It.Is<Posto>(p =>
            p.ClienteId == clienteId &&
            p.Nome == "Portaria A" &&
            p.Endereco == "Rua das Flores, 123" &&
            p.Cidade == "São Paulo" &&
            p.Estado == "SP"
        )), Times.Once);

        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando cliente não existe")]
    public async Task CreateAsync_DeveFalhar_QuandoClienteNaoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var input = new CreatePostoInput(clienteId, "Portaria A", "Rua X", "São Paulo", "SP");

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockClienteRepo.Setup(r => r.GetByIdAsync(clienteId)).ReturnsAsync((Cliente?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Cliente não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Add(It.IsAny<Posto>()), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Deve falhar quando tenant não está definido")]
    public async Task CreateAsync_DeveFalhar_QuandoTenantNaoDefinido()
    {
        // Arrange
        var input = new CreatePostoInput(Guid.NewGuid(), "Portaria A", "Rua X", "São Paulo", "SP");
        _mockTenant.Setup(t => t.EmpresaId).Returns((Guid?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        _mockRepo.Verify(r => r.Add(It.IsAny<Posto>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact(DisplayName = "UpdateAsync - Deve atualizar posto quando dados válidos")]
    public async Task UpdateAsync_DeveAtualizarPostoQuandoDadosValidos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var posto = new Posto(clienteId, empresaId, "Portaria A", "Rua Velha", "São Paulo", "SP");

        var input = new UpdatePostoInput("Portaria B", "Rua Nova, 456", "Campinas", "SP");

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.UpdateAsync(postoId, input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Portaria B", result.Nome);
        Assert.Equal("Rua Nova, 456", result.Endereco);
        Assert.Equal("Campinas", result.Cidade);
        Assert.Equal("SP", result.Estado);

        _mockRepo.Verify(r => r.Update(It.IsAny<Posto>()), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Deve falhar quando posto não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        var input = new UpdatePostoInput("Portaria B", "Rua Nova", "São Paulo", "SP");

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((Posto?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(postoId, input));
        Assert.Contains("Posto de Trabalho não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Posto>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact(DisplayName = "DeleteAsync - Deve desativar posto existente")]
    public async Task DeleteAsync_DeveDesativar_QuandoPostoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var posto = new Posto(clienteId, empresaId, "Portaria A", "Rua X", "São Paulo", "SP");

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // Act
        await _service.DeleteAsync(postoId);

        // Assert
        _mockRepo.Verify(r => r.Update(It.Is<Posto>(p => !p.Ativo)), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve falhar quando posto não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((Posto?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(postoId));
        Assert.Contains("Posto de Trabalho não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Posto>()), Times.Never);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact(DisplayName = "GetByIdAsync - Deve retornar posto quando existe")]
    public async Task GetByIdAsync_DeveRetornar_QuandoPostoExiste()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var postoId = Guid.NewGuid();
        var posto = new Posto(clienteId, empresaId, "Portaria A", "Rua X", "São Paulo", "SP");

        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync(posto);

        // Act
        var result = await _service.GetByIdAsync(postoId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Portaria A", result.Nome);
        Assert.Equal("São Paulo", result.Cidade);

        _mockRepo.Verify(r => r.GetByIdAsync(postoId), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve retornar null quando posto não existe")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoPostoNaoExiste()
    {
        // Arrange
        var postoId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(postoId)).ReturnsAsync((Posto?)null);

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
        var clienteId = Guid.NewGuid();
        var postos = new List<Posto>
        {
            new Posto(clienteId, empresaId, "Portaria A", "Rua A", "São Paulo", "SP"),
            new Posto(clienteId, empresaId, "Portaria B", "Rua B", "São Paulo", "SP"),
            new Posto(clienteId, empresaId, "Portaria C", "Rua C", "Campinas", "SP")
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
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Posto>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion

    #region GetByClienteIdAsync Tests

    [Fact(DisplayName = "GetByClienteIdAsync - Deve retornar postos do cliente")]
    public async Task GetByClienteIdAsync_DeveRetornar_QuandoExistemPostos()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var postos = new List<Posto>
        {
            new Posto(clienteId, empresaId, "Portaria A", "Rua A", "São Paulo", "SP"),
            new Posto(clienteId, empresaId, "Portaria B", "Rua B", "São Paulo", "SP")
        };

        _mockRepo.Setup(r => r.GetByClienteIdAsync(clienteId)).ReturnsAsync(postos);

        // Act
        var result = await _service.GetByClienteIdAsync(clienteId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.All(result, p => Assert.Equal(clienteId, p.ClienteId));

        _mockRepo.Verify(r => r.GetByClienteIdAsync(clienteId), Times.Once);
    }

    [Fact(DisplayName = "GetByClienteIdAsync - Deve retornar lista vazia quando não há postos")]
    public async Task GetByClienteIdAsync_DeveRetornarVazio_QuandoNaoHaPostos()
    {
        // Arrange
        var clienteId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByClienteIdAsync(clienteId)).ReturnsAsync(new List<Posto>());

        // Act
        var result = await _service.GetByClienteIdAsync(clienteId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    #endregion
}
