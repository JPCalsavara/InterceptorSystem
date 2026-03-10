using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

/// <summary>
/// FASE 5: DTO para criação completa de Cliente com Contrato e Postos
/// </summary>
public record CreateClienteCompletoDtoInput(
    CreateClienteDtoInput Cliente,
    CreateContratoCompletoDtoInput Contrato,
    bool CriarPostosAutomaticamente = true,
    int NumeroDePostos = 2  // Padrão: 2 turnos (diurno e noturno)
);

/// <summary>
/// DTO simplificado para criação de contrato (sem ClienteId que será preenchido automaticamente)
/// QuantidadeFuncionarios será calculado como: QuantidadeIdealPorTurno × NumeroDePostos
/// </summary>
public record CreateContratoCompletoDtoInput(
    string Descricao,
    decimal ValorTotalMensal,
    decimal ValorDiariaCobrada,
    decimal PercentualAdicionalNoturno,
    decimal ValorBeneficiosExtrasMensal,
    decimal PercentualImpostos,
    decimal MargemLucroPercentual,
    decimal MargemCoberturaFaltasPercentual,
    DateOnly DataInicio,
    DateOnly DataFim,
    StatusContrato Status,
    decimal? ValorDiariaVigilante = null
);

/// <summary>
/// DTO de saída com todas as entidades criadas
/// </summary>
public record ClienteCompletoDtoOutput(
    ClienteDtoOutput Cliente,
    ContratoDtoOutput Contrato,
    IEnumerable<PostoDto> Postos
);

