using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs
{
    /// <summary>
    /// DTO para criação de múltiplas alocações em lote
    /// Usado para criar alocações automáticas ao cadastrar funcionário
    /// </summary>
    public record CreateAlocacoesBatchDtoInput(
        List<CreateAlocacaoDtoInput> Alocacoes
    );
}
