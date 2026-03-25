using InterceptorSystem.Domain.BoundedContexts.Auth.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Auth.DTOs;

public record RegistrarContaDtoInput(
    string Email,
    string Senha,
    string NomeEmpresa,
    string? Cnpj = null
);

public record LoginDtoInput(
    string Email,
    string Senha
);

public record AuthResultDtoOutput(
    Guid EmpresaId,
    string NomeEmpresa,
    string Email,
    PlanoAssinatura Plano,
    string Token,
    bool EmailVerificado
);

public record ContaPerfilDtoOutput(
    Guid EmpresaId,
    string NomeEmpresa,
    string Email,
    string? Cnpj,
    string Plano,
    DateTime CreatedAt
);

public record AtualizarContaDtoInput(
    string? NomeEmpresa,
    string? Email,
    string? SenhaAtual,
    string? NovaSenha
);

public record SolicitarResetSenhaDtoInput(string Email);

public record ConfirmarResetSenhaDtoInput(string Token, string NovaSenha);

public record SolicitarAlteracaoEmailDtoInput(string NovoEmail);

public record ConfirmarTokenDtoInput(string Token);
