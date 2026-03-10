using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

/// <summary>
/// FASE 5: Serviço orquestrador para criação em cascata
/// Responsável por coordenar a criação de Cliente, Contrato e Postos de Trabalho
/// </summary>
public interface IClienteOrquestradorService
{
    /// <summary>
    /// Cria um cliente completo com contrato e postos de trabalho automaticamente
    /// </summary>
    Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(CreateClienteCompletoDtoInput input);
    
    /// <summary>
    /// Valida se é possível criar um cliente completo com os dados fornecidos
    /// </summary>
    Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateClienteCompletoDtoInput input);
}

