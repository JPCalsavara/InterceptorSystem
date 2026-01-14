using InterceptorSystem.Application.Modulos.Administrativo.DTOs;

namespace InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

/// <summary>
/// FASE 5: Serviço orquestrador para criação em cascata
/// Responsável por coordenar a criação de Condomínio, Contrato e Postos de Trabalho
/// </summary>
public interface ICondominioOrquestradorService
{
    /// <summary>
    /// Cria um condomínio completo com contrato e postos de trabalho automaticamente
    /// </summary>
    Task<CondominioCompletoDtoOutput> CriarCondominioCompletoAsync(CreateCondominioCompletoDtoInput input);
    
    /// <summary>
    /// Valida se é possível criar um condomínio completo com os dados fornecidos
    /// </summary>
    Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateCondominioCompletoDtoInput input);
}

