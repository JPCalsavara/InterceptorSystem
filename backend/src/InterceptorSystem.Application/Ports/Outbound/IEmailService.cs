namespace InterceptorSystem.Application.Common.Interfaces;

public interface IEmailService
{
    Task EnviarVerificacaoEmailAsync(string destinatario, string nomeEmpresa, string link);
    Task EnviarResetSenhaAsync(string destinatario, string nomeEmpresa, string link);
    Task EnviarConfirmacaoAlteracaoEmailAsync(string destinatario, string nomeEmpresa, string link);
    Task EnviarContatoAsync(string nome, string cidade, string estado, string emailRemetente, string descricao);
}
