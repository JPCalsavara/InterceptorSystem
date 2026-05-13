using InterceptorSystem.Api.Controllers;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace InterceptorSystem.Tests.Integration.Whatsapp;

/// <summary>
/// Testes de integração para WhatsappWebhookController
/// Testa a recepção, validação e processamento de webhooks da Meta Cloud API
/// </summary>
public class WhatsappWebhookControllerIntegrationTests
{
    private readonly Mock<IWhatsappBotService> _botService;
    private readonly Mock<IConfiguration> _config;
    private readonly WhatsappWebhookController _controller;
    private readonly string _validVerifyToken = "test_verify_token_12345";

    public WhatsappWebhookControllerIntegrationTests()
    {
        _botService = new Mock<IWhatsappBotService>();
        _config = new Mock<IConfiguration>();
        _config.Setup(c => c["Meta:WebhookVerifyToken"]).Returns(_validVerifyToken);
        
        _controller = new WhatsappWebhookController(_botService.Object, _config.Object);
    }

    // ==================== WEBHOOK VERIFICATION TESTS ====================

    [Fact(DisplayName = "VerificarWebhook - Sucesso com token válido e modo subscribe")]
    public void VerificarWebhook_ComTokenValido_DeveRetornarChallenge()
    {
        // Arrange
        var challenge = "test_challenge_string_abc123";
        var mode = "subscribe";
        var token = _validVerifyToken;

        // Act
        var result = _controller.VerificarWebhook(mode, token, challenge);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var okResult = (OkObjectResult)result;
        Assert.Equal(challenge, okResult.Value);
    }

    [Fact(DisplayName = "VerificarWebhook - Falha com token inválido")]
    public void VerificarWebhook_ComTokenInvalido_DeveRetornarForbid()
    {
        // Arrange
        var invalidToken = "wrong_token";
        var mode = "subscribe";
        var challenge = "test_challenge";

        // Act
        var result = _controller.VerificarWebhook(mode, invalidToken, challenge);

        // Assert
        Assert.IsType<ForbidResult>(result);
    }

    [Fact(DisplayName = "VerificarWebhook - Falha com modo inválido")]
    public void VerificarWebhook_ComModoInvalido_DeveRetornarForbid()
    {
        // Arrange
        var mode = "invalid_mode";
        var token = _validVerifyToken;
        var challenge = "test_challenge";

        // Act
        var result = _controller.VerificarWebhook(mode, token, challenge);

        // Assert
        Assert.IsType<ForbidResult>(result);
    }

    [Fact(DisplayName = "VerificarWebhook - Falha sem modo e token")]
    public void VerificarWebhook_SemModoEToken_DeveRetornarForbid()
    {
        // Arrange
        var mode = "";
        var token = "";
        var challenge = "test_challenge";

        // Act
        var result = _controller.VerificarWebhook(mode, token, challenge);

        // Assert
        Assert.IsType<ForbidResult>(result);
    }

    // ==================== MESSAGE RECEPTION TESTS ====================

    [Fact(DisplayName = "ReceberMensagem - Sucesso com mensagem válida")]
    public async Task ReceberMensagem_ComMensagemValida_DeveProcessarERetornarOk()
    {
        // ... (rest of Arrange)
        var telefone = "+5511999999999";
        var texto = "Olá, preciso de uma substituição";
        
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(
                                        From: telefone,
                                        Type: "text",
                                        Text: new MetaTextBody(Body: texto))
                                }))
                    })
            });

        _botService.Setup(b => b.ProcessarMensagemAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        // Verifica se o bot foi chamado (verifica fire-and-forget)
        _botService.Verify(
            b => b.ProcessarMensagemAsync(telefone, texto, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact(DisplayName = "ReceberMensagem - Ignora mensagem de tipo diferente de text")]
    public async Task ReceberMensagem_ComMensagemNaoTexto_DeveIgnorar()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(
                                        From: "+5511999999999",
                                        Type: "image",  // Tipo diferente
                                        Text: null)
                                }))
                    })
            });

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        // Bot não deve ser chamado para mensagens não-texto
        _botService.Verify(
            b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReceberMensagem - Ignora mensagem com corpo vazio")]
    public async Task ReceberMensagem_ComCorpoVazio_DeveIgnorar()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(
                                        From: "+5511999999999",
                                        Type: "text",
                                        Text: null)  // Corpo nulo
                                }))
                    })
            });

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReceberMensagem - Múltiplas mensagens válidas")]
    public async Task ReceberMensagem_ComMultiplasMensagens_DeveProcessarTodas()
    {
        // ... (rest of Arrange)
        var telefone1 = "+5511999999999";
        var texto1 = "Primeira mensagem";
        var telefone2 = "+5511988888888";
        var texto2 = "Segunda mensagem";

        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(From: telefone1, Type: "text", Text: new MetaTextBody(Body: texto1)),
                                    new MetaMessage(From: telefone2, Type: "text", Text: new MetaTextBody(Body: texto2))
                                }))
                    })
            });

        _botService.Setup(b => b.ProcessarMensagemAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(telefone1, texto1, It.IsAny<CancellationToken>()),
            Times.Once);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(telefone2, texto2, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact(DisplayName = "ReceberMensagem - Múltiplos entries com mensagens")]
    public async Task ReceberMensagem_ComMultiplosEntries_DeveProcessarTodas()
    {
        // ... (rest of Arrange)
        var telefone1 = "+5511999999999";
        var texto1 = "Mensagem no entry 1";
        var telefone2 = "+5511988888888";
        var texto2 = "Mensagem no entry 2";

        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(From: telefone1, Type: "text", Text: new MetaTextBody(Body: texto1))
                                }))
                    }),
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(From: telefone2, Type: "text", Text: new MetaTextBody(Body: texto2))
                                }))
                    })
            });

        _botService.Setup(b => b.ProcessarMensagemAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact(DisplayName = "ReceberMensagem - Ignora campo não-messages")]
    public async Task ReceberMensagem_ComCampoNaoMessages_DeveIgnorar()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messaging_product",  // Campo diferente de "messages"
                            Value: new MetaChangeValue(Messages: null))
                    })
            });

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReceberMensagem - Retorna Ok após processamento")]
    public async Task ReceberMensagem_DeveRetornarOkAposProcessamento()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(
                                        From: "+5511999999999",
                                        Type: "text",
                                        Text: new MetaTextBody(Body: "Teste"))
                                }))
                    })
            });

        // Simular delay no bot service
        _botService.Setup(b => b.ProcessarMensagemAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.Delay(10));

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
    }

    [Fact(DisplayName = "ReceberMensagem - Payload com entry vazio")]
    public async Task ReceberMensagem_ComPayloadVazio_DeveRetornarOk()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>());  // Empty entry

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReceberMensagem - Payload com changes vazio")]
    public async Task ReceberMensagem_ComChangesVazio_DeveRetornarOk()
    {
        // ... (rest of Arrange)
        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(Changes: new List<MetaChange>())  // Empty changes
            });

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact(DisplayName = "ReceberMensagem - Mensagem com telefone válido formato E.164")]
    public async Task ReceberMensagem_ComTelefoneValidoE164_DeveProcessar()
    {
        // ... (rest of Arrange)
        var telefone = "+5511987654321";  // Formato E.164 válido
        var texto = "Teste";

        var payload = new MetaWebhookPayload(
            Object: "whatsapp_business_account",
            Entry: new List<MetaEntry>
            {
                new MetaEntry(
                    Changes: new List<MetaChange>
                    {
                        new MetaChange(
                            Field: "messages",
                            Value: new MetaChangeValue(
                                Messages: new List<MetaMessage>
                                {
                                    new MetaMessage(From: telefone, Type: "text", Text: new MetaTextBody(Body: texto))
                                }))
                    })
            });

        _botService.Setup(b => b.ProcessarMensagemAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ReceberMensagem(payload);

        // Assert
        Assert.IsType<OkResult>(result);
        _botService.Verify(
            b => b.ProcessarMensagemAsync(telefone, texto, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
