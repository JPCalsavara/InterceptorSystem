using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs
{
    /// <summary>
    /// DTO para criação de múltiplas diárias em lote
    /// Usado para criar diárias automáticas ao cadastrar funcionário
    /// </summary>
    public record CreateDiariasBatchDtoInput(
        List<CreateDiariaDtoInput> Diarias
    );
}
