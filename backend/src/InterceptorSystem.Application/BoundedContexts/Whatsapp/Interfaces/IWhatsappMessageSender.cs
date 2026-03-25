namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;

/// <summary>
/// Abstração do canal de envio de mensagens WhatsApp.
/// Permite trocar Meta Cloud API por Twilio sem alterar a lógica de negócio.
/// </summary>
public interface IWhatsappMessageSender
{
    Task EnviarTextoAsync(string telefoneDestino, string mensagem, CancellationToken ct = default);
}
