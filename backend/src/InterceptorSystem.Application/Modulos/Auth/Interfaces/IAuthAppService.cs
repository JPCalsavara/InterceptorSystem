using InterceptorSystem.Application.Modulos.Auth.DTOs;

namespace InterceptorSystem.Application.Modulos.Auth.Interfaces;

public interface IAuthAppService
{
    Task<AuthResultDtoOutput> RegistrarAsync(RegistrarContaDtoInput input);
    Task<AuthResultDtoOutput> LoginAsync(LoginDtoInput input);
    Task<ContaPerfilDtoOutput> GetContaAsync(Guid empresaId);
    Task<ContaPerfilDtoOutput> AtualizarContaAsync(Guid empresaId, AtualizarContaDtoInput input);
    Task ConfirmarEmailAsync(ConfirmarTokenDtoInput input);
    Task ReenviarVerificacaoEmailAsync(Guid empresaId);
    Task SolicitarResetSenhaAsync(SolicitarResetSenhaDtoInput input);
    Task ConfirmarResetSenhaAsync(ConfirmarResetSenhaDtoInput input);
    Task SolicitarAlteracaoEmailAsync(Guid empresaId, SolicitarAlteracaoEmailDtoInput input);
    Task ConfirmarAlteracaoEmailAsync(ConfirmarTokenDtoInput input);
}
