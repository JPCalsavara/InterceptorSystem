using System.Security.Cryptography;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Auth.DTOs;
using InterceptorSystem.Application.Modulos.Auth.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterceptorSystem.Application.Modulos.Auth.Services;

public class AuthAppService : IAuthAppService
{
    private readonly IContaRepository _contaRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly ITokenVerificacaoRepository _tokenRepository;
    private readonly IConfiguration _configuration;
    private readonly IWhatsappMessageSender _whatsappSender;

    public AuthAppService(
        IContaRepository contaRepository,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        ITokenVerificacaoRepository tokenRepository,
        IConfiguration configuration,
        IWhatsappMessageSender whatsappSender)
    {
        _contaRepository = contaRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _tokenRepository = tokenRepository;
        _configuration = configuration;
        _whatsappSender = whatsappSender;
    }

    public async Task<AuthResultDtoOutput> RegistrarAsync(RegistrarContaDtoInput input)
    {
        ValidarPoliticaSenha(input.Senha);
        
        var emailExistente = await _contaRepository.GetByEmailAsync(input.Email);
        if (emailExistente != null)
            throw new InvalidOperationException("Já existe uma conta com este e-mail.");

        var senhaHash = _passwordHasher.Hash(input.Senha);
        var conta = new Conta(input.Email, senhaHash, input.NomeEmpresa, input.Cnpj);

        _contaRepository.Add(conta);
        await _contaRepository.CommitAsync();

        var tokenStr = GerarTokenSeguro();
        var tokenVerificacao = new TokenVerificacao(conta.Id, tokenStr, TipoTokenVerificacao.EmailVerificacao, DateTime.UtcNow.AddHours(24));
        _tokenRepository.Add(tokenVerificacao);
        await _tokenRepository.CommitAsync();

        var link = ConstruirLink("verificar-email", tokenStr);
        await _emailService.EnviarVerificacaoEmailAsync(conta.Email, conta.NomeEmpresa, link);

        var jwtToken = _jwtTokenService.GerarToken(conta);
        return new AuthResultDtoOutput(conta.Id, conta.NomeEmpresa, conta.Email, conta.Plano, jwtToken, conta.EmailVerificado);
    }

    public async Task<AuthResultDtoOutput> LoginAsync(LoginDtoInput input)
    {
        var conta = await _contaRepository.GetByEmailAsync(input.Email);
        if (conta == null || !_passwordHasher.Verify(input.Senha, conta.SenhaHash))
            throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        if (!conta.Ativo)
            throw new UnauthorizedAccessException("Esta conta está desativada.");

        var token = _jwtTokenService.GerarToken(conta);
        return new AuthResultDtoOutput(conta.Id, conta.NomeEmpresa, conta.Email, conta.Plano, token, conta.EmailVerificado);
    }

    public async Task<ContaPerfilDtoOutput> GetContaAsync(Guid empresaId)
    {
        var conta = await _contaRepository.GetByIdAsync(empresaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        return new ContaPerfilDtoOutput(
            conta.Id,
            conta.NomeEmpresa,
            conta.Email,
            conta.Cnpj,
            conta.Plano.ToString(),
            conta.CreatedAt
        );
    }

    public async Task<ContaPerfilDtoOutput> AtualizarContaAsync(Guid empresaId, AtualizarContaDtoInput input)
    {
        var conta = await _contaRepository.GetByIdAsync(empresaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        if (!string.IsNullOrWhiteSpace(input.NomeEmpresa))
            conta.AtualizarNomeEmpresa(input.NomeEmpresa);

        if (!string.IsNullOrWhiteSpace(input.Email))
        {
            var emailExistente = await _contaRepository.GetByEmailAsync(input.Email);
            if (emailExistente != null && emailExistente.Id != conta.Id)
                throw new InvalidOperationException("Este e-mail já está em uso.");
            conta.AtualizarEmail(input.Email);
        }

        if (!string.IsNullOrWhiteSpace(input.NovaSenha))
        {
            if (string.IsNullOrWhiteSpace(input.SenhaAtual))
                throw new InvalidOperationException("Informe a senha atual para alterar a senha.");
            if (!_passwordHasher.Verify(input.SenhaAtual, conta.SenhaHash))
                throw new UnauthorizedAccessException("Senha atual incorreta.");
            conta.AtualizarSenha(_passwordHasher.Hash(input.NovaSenha));
        }

        await _contaRepository.CommitAsync();

        return new ContaPerfilDtoOutput(
            conta.Id,
            conta.NomeEmpresa,
            conta.Email,
            conta.Cnpj,
            conta.Plano.ToString(),
            conta.CreatedAt
        );
    }

    public async Task ConfirmarEmailAsync(ConfirmarTokenDtoInput input)
    {
        var tokenVerificacao = await _tokenRepository.GetByTokenAsync(input.Token, TipoTokenVerificacao.EmailVerificacao)
            ?? throw new InvalidOperationException("Token inválido ou expirado.");

        if (!tokenVerificacao.EstaValido())
            throw new InvalidOperationException("Token inválido ou expirado.");

        var conta = await _contaRepository.GetByIdAsync(tokenVerificacao.ContaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        conta.MarcarEmailComoVerificado();
        tokenVerificacao.Consumir();

        await _contaRepository.CommitAsync();
        await _tokenRepository.CommitAsync();
    }

    public async Task ReenviarVerificacaoEmailAsync(Guid empresaId)
    {
        var conta = await _contaRepository.GetByIdAsync(empresaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        if (conta.EmailVerificado)
            throw new InvalidOperationException("O e-mail já foi verificado.");

        await _tokenRepository.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.EmailVerificacao);

        var tokenStr = GerarTokenSeguro();
        var tokenVerificacao = new TokenVerificacao(conta.Id, tokenStr, TipoTokenVerificacao.EmailVerificacao, DateTime.UtcNow.AddHours(24));
        _tokenRepository.Add(tokenVerificacao);
        await _tokenRepository.CommitAsync();

        var link = ConstruirLink("verificar-email", tokenStr);
        await _emailService.EnviarVerificacaoEmailAsync(conta.Email, conta.NomeEmpresa, link);
    }

    public async Task SolicitarResetSenhaAsync(SolicitarResetSenhaDtoInput input)
    {
        var conta = await _contaRepository.GetByEmailAsync(input.Email);
        if (conta == null)
            return; // Anti-enumeração: retorna silenciosamente

        await _tokenRepository.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.AlteracaoSenha);

        var tokenStr = GerarTokenSeguro();
        var tokenVerificacao = new TokenVerificacao(conta.Id, tokenStr, TipoTokenVerificacao.AlteracaoSenha, DateTime.UtcNow.AddHours(1));
        _tokenRepository.Add(tokenVerificacao);
        await _tokenRepository.CommitAsync();

        var link = ConstruirLink("nova-senha", tokenStr);
        await _emailService.EnviarResetSenhaAsync(conta.Email, conta.NomeEmpresa, link);
    }

    public async Task ConfirmarResetSenhaAsync(ConfirmarResetSenhaDtoInput input)
    {
        ValidarPoliticaSenha(input.NovaSenha);
        
        var tokenVerificacao = await _tokenRepository.GetByTokenAsync(input.Token, TipoTokenVerificacao.AlteracaoSenha)
            ?? throw new InvalidOperationException("Token inválido ou expirado.");

        if (!tokenVerificacao.EstaValido())
            throw new InvalidOperationException("Token inválido ou expirado.");

        var conta = await _contaRepository.GetByIdAsync(tokenVerificacao.ContaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        conta.AlterarSenha(_passwordHasher.Hash(input.NovaSenha));
        tokenVerificacao.Consumir();

        await _contaRepository.CommitAsync();
        await _tokenRepository.CommitAsync();
    }

    public async Task SolicitarAlteracaoEmailAsync(Guid empresaId, SolicitarAlteracaoEmailDtoInput input)
    {
        var conta = await _contaRepository.GetByIdAsync(empresaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        var emailExistente = await _contaRepository.GetByEmailAsync(input.NovoEmail);
        if (emailExistente != null && emailExistente.Id != conta.Id)
            throw new InvalidOperationException("Este e-mail já está em uso.");

        await _tokenRepository.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.AlteracaoEmail);

        conta.IniciarAlteracaoEmail(input.NovoEmail);
        await _contaRepository.CommitAsync();

        var tokenStr = GerarTokenSeguro();
        var tokenVerificacao = new TokenVerificacao(conta.Id, tokenStr, TipoTokenVerificacao.AlteracaoEmail, DateTime.UtcNow.AddHours(1));
        _tokenRepository.Add(tokenVerificacao);
        await _tokenRepository.CommitAsync();

        var link = ConstruirLink("conta/confirmar-email", tokenStr);
        await _emailService.EnviarConfirmacaoAlteracaoEmailAsync(input.NovoEmail, conta.NomeEmpresa, link);
    }

    public async Task ConfirmarAlteracaoEmailAsync(ConfirmarTokenDtoInput input)
    {
        var tokenVerificacao = await _tokenRepository.GetByTokenAsync(input.Token, TipoTokenVerificacao.AlteracaoEmail)
            ?? throw new InvalidOperationException("Token inválido ou expirado.");

        if (!tokenVerificacao.EstaValido())
            throw new InvalidOperationException("Token inválido ou expirado.");

        var conta = await _contaRepository.GetByIdAsync(tokenVerificacao.ContaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        conta.ConfirmarAlteracaoEmail();
        tokenVerificacao.Consumir();

        await _contaRepository.CommitAsync();
        await _tokenRepository.CommitAsync();
    }

    public async Task CadastrarTelefoneAsync(Guid contaId, string telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone))
            throw new InvalidOperationException("O telefone é obrigatório.");

        var telefoneNormalizado = telefone.Trim();

        var contaExistente = await _contaRepository.GetByTelefoneVerificadoAsync(telefoneNormalizado);
        if (contaExistente != null && contaExistente.Id != contaId)
            throw new InvalidOperationException("Este telefone já está em uso por outra conta.");

        var conta = await _contaRepository.GetByIdAsync(contaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        conta.IniciarCadastroTelefone(telefoneNormalizado);

        await _tokenRepository.InvalidarTokensAnterioresAsync(conta.Id, TipoTokenVerificacao.VerificacaoTelefone);

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var tokenVerificacao = new TokenVerificacao(
            conta.Id, otp, TipoTokenVerificacao.VerificacaoTelefone,
            DateTime.UtcNow.AddMinutes(10));

        _tokenRepository.Add(tokenVerificacao);
        await _contaRepository.CommitAsync();
        await _tokenRepository.CommitAsync();

        await _whatsappSender.EnviarTextoAsync(
            telefoneNormalizado,
            $"Seu código de verificação do Interceptor System é: *{otp}*\nEle expira em 10 minutos.");
    }

    public async Task ConfirmarTelefoneAsync(string token)
    {
        var tokenVerificacao = await _tokenRepository.GetByTokenAsync(token, TipoTokenVerificacao.VerificacaoTelefone)
            ?? throw new InvalidOperationException("Código inválido ou expirado.");

        if (!tokenVerificacao.EstaValido())
            throw new InvalidOperationException("Código inválido ou expirado.");

        var conta = await _contaRepository.GetByIdAsync(tokenVerificacao.ContaId)
            ?? throw new KeyNotFoundException("Conta não encontrada.");

        conta.MarcarTelefoneComoVerificado();
        tokenVerificacao.Consumir();

        await _contaRepository.CommitAsync();
        await _tokenRepository.CommitAsync();
    }

    private static string GerarTokenSeguro()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    /// <summary>
    /// SEC-7: Política de senha — mínimo 8 caracteres, 1 maiúscula, 1 dígito.
    /// </summary>
    private static void ValidarPoliticaSenha(string senha)
    {
        if (string.IsNullOrWhiteSpace(senha) || senha.Length < 8)
            throw new InvalidOperationException("A senha deve ter pelo menos 8 caracteres.");
        if (!senha.Any(char.IsUpper))
            throw new InvalidOperationException("A senha deve conter pelo menos uma letra maiúscula.");
        if (!senha.Any(char.IsDigit))
            throw new InvalidOperationException("A senha deve conter pelo menos um número.");
    }

    private string ConstruirLink(string rota, string token)
    {
        var baseUrl = _configuration["App:FrontendBaseUrl"] ?? "http://localhost:4200";
        return $"{baseUrl}/{rota}?token={token}";
    }
}
