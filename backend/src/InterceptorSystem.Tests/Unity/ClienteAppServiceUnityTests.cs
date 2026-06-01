using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Domain.SharedKernel.Exceptions;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using Moq;
using Microsoft.Extensions.Caching.Memory;
namespace InterceptorSystem.Tests.Unity;

public class ClienteAppServiceTests
{
    private readonly Mock<IClienteRepository> _mockRepo;
    private readonly Mock<ICurrentTenantService> _mockTenant;
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly IMemoryCache _cache;
    private readonly ClienteAppService _service;

    public ClienteAppServiceTests()
    {
        _mockRepo = new Mock<IClienteRepository>();
        _mockTenant = new Mock<ICurrentTenantService>();
        _mockUow = new Mock<IUnitOfWork>();
        _cache = new MemoryCache(new MemoryCacheOptions());

        // Configura o repositório para retornar nosso Mock de UnitOfWork
        _mockRepo.Setup(r => r.UnitOfWork).Returns(_mockUow.Object);

        _service = new ClienteAppService(_mockRepo.Object, _mockTenant.Object);
    }

    #region CreateAsync Tests

    [Fact(DisplayName = "CreateAsync - Deve criar cliente com dados válidos")]
    public async Task CreateAsync_DeveCriar_QuandoDadosValidos()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var input = new CreateClienteDtoInput(
            Nome: "Cliente Solar", 
            Cnpj: "11222333000181",
            Cidade: "São Paulo",
            Estado: "SP",
            EmailGestor: "gestor@solar.com.br",
            TelefoneEmergencia: "(11) 98765-4321"
        );

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockUow.Setup(u => u.CommitAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // --- ACT ---
        var result = await _service.CreateAsync(input);

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal("São Paulo", result.Cidade);
        Assert.Equal("SP", result.Estado);
        Assert.Equal("gestor@solar.com.br", result.EmailGestor);
        Assert.True(result.Ativo);

        _mockRepo.Verify(r => r.Add(It.Is<Cliente>(c => 
            c.EmpresaId == empresaId && 
            c.Nome == input.Nome && 
            c.Cidade == "São Paulo" &&
            c.Estado == "SP"
        )), Times.Once);
        
        _mockUow.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Deve lançar exceção quando EmpresaId não está no contexto")]
    public async Task CreateAsync_DeveFalhar_QuandoEmpresaIdNulo()
    {
        // --- ARRANGE ---
        var input = new CreateClienteDtoInput(
            "Cliente Teste", 
            "11222333000181",
            "São Paulo",
            "SP"
        );
        
        // EmpresaId retorna null (usuário não autenticado ou sem tenant)
        _mockTenant.Setup(t => t.EmpresaId).Returns((Guid?)null);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("EmpresaId não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Add(It.IsAny<Cliente>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact(DisplayName = "UpdateAsync - Deve atualizar cliente com dados válidos")]
    public async Task UpdateAsync_DeveAtualizar_QuandoDadosValidos()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var clienteExistente = new Cliente(
            empresaId, 
            "Nome Antigo", 
            "11222333000181",
            "Cidade Antiga",
            "SP"
        );
        
        var input = new UpdateClienteDtoInput(
            Nome: "Nome Atualizado", 
            Cnpj: "11222333000181",
            Cidade: "Nova Cidade",
            Estado: "RJ",
            EmailGestor: "novo@email.com",
            TelefoneEmergencia: "(11) 99999-8888"
        );

        _mockRepo.Setup(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(clienteExistente);
        _mockUow.Setup(u => u.CommitAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);

        // --- ACT ---
        var result = await _service.UpdateAsync(clienteId, input);

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal("Nome Atualizado", result.Nome);
        Assert.Equal("Nova Cidade", result.Cidade);
        Assert.Equal("RJ", result.Estado);
        Assert.Equal("novo@email.com", result.EmailGestor);
        
        _mockRepo.Verify(r => r.Update(It.Is<Cliente>(c => 
            c.Nome == input.Nome && 
            c.Cidade == "Nova Cidade" &&
            c.Estado == "RJ"
        )), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Deve lançar exceção quando cliente não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoClienteNaoExiste()
    {
        // --- ARRANGE ---
        var clienteId = Guid.NewGuid();
        var input = new UpdateClienteDtoInput(
            "Nome", 
            "11222333000181",
            "Cidade",
            "SP"
        );

        _mockRepo.Setup(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync((Cliente?)null);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(clienteId, input));
        Assert.Contains("Cliente não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Cliente>()), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync - Deve lançar exceção quando nome está vazio")]
    public async Task UpdateAsync_DeveFalhar_QuandoNomeVazio()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var clienteExistente = new Cliente(
            empresaId, 
            "Nome Original", 
            "11222333000181",
            "Cidade",
            "SP"
        );
        
        var input = new UpdateClienteDtoInput(
            "", 
            "11222333000181",
            "Cidade válida",
            "SP"
        );

        _mockRepo.Setup(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(clienteExistente);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<DomainException>(() => _service.UpdateAsync(clienteId, input));
        Assert.Contains("Nome é obrigatório", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Cliente>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact(DisplayName = "DeleteAsync - Deve remover cliente existente")]
    public async Task DeleteAsync_DeveRemover_QuandoClienteExiste()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var cliente = new Cliente(
            empresaId, 
            "Cliente a Deletar", 
            "11222333000181",
            "São Paulo",
            "SP"
        );

        _mockRepo.Setup(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);

        // --- ACT ---
        await _service.DeleteAsync(clienteId);

        // --- ASSERT ---
        _mockRepo.Verify(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve lançar exceção quando cliente não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoClienteNaoExiste()
    {
        // --- ARRANGE ---
        var clienteId = Guid.NewGuid();
        _mockRepo.Setup(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(0);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(clienteId));
        Assert.Contains("Cliente não encontrado", exception.Message);

        _mockRepo.Verify(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve funcionar com ID inválido sem quebrar")]
    public async Task DeleteAsync_DeveFalhar_QuandoIdInvalido()
    {
        // --- ARRANGE ---
        var idInvalido = Guid.Empty;
        _mockRepo.Setup(r => r.DeleteDirectlyAsync(idInvalido, It.IsAny<CancellationToken>())).ReturnsAsync(0);

        // --- ACT & ASSERT ---
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(idInvalido));

        _mockRepo.Verify(r => r.DeleteDirectlyAsync(idInvalido, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve lançar erro de negócio quando cliente possui vínculos")]
    public async Task DeleteAsync_DeveFalharComMensagemDeNegocio_QuandoDeleteBloqueadoPorRelacionamento()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();

        _mockRepo
            .Setup(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("FK_Contratos_Clientes"));
        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);

        // --- ACT ---
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(clienteId));

        // --- ASSERT ---
        Assert.Contains("Não é possível excluir este cliente porque existem registros vinculados", exception.Message);
        _mockRepo.Verify(r => r.DeleteDirectlyAsync(clienteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact(DisplayName = "GetByIdAsync - Deve retornar cliente quando existe")]
    public async Task GetByIdAsync_DeveRetornar_QuandoClienteExiste()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        var cliente = new Cliente(
            empresaId, 
            "Cliente Teste", 
            "11222333000181",
            "Campinas",
            "SP"
        );

        _mockRepo.Setup(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(cliente);

        // --- ACT ---
        var result = await _service.GetByIdAsync(clienteId, It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(cliente.Nome, result.Nome);
        Assert.Equal(cliente.Cidade, result.Cidade);
        Assert.Equal(cliente.Estado, result.Estado);
        
        _mockRepo.Verify(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve retornar null quando cliente não existe")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoClienteNaoExiste()
    {
        // --- ARRANGE ---
        var clienteId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync((Cliente?)null);

        // --- ACT ---
        var result = await _service.GetByIdAsync(clienteId, It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.Null(result);
        _mockRepo.Verify(r => r.GetByIdAsync(clienteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve funcionar com ID vazio")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoIdVazio()
    {
        // --- ARRANGE ---
        var idVazio = Guid.Empty;
        _mockRepo.Setup(r => r.GetByIdAsync(idVazio, It.IsAny<CancellationToken>())).ReturnsAsync((Cliente?)null);

        // --- ACT ---
        var result = await _service.GetByIdAsync(idVazio, It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.Null(result);
    }

    #endregion

    #region GetAllAsync Tests

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista de clientes")]
    public async Task GetAllAsync_DeveRetornarLista_QuandoExistemClientes()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var clientes = new List<Cliente>
        {
            new Cliente(empresaId, "Cliente A", "11222333000181", "São Paulo", "SP"),
            new Cliente(empresaId, "Cliente B", "22333444000181", "Rio de Janeiro", "RJ"),
            new Cliente(empresaId, "Cliente C", "12345678000195", "Belo Horizonte", "MG")
        };

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(clientes);

        // --- ACT ---
        var result = await _service.GetAllAsync(It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(3, result.Count());
        Assert.Contains(result, c => c.Nome == "Cliente A");
        
        _mockRepo.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista vazia quando não há clientes")]
    public async Task GetAllAsync_DeveRetornarListaVazia_QuandoNaoHaClientes()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Cliente>());

        // --- ACT ---
        var result = await _service.GetAllAsync(It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar apenas clientes ativos")]
    public async Task GetAllAsync_DeveRetornarApenaAtivos_QuandoFiltrado()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var cliente1 = new Cliente(empresaId, "Ativo", "11222333000181", "São Paulo", "SP");
        var cliente2 = new Cliente(empresaId, "Inativo", "22333444000181", "Rio de Janeiro", "RJ");
        cliente2.Desativar();

        var clientes = new List<Cliente> { cliente1, cliente2 };

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(clientes);

        // --- ACT ---
        var result = await _service.GetAllAsync(It.IsAny<CancellationToken>());

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(2, result.Count()); // Retorna todos (filtro deve ser no repositório ou query específica)
        Assert.Single(result.Where(c => c.Ativo));
    }

    #endregion
}
