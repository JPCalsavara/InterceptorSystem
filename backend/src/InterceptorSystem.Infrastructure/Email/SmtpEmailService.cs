using InterceptorSystem.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace InterceptorSystem.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
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

    private async Task EnviarAsync(string destinatario, string assunto, string corpoHtml)
    {
        var host = _configuration["Smtp:Host"] ?? "localhost";
        var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var username = _configuration["Smtp:Username"] ?? "";
        var password = _configuration["Smtp:Password"] ?? "";
        var fromAddress = _configuration["Smtp:FromAddress"] ?? "noreply@interceptorsystem.com";
        var fromName = _configuration["Smtp:FromName"] ?? "Interceptor System";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromAddress));
        message.To.Add(MailboxAddress.Parse(destinatario));
        message.Subject = assunto;

        var builder = new BodyBuilder { HtmlBody = corpoHtml };
        message.Body = builder.ToMessageBody();

        var secureSocketRaw = _configuration["Smtp:SecureSocket"] ?? "StartTls";
        var secureSocket = Enum.TryParse<SecureSocketOptions>(secureSocketRaw, out var parsed)
            ? parsed
            : SecureSocketOptions.StartTls;

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, secureSocket);
        if (!string.IsNullOrEmpty(username))
            await client.AuthenticateAsync(username, password);
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
