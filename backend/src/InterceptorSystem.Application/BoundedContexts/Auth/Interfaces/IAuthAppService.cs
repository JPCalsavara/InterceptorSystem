using InterceptorSystem.Application.BoundedContexts.Auth.DTOs;

namespace InterceptorSystem.Application.BoundedContexts.Auth.Interfaces;

public interface IAuthAppService
{
    Task<AuthResultDtoOutput> RegistrarAsync(RegistrarContaDtoInput input);
    Task<AuthResultDtoOutput> LoginAsync(LoginDtoInput input);
    Task<AuthResultDtoOutput> LoginComGoogleAsync(LoginGoogleDtoInput input);
    Task<ContaPerfilDtoOutput> GetContaAsync(Guid empresaId);
    Task<ContaPerfilDtoOutput> AtualizarContaAsync(Guid empresaId, AtualizarContaDtoInput input);
    Task ConfirmarEmailAsync(ConfirmarTokenDtoInput input);
    Task ReenviarVerificacaoEmailAsync(Guid empresaId);
    Task SolicitarResetSenhaAsync(SolicitarResetSenhaDtoInput input);
    Task ConfirmarResetSenhaAsync(ConfirmarResetSenhaDtoInput input);
    Task SolicitarAlteracaoEmailAsync(Guid empresaId, SolicitarAlteracaoEmailDtoInput input);
    Task ConfirmarAlteracaoEmailAsync(ConfirmarTokenDtoInput input);

    /// <summary>Registra um telefone na conta e envia OTP de 6 dígitos via WhatsApp para verificação.</summary>
    Task CadastrarTelefoneAsync(Guid contaId, string telefone);

    /// <summary>Confirma o telefone via token OTP enviado pelo bot do WhatsApp.</summary>
    Task ConfirmarTelefoneAsync(string token);
}
