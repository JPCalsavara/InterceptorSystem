using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs
{
    /// <summary>
    /// DTO para criação de múltiplas diárias em lote
    /// Usado para criar diárias automáticas ao cadastrar funcionário
    /// </summary>
    public record CreateDiariasBatchDtoInput(
        List<CreateDiariaDtoInput> Diarias
    );
}
