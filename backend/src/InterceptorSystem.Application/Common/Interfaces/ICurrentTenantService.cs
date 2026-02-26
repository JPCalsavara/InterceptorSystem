namespace InterceptorSystem.Application.Common.Interfaces;

public interface ICurrentTenantService
{
    // O ID da Empresa (Tenant) que está fazendo a requisição.
    // É nullable (?) porque pode haver requisições anônimas (ex: Login, Webhooks).
    Guid? EmpresaId { get; }

    // O ID do Usuário logado (útil para auditoria: "Quem criou este registro?").
    string? UsuarioId { get; }
}