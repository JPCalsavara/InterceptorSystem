using System;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Enums;

namespace InterceptorSystem.Application.BoundedContexts.Whatsapp.DTOs;

public record SessaoWhatsappDto(
    Guid Id,
    string Telefone,
    Guid ContaId,
    EstadoConversa Estado,
    Guid? ClienteIdSelecionado,
    Guid? PostoIdSelecionado,
    DateOnly? DataSelecionada,
    Guid? DiariaIdParaSubstituir,
    Guid? FuncionarioSubstitutoId,
    DateTime CriadoEm,
    DateTime UltimaAtividade
);
