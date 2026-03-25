namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;

/// <summary>
/// Ponto de entrada do bot do WhatsApp. Recebe uma mensagem de texto de um número
/// e orquestra a máquina de estados de substituição de diária.
/// </summary>
public interface IWhatsappBotService
{
    Task ProcessarMensagemAsync(string telefone, string texto, CancellationToken ct = default);
}
