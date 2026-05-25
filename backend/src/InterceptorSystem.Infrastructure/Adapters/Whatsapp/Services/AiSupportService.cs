using System.Net.Http.Json;
using InterceptorSystem.Application.BoundedContexts.Whatsapp.Interfaces;

namespace InterceptorSystem.Infrastructure.Adapters.Whatsapp.Services;

public class AiSupportService : IAiSupportPort
{
    private readonly HttpClient _httpClient;

    public AiSupportService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> ProcessSupportMessageAsync(string telefone, Guid tenantId, string message, CancellationToken ct = default)
    {
        var payload = new 
        {
            phone_number = telefone,
            tenant_id = tenantId.ToString(),
            message = message
        };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync("/api/support/", payload, ct);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<AiSupportResponse>(cancellationToken: ct);
            return result?.Reply ?? "Desculpe, a IA retornou uma resposta vazia.";
        }
        catch (Exception ex)
        {
            // Logar exceção de rede
            return "Desculpe, no momento nossos serviços de suporte inteligente estão fora do ar. Tente mais tarde.";
        }
    }

    private class AiSupportResponse 
    {
        public string Reply { get; set; } = string.Empty;
    }
}
