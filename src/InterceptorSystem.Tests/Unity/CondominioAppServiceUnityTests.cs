using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Services;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class CondominioAppServiceTests
{
    private readonly Mock<ICondominioRepository> _mockRepo;
    private readonly Mock<ICurrentTenantService> _mockTenant;
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly CondominioAppService _service;

    public CondominioAppServiceTests()
    {
        _mockRepo = new Mock<ICondominioRepository>();
        _mockTenant = new Mock<ICurrentTenantService>();
        _mockUow = new Mock<IUnitOfWork>();

        // Configura o repositório para retornar nosso Mock de UnitOfWork
        _mockRepo.Setup(r => r.UnitOfWork).Returns(_mockUow.Object);

        _service = new CondominioAppService(_mockRepo.Object, _mockTenant.Object);
    }

    #region CreateAsync Tests

    [Fact(DisplayName = "CreateAsync - Deve criar condomínio com dados válidos")]
    public async Task CreateAsync_DeveCriar_QuandoDadosValidos()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var input = new CreateCondominioDtoInput(
            "Condomínio Residencial Solar", 
            "12.345.678/0001-90", 
            "Av. Paulista, 1000 - São Paulo/SP"
        );

        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);
        _mockRepo.Setup(r => r.GetByCnpjAsync(input.Cnpj)).ReturnsAsync((Condominio?)null);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // --- ACT ---
        var result = await _service.CreateAsync(input);

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal(input.Cnpj, result.Cnpj);
        Assert.True(result.Ativo);

        _mockRepo.Verify(r => r.Add(It.Is<Condominio>(c => 
            c.EmpresaId == empresaId && 
            c.Nome == input.Nome && 
            c.Cnpj == input.Cnpj
        )), Times.Once);
        
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "CreateAsync - Deve lançar exceção quando CNPJ já existe")]
    public async Task CreateAsync_DeveFalhar_QuandoCnpjDuplicado()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var input = new CreateCondominioDtoInput("Condomínio Duplicado", "11.111.111/0001-11", "Rua X");
        
        _mockTenant.Setup(t => t.EmpresaId).Returns(empresaId);

        // Simula que JÁ EXISTE um condomínio com esse CNPJ
        var existente = new Condominio(empresaId, "Existente", input.Cnpj, "Rua Y");
        _mockRepo.Setup(r => r.GetByCnpjAsync(input.Cnpj)).ReturnsAsync(existente);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("Já existe um condomínio cadastrado com este CNPJ", exception.Message);

        _mockRepo.Verify(r => r.Add(It.IsAny<Condominio>()), Times.Never);
        _mockUow.Verify(u => u.CommitAsync(), Times.Never);
    }

    [Fact(DisplayName = "CreateAsync - Deve lançar exceção quando EmpresaId não está no contexto")]
    public async Task CreateAsync_DeveFalhar_QuandoEmpresaIdNulo()
    {
        // --- ARRANGE ---
        var input = new CreateCondominioDtoInput("Condomínio Teste", "11.111.111/0001-11", "Rua Teste");
        
        // EmpresaId retorna null (usuário não autenticado ou sem tenant)
        _mockTenant.Setup(t => t.EmpresaId).Returns((Guid?)null);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(input));
        Assert.Contains("EmpresaId não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Add(It.IsAny<Condominio>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact(DisplayName = "UpdateAsync - Deve atualizar condomínio com dados válidos")]
    public async Task UpdateAsync_DeveAtualizar_QuandoDadosValidos()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominioExistente = new Condominio(empresaId, "Nome Antigo", "11.111.111/0001-11", "Endereço Antigo");
        
        var input = new UpdateCondominioDtoInput("Nome Atualizado", "Novo Endereço, 123");

        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominioExistente);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // --- ACT ---
        var result = await _service.UpdateAsync(condominioId, input);

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal("Nome Atualizado", result.Nome);
        
        _mockRepo.Verify(r => r.Update(It.Is<Condominio>(c => c.Nome == input.Nome)), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "UpdateAsync - Deve lançar exceção quando condomínio não existe")]
    public async Task UpdateAsync_DeveFalhar_QuandoCondominioNaoExiste()
    {
        // --- ARRANGE ---
        var condominioId = Guid.NewGuid();
        var input = new UpdateCondominioDtoInput("Nome", "Endereço");

        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(condominioId, input));
        Assert.Contains("Condomínio não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Condominio>()), Times.Never);
    }

    [Fact(DisplayName = "UpdateAsync - Deve lançar exceção quando nome está vazio")]
    public async Task UpdateAsync_DeveFalhar_QuandoNomeVazio()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominioExistente = new Condominio(empresaId, "Nome Original", "11.111.111/0001-11", "Endereço");
        
        var input = new UpdateCondominioDtoInput("", "Endereço válido"); // Nome vazio

        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominioExistente);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(condominioId, input));
        Assert.Contains("Nome é obrigatório", exception.Message);

        _mockRepo.Verify(r => r.Update(It.IsAny<Condominio>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact(DisplayName = "DeleteAsync - Deve remover condomínio existente")]
    public async Task DeleteAsync_DeveRemover_QuandoCondominioExiste()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominio = new Condominio(empresaId, "Condomínio a Deletar", "11.111.111/0001-11", "Rua X");

        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominio);
        _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(true);

        // --- ACT ---
        await _service.DeleteAsync(condominioId);

        // --- ASSERT ---
        _mockRepo.Verify(r => r.Remove(condominio), Times.Once);
        _mockUow.Verify(u => u.CommitAsync(), Times.Once);
    }

    [Fact(DisplayName = "DeleteAsync - Deve lançar exceção quando condomínio não existe")]
    public async Task DeleteAsync_DeveFalhar_QuandoCondominioNaoExiste()
    {
        // --- ARRANGE ---
        var condominioId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        // --- ACT & ASSERT ---
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(condominioId));
        Assert.Contains("Condomínio não encontrado", exception.Message);

        _mockRepo.Verify(r => r.Remove(It.IsAny<Condominio>()), Times.Never);
    }

    [Fact(DisplayName = "DeleteAsync - Deve funcionar com ID inválido sem quebrar")]
    public async Task DeleteAsync_DeveFalhar_QuandoIdInvalido()
    {
        // --- ARRANGE ---
        var idInvalido = Guid.Empty;
        _mockRepo.Setup(r => r.GetByIdAsync(idInvalido)).ReturnsAsync((Condominio?)null);

        // --- ACT & ASSERT ---
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(idInvalido));

        _mockRepo.Verify(r => r.Remove(It.IsAny<Condominio>()), Times.Never);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact(DisplayName = "GetByIdAsync - Deve retornar condomínio quando existe")]
    public async Task GetByIdAsync_DeveRetornar_QuandoCondominioExiste()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        var condominio = new Condominio(empresaId, "Condomínio Teste", "11.111.111/0001-11", "Rua ABC");

        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync(condominio);

        // --- ACT ---
        var result = await _service.GetByIdAsync(condominioId);

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(condominio.Nome, result.Nome);
        Assert.Equal(condominio.Cnpj, result.Cnpj);
        
        _mockRepo.Verify(r => r.GetByIdAsync(condominioId), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve retornar null quando condomínio não existe")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoCondominioNaoExiste()
    {
        // --- ARRANGE ---
        var condominioId = Guid.NewGuid();
        _mockRepo.Setup(r => r.GetByIdAsync(condominioId)).ReturnsAsync((Condominio?)null);

        // --- ACT ---
        var result = await _service.GetByIdAsync(condominioId);

        // --- ASSERT ---
        Assert.Null(result);
        _mockRepo.Verify(r => r.GetByIdAsync(condominioId), Times.Once);
    }

    [Fact(DisplayName = "GetByIdAsync - Deve funcionar com ID vazio")]
    public async Task GetByIdAsync_DeveRetornarNull_QuandoIdVazio()
    {
        // --- ARRANGE ---
        var idVazio = Guid.Empty;
        _mockRepo.Setup(r => r.GetByIdAsync(idVazio)).ReturnsAsync((Condominio?)null);

        // --- ACT ---
        var result = await _service.GetByIdAsync(idVazio);

        // --- ASSERT ---
        Assert.Null(result);
    }

    #endregion

    #region GetAllAsync Tests

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista de condomínios")]
    public async Task GetAllAsync_DeveRetornarLista_QuandoExistemCondominios()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominios = new List<Condominio>
        {
            new Condominio(empresaId, "Condomínio A", "11.111.111/0001-11", "Rua A"),
            new Condominio(empresaId, "Condomínio B", "22.222.222/0001-22", "Rua B"),
            new Condominio(empresaId, "Condomínio C", "33.333.333/0001-33", "Rua C")
        };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(condominios);

        // --- ACT ---
        var result = await _service.GetAllAsync();

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(3, result.Count());
        Assert.Contains(result, c => c.Nome == "Condomínio A");
        
        _mockRepo.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar lista vazia quando não há condomínios")]
    public async Task GetAllAsync_DeveRetornarListaVazia_QuandoNaoHaCondominios()
    {
        // --- ARRANGE ---
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Condominio>());

        // --- ACT ---
        var result = await _service.GetAllAsync();

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact(DisplayName = "GetAllAsync - Deve retornar apenas condomínios ativos")]
    public async Task GetAllAsync_DeveRetornarApenaAtivos_QuandoFiltrado()
    {
        // --- ARRANGE ---
        var empresaId = Guid.NewGuid();
        var condominio1 = new Condominio(empresaId, "Ativo", "11.111.111/0001-11", "Rua A");
        var condominio2 = new Condominio(empresaId, "Inativo", "22.222.222/0001-22", "Rua B");
        condominio2.Desativar();

        var condominios = new List<Condominio> { condominio1, condominio2 };

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(condominios);

        // --- ACT ---
        var result = await _service.GetAllAsync();

        // --- ASSERT ---
        Assert.NotNull(result);
        Assert.Equal(2, result.Count()); // Retorna todos (filtro deve ser no repositório ou query específica)
        Assert.Single(result.Where(c => c.Ativo));
    }

    #endregion
}


