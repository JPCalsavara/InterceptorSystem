using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

/// <summary>
/// FASE 5: DTO para criação completa de Condomínio com Contrato e Postos
/// </summary>
public record CreateCondominioCompletoDtoInput(
    CreateCondominioDtoInput Condominio,
    CreateContratoCompletoDtoInput Contrato,
    bool CriarPostosAutomaticamente = true,
    int NumeroDePostos = 2  // Padrão: 2 turnos (diurno e noturno)
);

/// <summary>
/// DTO simplificado para criação de contrato (sem CondominioId que será preenchido automaticamente)
/// </summary>
public record CreateContratoCompletoDtoInput(
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    int QuantidadeFuncionarios,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status
);

/// <summary>
/// DTO de saída com todas as entidades criadas
/// </summary>
public record CondominioCompletoDtoOutput(
    CondominioDtoOutput Condominio,
    ContratoDtoOutput Contrato,
    IEnumerable<PostoDeTrabalhoDto> Postos
);

