using System.Net;
using System.Text.Json;
using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Api.Middleware;

/// <summary>
/// SEC-5: Middleware global de tratamento de exceções.
/// Mapeia exceções de domínio para códigos HTTP apropriados em vez de retornar 500 para tudo.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            DomainException ex => (HttpStatusCode.BadRequest, ex.Message),
            InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
            KeyNotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
            UnauthorizedAccessException ex => (HttpStatusCode.Unauthorized, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "Ocorreu um erro interno no servidor.")
        };

        // Log apenas erros inesperados (5xx) como Error; erros de negócio (4xx) como Warning
        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Erro não tratado: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Erro de negócio ({StatusCode}): {Message}", (int)statusCode, exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = JsonSerializer.Serialize(new
        {
            error = message,
            statusCode = (int)statusCode
        });

        await context.Response.WriteAsync(response);
    }
}
