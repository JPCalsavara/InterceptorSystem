using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Application.Modulos.Auth.Services;
using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using Microsoft.Extensions.Configuration;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class AuthAppServiceTests
{
    private readonly Mock<IContaRepository> _contaRepo = new();
    private readonly Mock<IJwtTokenService> _jwtService = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IEmailService> _emailService = new();
    private readonly Mock<ITokenVerificacaoRepository> _tokenRepo = new();
    private readonly Mock<IConfiguration> _configuration = new();
    private readonly AuthAppService _service;

    private const string SenhaPlana = "minhasenha123";
    private const string SenhaHash = "$2b$hash_fake";
    private const string TokenFake = "jwt.token.fake";
    private const string TokenVerificacaoFake = "token-verificacao-fake";

    public AuthAppServiceTests()
    {
        _configuration.Setup(c => c["App:FrontendBaseUrl"]).Returns("http://localhost:4200");
        _tokenRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);
        _emailService.Setup(e => e.EnviarVerificacaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        _emailService.Setup(e => e.EnviarResetSenhaAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        _emailService.Setup(e => e.EnviarConfirmacaoAlteracaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _service = new AuthAppService(
            _contaRepo.Object,
            _jwtService.Object,
            _passwordHasher.Object,
            _emailService.Object,
            _tokenRepo.Object,
            _configuration.Object
        );
    }

    // --- Helpers ---

    private static Conta CriarConta(string email = "empresa@teste.com", bool ativo = true)
    {
        var conta = new Conta(email, SenhaHash, "Empresa Teste", "12.345.678/0001-90");
        if (!ativo)
            conta.Desativar();
        return conta;
    }

    private void ConfigurarHasherValido()
    {
        _passwordHasher.Setup(h => h.Hash(SenhaPlana)).Returns(SenhaHash);
        _passwordHasher.Setup(h => h.Verify(SenhaPlana, SenhaHash)).Returns(true);
    }

    // --- RegistrarAsync ---

    [Fact(DisplayName = "RegistrarAsync - Deve criar conta e retornar token quando dados válidos")]
    public async Task RegistrarAsync_DeveCriarConta_QuandoDadosValidos()
    {
        // Arrange
        var input = new RegistrarContaDtoInput("empresa@teste.com", SenhaPlana, "Empresa Teste", "12.345.678/0001-90");
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync((Conta?)null);
        ConfigurarHasherValido();
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);
        _jwtService.Setup(j => j.GerarToken(It.IsAny<Conta>())).Returns(TokenFake);

        // Act
        var result = await _service.RegistrarAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(input.Email, result.Email);
        Assert.Equal(input.NomeEmpresa, result.NomeEmpresa);
        Assert.Equal(TokenFake, result.Token);
        Assert.NotEqual(Guid.Empty, result.EmpresaId);
        Assert.False(result.EmailVerificado);

        _contaRepo.Verify(r => r.Add(It.IsAny<Conta>()), Times.Once);
        _contaRepo.Verify(r => r.CommitAsync(), Times.Once);
        _passwordHasher.Verify(h => h.Hash(SenhaPlana), Times.Once);
        _jwtService.Verify(j => j.GerarToken(It.IsAny<Conta>()), Times.Once);
        _emailService.Verify(e => e.EnviarVerificacaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact(DisplayName = "RegistrarAsync - Deve criar conta sem CNPJ quando CNPJ não informado")]
    public async Task RegistrarAsync_DeveCriarConta_SemCnpj()
    {
        // Arrange - CNPJ é opcional
        var input = new RegistrarContaDtoInput("sem.cnpj@teste.com", SenhaPlana, "Empresa Sem CNPJ");
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync((Conta?)null);
        ConfigurarHasherValido();
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);
        _jwtService.Setup(j => j.GerarToken(It.IsAny<Conta>())).Returns(TokenFake);

        // Act
        var result = await _service.RegistrarAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(input.NomeEmpresa, result.NomeEmpresa);
        _contaRepo.Verify(r => r.Add(It.IsAny<Conta>()), Times.Once);
    }

    [Fact(DisplayName = "RegistrarAsync - Deve falhar quando e-mail já está cadastrado")]
    public async Task RegistrarAsync_DeveFalhar_QuandoEmailJaExiste()
    {
        // Arrange
        var input = new RegistrarContaDtoInput("duplicado@teste.com", SenhaPlana, "Empresa Duplicada");
        var contaExistente = CriarConta("duplicado@teste.com");
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync(contaExistente);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RegistrarAsync(input));

        Assert.Contains("Já existe uma conta com este e-mail", ex.Message);
        _contaRepo.Verify(r => r.Add(It.IsAny<Conta>()), Times.Never);
        _contaRepo.Verify(r => r.CommitAsync(), Times.Never);
    }

    [Fact(DisplayName = "RegistrarAsync - Deve normalizar e-mail para lowercase")]
    public async Task RegistrarAsync_DeveNormalizarEmail()
    {
        // Arrange
        var input = new RegistrarContaDtoInput("EMPRESA@TESTE.COM", SenhaPlana, "Empresa Teste");
        _contaRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((Conta?)null);
        ConfigurarHasherValido();
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);

        Conta? contaCriada = null;
        _contaRepo.Setup(r => r.Add(It.IsAny<Conta>()))
            .Callback<Conta>(c => contaCriada = c);
        _jwtService.Setup(j => j.GerarToken(It.IsAny<Conta>())).Returns(TokenFake);

        // Act
        await _service.RegistrarAsync(input);

        // Assert - E-mail deve estar em lowercase
        Assert.NotNull(contaCriada);
        Assert.Equal("empresa@teste.com", contaCriada!.Email);
    }

    [Fact(DisplayName = "RegistrarAsync - Deve armazenar hash da senha, não a senha plana")]
    public async Task RegistrarAsync_DeveArmazenarHashDaSenha()
    {
        // Arrange
        var input = new RegistrarContaDtoInput("seguro@teste.com", SenhaPlana, "Empresa Segura");
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync((Conta?)null);
        ConfigurarHasherValido();
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);

        Conta? contaCriada = null;
        _contaRepo.Setup(r => r.Add(It.IsAny<Conta>()))
            .Callback<Conta>(c => contaCriada = c);
        _jwtService.Setup(j => j.GerarToken(It.IsAny<Conta>())).Returns(TokenFake);

        // Act
        await _service.RegistrarAsync(input);

        // Assert - Senha armazenada deve ser o hash, não o texto plano
        Assert.NotNull(contaCriada);
        Assert.Equal(SenhaHash, contaCriada!.SenhaHash);
        Assert.NotEqual(SenhaPlana, contaCriada!.SenhaHash);
    }

    // --- LoginAsync ---

    [Fact(DisplayName = "LoginAsync - Deve retornar token quando credenciais válidas")]
    public async Task LoginAsync_DeveRetornarToken_QuandoCredenciaisValidas()
    {
        // Arrange
        var conta = CriarConta();
        var input = new LoginDtoInput("empresa@teste.com", SenhaPlana);
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync(conta);
        _passwordHasher.Setup(h => h.Verify(SenhaPlana, SenhaHash)).Returns(true);
        _jwtService.Setup(j => j.GerarToken(conta)).Returns(TokenFake);

        // Act
        var result = await _service.LoginAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(conta.Email, result.Email);
        Assert.Equal(conta.NomeEmpresa, result.NomeEmpresa);
        Assert.Equal(conta.Id, result.EmpresaId);
        Assert.Equal(TokenFake, result.Token);

        _jwtService.Verify(j => j.GerarToken(conta), Times.Once);
    }

    [Fact(DisplayName = "LoginAsync - Deve falhar quando e-mail não existe")]
    public async Task LoginAsync_DeveFalhar_QuandoEmailNaoEncontrado()
    {
        // Arrange
        var input = new LoginDtoInput("naoexiste@teste.com", SenhaPlana);
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync((Conta?)null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.LoginAsync(input));

        Assert.Contains("E-mail ou senha inválidos", ex.Message);
        _jwtService.Verify(j => j.GerarToken(It.IsAny<Conta>()), Times.Never);
    }

    [Fact(DisplayName = "LoginAsync - Deve falhar quando senha está incorreta")]
    public async Task LoginAsync_DeveFalhar_QuandoSenhaIncorreta()
    {
        // Arrange
        var conta = CriarConta();
        var input = new LoginDtoInput("empresa@teste.com", "senhaerrada");
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync(conta);
        _passwordHasher.Setup(h => h.Verify("senhaerrada", SenhaHash)).Returns(false);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.LoginAsync(input));

        Assert.Contains("E-mail ou senha inválidos", ex.Message);
        _jwtService.Verify(j => j.GerarToken(It.IsAny<Conta>()), Times.Never);
    }

    [Fact(DisplayName = "LoginAsync - Deve falhar quando conta está desativada")]
    public async Task LoginAsync_DeveFalhar_QuandoContaDesativada()
    {
        // Arrange
        var contaDesativada = CriarConta(ativo: false);
        var input = new LoginDtoInput("empresa@teste.com", SenhaPlana);
        _contaRepo.Setup(r => r.GetByEmailAsync(input.Email)).ReturnsAsync(contaDesativada);
        _passwordHasher.Setup(h => h.Verify(SenhaPlana, SenhaHash)).Returns(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.LoginAsync(input));

        Assert.Contains("conta está desativada", ex.Message);
        _jwtService.Verify(j => j.GerarToken(It.IsAny<Conta>()), Times.Never);
    }

    [Fact(DisplayName = "LoginAsync - Não deve revelar qual campo está errado (e-mail ou senha)")]
    public async Task LoginAsync_DeveRetornarMesmaMensagem_ParaEmailOuSenhaInvalidos()
    {
        // Arrange - Email não existe
        var inputEmailInexistente = new LoginDtoInput("inexistente@teste.com", SenhaPlana);
        _contaRepo.Setup(r => r.GetByEmailAsync(inputEmailInexistente.Email)).ReturnsAsync((Conta?)null);

        // Arrange - Senha errada
        var conta = CriarConta("correto@teste.com");
        var inputSenhaErrada = new LoginDtoInput("correto@teste.com", "senhaerrada");
        _contaRepo.Setup(r => r.GetByEmailAsync(inputSenhaErrada.Email)).ReturnsAsync(conta);
        _passwordHasher.Setup(h => h.Verify("senhaerrada", SenhaHash)).Returns(false);

        // Act
        var exEmail = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.LoginAsync(inputEmailInexistente));
        var exSenha = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.LoginAsync(inputSenhaErrada));

        // Assert - Mesma mensagem para não revelar qual está errado (segurança)
        Assert.Equal(exEmail.Message, exSenha.Message);
    }

    // --- ConfirmarEmailAsync ---

    [Fact(DisplayName = "ConfirmarEmailAsync - Deve marcar email como verificado quando token válido")]
    public async Task ConfirmarEmailAsync_DeveMarcarEmailVerificado_QuandoTokenValido()
    {
        // Arrange
        var conta = CriarConta();
        var tokenEntidade = new TokenVerificacao(
            conta.Id,
            TokenVerificacaoFake,
            TipoTokenVerificacao.EmailVerificacao,
            DateTime.UtcNow.AddHours(24));

        _tokenRepo.Setup(r => r.GetByTokenAsync(TokenVerificacaoFake, TipoTokenVerificacao.EmailVerificacao))
            .ReturnsAsync(tokenEntidade);
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);

        // Act
        await _service.ConfirmarEmailAsync(new ConfirmarTokenDtoInput(TokenVerificacaoFake));

        // Assert
        Assert.True(conta.EmailVerificado);
        Assert.True(tokenEntidade.Usado);
    }

    [Fact(DisplayName = "ConfirmarEmailAsync - Deve falhar quando token não existe")]
    public async Task ConfirmarEmailAsync_DeveFalhar_QuandoTokenNaoExiste()
    {
        // Arrange
        _tokenRepo.Setup(r => r.GetByTokenAsync(It.IsAny<string>(), It.IsAny<TipoTokenVerificacao>()))
            .ReturnsAsync((TokenVerificacao?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ConfirmarEmailAsync(new ConfirmarTokenDtoInput("token-inexistente")));
    }

    [Fact(DisplayName = "ConfirmarEmailAsync - Deve falhar quando token já foi usado")]
    public async Task ConfirmarEmailAsync_DeveFalhar_QuandoTokenJaUsado()
    {
        // Arrange
        var conta = CriarConta();
        var tokenEntidade = new TokenVerificacao(
            conta.Id,
            TokenVerificacaoFake,
            TipoTokenVerificacao.EmailVerificacao,
            DateTime.UtcNow.AddHours(24));
        tokenEntidade.Consumir(); // Token já usado

        _tokenRepo.Setup(r => r.GetByTokenAsync(TokenVerificacaoFake, TipoTokenVerificacao.EmailVerificacao))
            .ReturnsAsync(tokenEntidade);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ConfirmarEmailAsync(new ConfirmarTokenDtoInput(TokenVerificacaoFake)));
    }

    // --- SolicitarResetSenhaAsync ---

    [Fact(DisplayName = "SolicitarResetSenhaAsync - Deve enviar e-mail quando conta existe")]
    public async Task SolicitarResetSenhaAsync_DeveEnviarEmail_QuandoContaExiste()
    {
        // Arrange
        var conta = CriarConta();
        _contaRepo.Setup(r => r.GetByEmailAsync(conta.Email)).ReturnsAsync(conta);
        _tokenRepo.Setup(r => r.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.AlteracaoSenha))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SolicitarResetSenhaAsync(new SolicitarResetSenhaDtoInput(conta.Email));

        // Assert
        _tokenRepo.Verify(r => r.Add(It.IsAny<TokenVerificacao>()), Times.Once);
        _emailService.Verify(e => e.EnviarResetSenhaAsync(conta.Email, conta.NomeEmpresa, It.IsAny<string>()), Times.Once);
    }

    [Fact(DisplayName = "SolicitarResetSenhaAsync - Deve retornar sem erro quando conta não existe (anti-enumeração)")]
    public async Task SolicitarResetSenhaAsync_DeveRetornarSilenciosamente_QuandoContaNaoExiste()
    {
        // Arrange
        _contaRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((Conta?)null);

        // Act - Não deve lançar exceção
        await _service.SolicitarResetSenhaAsync(new SolicitarResetSenhaDtoInput("inexistente@teste.com"));

        // Assert - Nenhum e-mail deve ser enviado
        _emailService.Verify(e => e.EnviarResetSenhaAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    // --- ConfirmarResetSenhaAsync ---

    [Fact(DisplayName = "ConfirmarResetSenhaAsync - Deve alterar senha quando token válido")]
    public async Task ConfirmarResetSenhaAsync_DeveAlterarSenha_QuandoTokenValido()
    {
        // Arrange
        var conta = CriarConta();
        const string novaSenhaPlana = "novaSenha456";
        const string novaSenhaHash = "$2b$novo_hash";

        var tokenEntidade = new TokenVerificacao(
            conta.Id,
            TokenVerificacaoFake,
            TipoTokenVerificacao.AlteracaoSenha,
            DateTime.UtcNow.AddHours(1));

        _tokenRepo.Setup(r => r.GetByTokenAsync(TokenVerificacaoFake, TipoTokenVerificacao.AlteracaoSenha))
            .ReturnsAsync(tokenEntidade);
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);
        _contaRepo.Setup(r => r.CommitAsync()).ReturnsAsync(true);
        _passwordHasher.Setup(h => h.Hash(novaSenhaPlana)).Returns(novaSenhaHash);

        // Act
        await _service.ConfirmarResetSenhaAsync(new ConfirmarResetSenhaDtoInput(TokenVerificacaoFake, novaSenhaPlana));

        // Assert
        Assert.Equal(novaSenhaHash, conta.SenhaHash);
        Assert.True(tokenEntidade.Usado);
    }

    // --- ConfirmarEmailAsync - casos adicionais ---

    [Fact(DisplayName = "ConfirmarEmailAsync - Deve falhar quando token está expirado")]
    public async Task ConfirmarEmailAsync_DeveFalhar_QuandoTokenExpirado()
    {
        // Arrange
        var conta = CriarConta();
        var tokenExpirado = new TokenVerificacao(
            conta.Id,
            TokenVerificacaoFake,
            TipoTokenVerificacao.EmailVerificacao,
            DateTime.UtcNow.AddHours(-1)); // Expirou há 1 hora

        _tokenRepo.Setup(r => r.GetByTokenAsync(TokenVerificacaoFake, TipoTokenVerificacao.EmailVerificacao))
            .ReturnsAsync(tokenExpirado);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ConfirmarEmailAsync(new ConfirmarTokenDtoInput(TokenVerificacaoFake)));

        Assert.Contains("inválido ou expirado", ex.Message);
        _contaRepo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    // --- ReenviarVerificacaoEmailAsync ---

    [Fact(DisplayName = "ReenviarVerificacaoEmailAsync - Deve enviar e-mail e criar novo token quando e-mail não verificado")]
    public async Task ReenviarVerificacaoEmailAsync_DeveEnviarEmailECriarToken_QuandoEmailNaoVerificado()
    {
        // Arrange
        var conta = CriarConta();
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);
        _tokenRepo.Setup(r => r.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.EmailVerificacao))
            .Returns(Task.CompletedTask);

        // Act
        await _service.ReenviarVerificacaoEmailAsync(conta.Id);

        // Assert
        _tokenRepo.Verify(r => r.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.EmailVerificacao), Times.Once);
        _tokenRepo.Verify(r => r.Add(It.IsAny<TokenVerificacao>()), Times.Once);
        _tokenRepo.Verify(r => r.CommitAsync(), Times.Once);
        _emailService.Verify(e => e.EnviarVerificacaoEmailAsync(conta.Email, conta.NomeEmpresa, It.IsAny<string>()), Times.Once);
    }

    [Fact(DisplayName = "ReenviarVerificacaoEmailAsync - Deve falhar quando conta não encontrada")]
    public async Task ReenviarVerificacaoEmailAsync_DeveFalhar_QuandoContaNaoEncontrada()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        _contaRepo.Setup(r => r.GetByIdAsync(empresaId)).ReturnsAsync((Conta?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.ReenviarVerificacaoEmailAsync(empresaId));

        _emailService.Verify(
            e => e.EnviarVerificacaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReenviarVerificacaoEmailAsync - Deve falhar quando e-mail já foi verificado")]
    public async Task ReenviarVerificacaoEmailAsync_DeveFalhar_QuandoEmailJaVerificado()
    {
        // Arrange
        var conta = CriarConta();
        conta.MarcarEmailComoVerificado();
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.ReenviarVerificacaoEmailAsync(conta.Id));

        Assert.Contains("já foi verificado", ex.Message);
        _emailService.Verify(
            e => e.EnviarVerificacaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReenviarVerificacaoEmailAsync - Deve invalidar tokens anteriores antes de adicionar novo")]
    public async Task ReenviarVerificacaoEmailAsync_DeveInvalidarTokensAnteriores_AntesDeAdicionarNovo()
    {
        // Arrange
        var conta = CriarConta();
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);

        var ordemDeChamadas = new List<string>();
        _tokenRepo.Setup(r => r.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.EmailVerificacao))
            .Callback(() => ordemDeChamadas.Add("invalidar"))
            .Returns(Task.CompletedTask);
        _tokenRepo.Setup(r => r.Add(It.IsAny<TokenVerificacao>()))
            .Callback<TokenVerificacao>(_ => ordemDeChamadas.Add("add"));

        // Act
        await _service.ReenviarVerificacaoEmailAsync(conta.Id);

        // Assert - invalidar deve ocorrer antes de Add
        Assert.Equal(new[] { "invalidar", "add" }, ordemDeChamadas);
    }

    [Fact(DisplayName = "ReenviarVerificacaoEmailAsync - Deve construir link com FrontendBaseUrl da configuração")]
    public async Task ReenviarVerificacaoEmailAsync_DeveConstruirLink_ComFrontendBaseUrl()
    {
        // Arrange
        const string frontendUrl = "https://meuapp.com.br";
        _configuration.Setup(c => c["App:FrontendBaseUrl"]).Returns(frontendUrl);

        var conta = CriarConta();
        _contaRepo.Setup(r => r.GetByIdAsync(conta.Id)).ReturnsAsync(conta);
        _tokenRepo.Setup(r => r.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.EmailVerificacao))
            .Returns(Task.CompletedTask);

        string? linkCapturado = null;
        _emailService.Setup(e => e.EnviarVerificacaoEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Callback<string, string, string>((_, _, link) => linkCapturado = link)
            .Returns(Task.CompletedTask);

        // Act
        await _service.ReenviarVerificacaoEmailAsync(conta.Id);

        // Assert
        Assert.NotNull(linkCapturado);
        Assert.StartsWith(frontendUrl, linkCapturado);
        Assert.Contains("verificar-email", linkCapturado);
        Assert.Contains("token=", linkCapturado);
    }
}
