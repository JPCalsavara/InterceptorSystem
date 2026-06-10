using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using System;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;

public record DiariaSubstituicaoDto(
    Guid NovaDiariaId,
    DateOnly Data,
    Guid FuncionarioSubstitutoId,
    string FuncionarioSubstitutoNome,
    Guid? DiariaSubstituidaId,
    Guid? FuncionarioOriginalId,
    string? FuncionarioOriginalNome,
    Guid PostoId,
    string PostoNome,
    string OrigemModificacao,
    DateTimeOffset DataHoraModificacao
);
