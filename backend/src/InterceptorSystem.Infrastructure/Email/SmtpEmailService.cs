using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Common.Settings;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace InterceptorSystem.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly SmtpSettings _settings;

    public SmtpEmailService(IOptions<SmtpSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task EnviarVerificacaoEmailAsync(string destinatario, string nomeEmpresa, string link)
    {
        var assunto = "Verifique seu e-mail — Interceptor System";
        var corpo = CriarHtmlComBotao(
            nomeEmpresa,
            "Verificação de E-mail",
            $"Olá, <strong>{nomeEmpresa}</strong>! Para confirmar seu e-mail, clique no botão abaixo.",
            "Verificar E-mail",
            link
        );

        await EnviarAsync(destinatario, assunto, corpo);
    }

    public async Task EnviarResetSenhaAsync(string destinatario, string nomeEmpresa, string link)
    {
        var assunto = "Redefinição de senha — Interceptor System";
        var corpo = CriarHtmlComBotao(
            nomeEmpresa,
            "Redefinir Senha",
            $"Olá, <strong>{nomeEmpresa}</strong>! Recebemos uma solicitação para redefinir sua senha. O link expira em 1 hora.",
            "Redefinir Senha",
            link
        );

        await EnviarAsync(destinatario, assunto, corpo);
    }

    public async Task EnviarConfirmacaoAlteracaoEmailAsync(string destinatario, string nomeEmpresa, string link)
    {
        var assunto = "Confirme seu novo e-mail — Interceptor System";
        var corpo = CriarHtmlComBotao(
            nomeEmpresa,
            "Confirmar Novo E-mail",
            $"Olá, <strong>{nomeEmpresa}</strong>! Para confirmar seu novo endereço de e-mail, clique no botão abaixo. O link expira em 1 hora.",
            "Confirmar E-mail",
            link
        );

        await EnviarAsync(destinatario, assunto, corpo);
    }

    public async Task EnviarContatoAsync(string nome, string cidade, string estado, string emailRemetente, string descricao)
    {
        var assunto = $"[Site] Contato de {nome} — {cidade}/{estado.ToUpper()}";
        var corpo = $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #1976d2; margin-top: 0;">Novo contato pelo site</h2>
                <table style="width:100%; border-collapse:collapse; font-size:15px; color:#333;">
                  <tr><td style="padding:6px 0;"><strong>Nome:</strong></td><td>{nome}</td></tr>
                  <tr><td style="padding:6px 0;"><strong>Cidade/Estado:</strong></td><td>{cidade} / {estado.ToUpper()}</td></tr>
                  <tr><td style="padding:6px 0;"><strong>E-mail:</strong></td><td><a href="mailto:{emailRemetente}">{emailRemetente}</a></td></tr>
                </table>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="font-size:15px; color:#333;"><strong>Mensagem:</strong></p>
                <p style="font-size:15px; color:#555; white-space:pre-wrap;">{descricao}</p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#999; font-size:12px;">Interceptor System — Gestão e Facilities em Associações Condominiais</p>
              </div>
            </body>
            </html>
            """;

        await EnviarAsync("interceptor.gerencia@gmail.com", assunto, corpo);
    }

    private async Task EnviarAsync(string destinatario, string assunto, string corpoHtml)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(destinatario));
        message.Subject = assunto;

        var builder = new BodyBuilder { HtmlBody = corpoHtml };
        message.Body = builder.ToMessageBody();

        var secureSocket = Enum.TryParse<SecureSocketOptions>(_settings.SecureSocket, out var parsed)
            ? parsed
            : SecureSocketOptions.StartTls;

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.Host, _settings.Port, secureSocket);
        if (!string.IsNullOrEmpty(_settings.Username))
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string CriarHtmlComBotao(string nomeEmpresa, string titulo, string mensagem, string textoBotao, string link)
    {
        return $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #1976d2; margin-top: 0;">{titulo}</h2>
                <p style="color: #333; font-size: 16px;">{mensagem}</p>
                <a href="{link}" style="display: inline-block; margin: 20px 0; padding: 14px 28px; background: #1976d2; color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">{textoBotao}</a>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Se você não solicitou esta ação, ignore este e-mail.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Interceptor System — Gestão de Segurança</p>
              </div>
            </body>
            </html>
            """;
    }
}
