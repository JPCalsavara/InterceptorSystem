using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Domain.Modulos.Auth.Enums;

namespace InterceptorSystem.Tests.Integration.Auth;

public class AuthControllerIntegrationTests : IClassFixture<AuthWebApplicationFactory>
{
    private readonly AuthWebApplicationFactory _factory;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public AuthControllerIntegrationTests(AuthWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // --- POST /api/auth/registrar ---

    [Fact(DisplayName = "Registrar - Deve retornar 201 Created com token e dados da conta")]
    public async Task Registrar_DeveRetornar201_QuandoDadosValidos()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var input = new RegistrarContaDtoInput("novo@empresa.com", "senha123456", "Empresa Nova");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/registrar", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.NotNull(result);
        Assert.Equal("novo@empresa.com", result!.Email);
        Assert.Equal("Empresa Nova", result.NomeEmpresa);
        Assert.Equal(PlanoAssinatura.FREE, result.Plano);
        Assert.NotEmpty(result.Token);
        Assert.NotEqual(Guid.Empty, result.EmpresaId);
    }

    [Fact(DisplayName = "Registrar - Deve retornar 201 sem CNPJ quando CNPJ não é informado")]
    public async Task Registrar_DeveRetornar201_SemCnpj()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var input = new RegistrarContaDtoInput("semcnpj@empresa.com", "senha123456", "Empresa Sem CNPJ");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/registrar", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.NotNull(result);
        Assert.Equal("semcnpj@empresa.com", result!.Email);
    }

    [Fact(DisplayName = "Registrar - Deve retornar 409 Conflict quando e-mail já cadastrado")]
    public async Task Registrar_DeveRetornar409_QuandoEmailDuplicado()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var input = new RegistrarContaDtoInput("duplicado@empresa.com", "senha123456", "Empresa A");

        // Primeiro cadastro
        var primeiraResposta = await client.PostAsJsonAsync("/api/auth/registrar", input);
        primeiraResposta.EnsureSuccessStatusCode();

        // Act - Segundo cadastro com mesmo e-mail
        var segundaResposta = await client.PostAsJsonAsync("/api/auth/registrar", input);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, segundaResposta.StatusCode);

        var body = await segundaResposta.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.NotNull(body?.Mensagem);
    }

    [Fact(DisplayName = "Registrar - Deve normalizar e-mail para lowercase")]
    public async Task Registrar_DeveNormalizarEmail_ParaLowercase()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var input = new RegistrarContaDtoInput("MAIUSCULO@EMPRESA.COM", "senha123456", "Empresa Maiúsculo");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/registrar", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.Equal("maiusculo@empresa.com", result!.Email);
    }

    // --- POST /api/auth/login ---

    [Fact(DisplayName = "Login - Deve retornar 200 OK com token quando credenciais válidas")]
    public async Task Login_DeveRetornar200_QuandoCredenciaisValidas()
    {
        // Arrange - registra conta antes
        var client = _factory.CreateUnauthenticatedClient();
        var registrar = new RegistrarContaDtoInput("login.valido@empresa.com", "senha123456", "Empresa Login");
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar", registrar);
        regResponse.EnsureSuccessStatusCode();

        var loginInput = new LoginDtoInput("login.valido@empresa.com", "senha123456");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", loginInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.NotNull(result);
        Assert.Equal("login.valido@empresa.com", result!.Email);
        Assert.Equal("Empresa Login", result.NomeEmpresa);
        Assert.NotEmpty(result.Token);
        Assert.NotEqual(Guid.Empty, result.EmpresaId);
    }

    [Fact(DisplayName = "Login - Deve retornar 401 quando e-mail não existe")]
    public async Task Login_DeveRetornar401_QuandoEmailNaoExiste()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var input = new LoginDtoInput("naoexiste@empresa.com", "senha123456");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", input);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.NotNull(body?.Mensagem);
    }

    [Fact(DisplayName = "Login - Deve retornar 401 quando senha está incorreta")]
    public async Task Login_DeveRetornar401_QuandoSenhaIncorreta()
    {
        // Arrange - registra conta antes
        var client = _factory.CreateUnauthenticatedClient();
        var registrar = new RegistrarContaDtoInput("senha.errada@empresa.com", "senha123456", "Empresa Senha");
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar", registrar);
        regResponse.EnsureSuccessStatusCode();

        var loginInput = new LoginDtoInput("senha.errada@empresa.com", "senhaerrada999");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", loginInput);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact(DisplayName = "Login - Deve aceitar e-mail em qualquer caixa (case-insensitive)")]
    public async Task Login_DeveAceitarEmail_EmQualquerCaixa()
    {
        // Arrange - registra com lowercase
        var client = _factory.CreateUnauthenticatedClient();
        var registrar = new RegistrarContaDtoInput("caixa.mista@empresa.com", "senha123456", "Empresa Case");
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar", registrar);
        regResponse.EnsureSuccessStatusCode();

        // Act - login com uppercase
        var loginInput = new LoginDtoInput("CAIXA.MISTA@EMPRESA.COM", "senha123456");
        var response = await client.PostAsJsonAsync("/api/auth/login", loginInput);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // --- Fluxo end-to-end ---

    [Fact(DisplayName = "E2E - Deve acessar rota protegida com token JWT obtido no registro")]
    public async Task E2E_DeveAcessarRotaProtegida_ComTokenDoRegistro()
    {
        // Arrange - registra e obtém token real
        var (client, auth) = await _factory.CreateAuthenticatedClientAsync(
            email: "e2e.registro@empresa.com",
            senha: "senha123456",
            nomeEmpresa: "Empresa E2E Registro");

        // Act - acessa rota protegida com o JWT
        var response = await client.GetAsync("/api/condominios");

        // Assert - deve retornar 200 (não 401)
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "E2E - Deve acessar rota protegida com token JWT obtido no login")]
    public async Task E2E_DeveAcessarRotaProtegida_ComTokenDoLogin()
    {
        // Arrange - registra manualmente
        var client = _factory.CreateUnauthenticatedClient();
        var registrar = new RegistrarContaDtoInput("e2e.login@empresa.com", "senha123456", "Empresa E2E Login");
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar", registrar);
        regResponse.EnsureSuccessStatusCode();

        // Faz login para obter token fresco
        var loginInput = new LoginDtoInput("e2e.login@empresa.com", "senha123456");
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginInput);
        loginResponse.EnsureSuccessStatusCode();

        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);

        // Anexa o token ao client
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth!.Token);

        // Act - acessa rota protegida
        var response = await client.GetAsync("/api/condominios");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact(DisplayName = "E2E - Deve retornar 401 ao acessar rota protegida sem token")]
    public async Task E2E_DeveRetornar401_SemToken()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();

        // Act - acessa rota protegida sem JWT
        var response = await client.GetAsync("/api/condominios");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // --- POST /api/auth/email/confirmar ---

    [Fact(DisplayName = "ConfirmarEmail - Deve retornar 200 e verificar e-mail quando token válido")]
    public async Task ConfirmarEmail_DeveRetornar200_QuandoTokenValido()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar",
            new RegistrarContaDtoInput("confirmar.valido@empresa.com", "senha123456", "Empresa Confirmar"));
        regResponse.EnsureSuccessStatusCode();

        var auth = await regResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.False(auth!.EmailVerificado);

        var tokenStr = _factory.ObterTokenVerificacao(auth.EmpresaId);
        Assert.NotNull(tokenStr);

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput(tokenStr!));

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.Equal("E-mail verificado com sucesso.", body!.Mensagem);
    }

    [Fact(DisplayName = "ConfirmarEmail - Deve retornar 400 quando token é inválido")]
    public async Task ConfirmarEmail_DeveRetornar400_QuandoTokenInvalido()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput("token-que-nao-existe"));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.NotNull(body?.Mensagem);
    }

    [Fact(DisplayName = "ConfirmarEmail - Deve retornar 400 quando token já foi usado")]
    public async Task ConfirmarEmail_DeveRetornar400_QuandoTokenJaUsado()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar",
            new RegistrarContaDtoInput("token.ja.usado@empresa.com", "senha123456", "Empresa Token Usado"));
        regResponse.EnsureSuccessStatusCode();

        var auth = await regResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        var tokenStr = _factory.ObterTokenVerificacao(auth!.EmpresaId);

        // Primeira confirmação deve ter sucesso
        var primeiraResposta = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput(tokenStr!));
        primeiraResposta.EnsureSuccessStatusCode();

        // Act - segunda confirmação com o mesmo token
        var response = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput(tokenStr!));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "ConfirmarEmail - Login subsequente deve retornar EmailVerificado como true")]
    public async Task ConfirmarEmail_LoginSubsequenteDeveRefletirEmailVerificado()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();
        const string email = "login.pos.confirmacao@empresa.com";
        const string senha = "senha123456";

        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar",
            new RegistrarContaDtoInput(email, senha, "Empresa Login Pós Confirmação"));
        regResponse.EnsureSuccessStatusCode();

        var auth = await regResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        var tokenStr = _factory.ObterTokenVerificacao(auth!.EmpresaId);

        await client.PostAsJsonAsync("/api/auth/email/confirmar", new ConfirmarTokenDtoInput(tokenStr!));

        // Act - faz login após confirmação
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginDtoInput(email, senha));

        // Assert
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loginAuth = await loginResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.True(loginAuth!.EmailVerificado);
    }

    // --- POST /api/auth/email/reenviar ---

    [Fact(DisplayName = "ReenviarEmail - Deve retornar 200 quando autenticado e e-mail não verificado")]
    public async Task ReenviarEmail_DeveRetornar200_QuandoAutenticadoEEmailNaoVerificado()
    {
        // Arrange
        var (client, _) = await _factory.CreateAuthenticatedClientAsync(
            email: "reenviar.ok@empresa.com",
            senha: "senha123456",
            nomeEmpresa: "Empresa Reenviar");

        // Act
        var response = await client.PostAsync("/api/auth/email/reenviar", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.Equal("E-mail de verificação reenviado.", body!.Mensagem);
    }

    [Fact(DisplayName = "ReenviarEmail - Deve retornar 401 quando não autenticado")]
    public async Task ReenviarEmail_DeveRetornar401_QuandoNaoAutenticado()
    {
        // Arrange
        var client = _factory.CreateUnauthenticatedClient();

        // Act
        var response = await client.PostAsync("/api/auth/email/reenviar", null);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact(DisplayName = "ReenviarEmail - Deve retornar 400 quando e-mail já foi verificado")]
    public async Task ReenviarEmail_DeveRetornar400_QuandoEmailJaVerificado()
    {
        // Arrange - registra, confirma e-mail, e então tenta reenviar
        var (client, auth) = await _factory.CreateAuthenticatedClientAsync(
            email: "ja.verificado.reenviar@empresa.com",
            senha: "senha123456",
            nomeEmpresa: "Empresa Já Verificada");

        var tokenStr = _factory.ObterTokenVerificacao(auth.EmpresaId);
        var confirmarResponse = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput(tokenStr!));
        confirmarResponse.EnsureSuccessStatusCode();

        // Act - tenta reenviar depois do e-mail já estar verificado
        var response = await client.PostAsync("/api/auth/email/reenviar", null);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErroDto>(JsonOptions);
        Assert.NotNull(body?.Mensagem);
    }

    // --- E2E fluxo completo de verificação de e-mail ---

    [Fact(DisplayName = "E2E - Fluxo completo: registrar → confirmar e-mail → login verificado → reenvio bloqueado")]
    public async Task E2E_FluxoCompletoVerificacaoEmail()
    {
        var client = _factory.CreateUnauthenticatedClient();
        const string email = "e2e.verificacao@empresa.com";
        const string senha = "senha123456";

        // 1. Registrar — EmailVerificado deve ser false
        var regResponse = await client.PostAsJsonAsync("/api/auth/registrar",
            new RegistrarContaDtoInput(email, senha, "Empresa E2E Verificação"));
        regResponse.EnsureSuccessStatusCode();

        var authReg = await regResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.False(authReg!.EmailVerificado);

        // 2. Obter token do banco de testes (simula clique no link do e-mail)
        var tokenStr = _factory.ObterTokenVerificacao(authReg.EmpresaId);
        Assert.NotNull(tokenStr);

        // 3. Confirmar e-mail
        var confirmarResponse = await client.PostAsJsonAsync("/api/auth/email/confirmar",
            new ConfirmarTokenDtoInput(tokenStr!));
        Assert.Equal(HttpStatusCode.OK, confirmarResponse.StatusCode);

        // 4. Login pós-verificação deve refletir EmailVerificado = true
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login",
            new LoginDtoInput(email, senha));
        loginResponse.EnsureSuccessStatusCode();

        var authLogin = await loginResponse.Content.ReadFromJsonAsync<AuthResultDtoOutput>(JsonOptions);
        Assert.True(authLogin!.EmailVerificado);

        // 5. Reenvio deve retornar 400 — e-mail já verificado
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authLogin.Token);
        var reenviarResponse = await client.PostAsync("/api/auth/email/reenviar", null);
        Assert.Equal(HttpStatusCode.BadRequest, reenviarResponse.StatusCode);
    }

    /// <summary>DTO auxiliar para deserializar respostas de sucesso e erro.</summary>
    private record ErroDto([property: JsonPropertyName("mensagem")] string? Mensagem);
}
