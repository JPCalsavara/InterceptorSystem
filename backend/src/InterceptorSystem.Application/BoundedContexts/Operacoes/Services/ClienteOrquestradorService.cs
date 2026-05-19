using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ClienteOrquestradorService : IClienteOrquestradorService
{
    private readonly IClienteAppService _clienteService;
    private readonly IContratoAppService _contratoService;
    private readonly IPostoAppService _postoService;
    private readonly IAlocacaoAppService _alocacaoService;
    private readonly IFuncionarioAppService _funcionarioService;
    private readonly ICurrentTenantService _tenantService;
    private readonly IClienteRepository _clienteRepository;

    public ClienteOrquestradorService(
        IClienteAppService clienteService,
        IContratoAppService contratoService,
        IPostoAppService postoService,
        IAlocacaoAppService alocacaoService,
        IFuncionarioAppService funcionarioService,
        ICurrentTenantService tenantService,
        IClienteRepository clienteRepository)
    {
        _clienteService = clienteService;
        _contratoService = contratoService;
        _postoService = postoService;
        _alocacaoService = alocacaoService;
        _funcionarioService = funcionarioService;
        _tenantService = tenantService;
        _clienteRepository = clienteRepository;
    }

    public async Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(CreateClienteCompletoDtoInput input, CancellationToken ct = default)
    {
        _ = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var (valido, mensagemErro) = await ValidarCriacaoCompletaAsync(input, ct);
        if (!valido) throw new InvalidOperationException(mensagemErro);

        var unitOfWork = _clienteRepository.UnitOfWork;
        await unitOfWork.BeginTransactionAsync();
        
        try
        {
            var cliente = await _clienteService.CreateAsync(input.Cliente);

            var contratoInput = new CreateContratoDtoInput(
                cliente.Id,
                input.Contrato.Descricao,
                input.Contrato.ValorTotalMensal,
                input.Contrato.ValorDiariaCobrada,
                input.Contrato.PercentualAdicionalNoturno,
                input.Contrato.PercentualAdicionalFimSemana,
                input.Contrato.ValorBeneficiosExtrasMensal,
                input.Contrato.PercentualEncargosProvisoes,
                input.NumeroDePostos,
                input.Contrato.MargemLucroPercentual,
                input.Contrato.MargemCoberturaFaltasPercentual,
                input.Contrato.DataInicio,
                input.Contrato.DataFim,
                input.Contrato.Status,
                input.Contrato.Tags?.ToList(),
                input.Contrato.ValorDiariaVigilante
            );

            var contrato = await _contratoService.CreateAsync(contratoInput);

            var postosCriados = new List<PostoDto>();
            if (input.CriarPostosAutomaticamente && input.NumeroDePostos > 0)
            {
                var cidade = !string.IsNullOrWhiteSpace(input.Cliente.Cidade) ? input.Cliente.Cidade : "Não Informada";
                var estado = !string.IsNullOrWhiteSpace(input.Cliente.Estado) ? input.Cliente.Estado : "SP";

                var configs = input.PostoConfigs;
                if (configs is { Count: > 0 })
                {
                    for (int i = 0; i < configs.Count; i++)
                    {
                        var config = configs[i];
                        var tipoLabel = string.IsNullOrWhiteSpace(config.TipoPosto)
                            ? $"Posto {i + 1}"
                            : config.TipoPosto;

                        var postoInput = new CreatePostoInput(
                            cliente.Id,
                            $"Posto {i + 1} - {tipoLabel}",
                            "00000000",
                            "Endereço Base (A Atualizar)",
                            "S/N",
                            null,
                            cidade,
                            estado
                        );
                        var postoCriado = await _postoService.CreateAsync(postoInput);
                        postosCriados.Add(postoCriado);

                        var alocacoes = BuildAlocacoesPadrao(config, i + 1);
                        foreach (var alocacao in alocacoes)
                        {
                            await _alocacaoService.CreateAsync(new CreateAlocacaoInput
                            {
                                PostoId = postoCriado.Id,
                                ContratoId = contrato.Id,
                                HorarioInicio = alocacao.HorarioInicio,
                                HorarioFim = alocacao.HorarioFim,
                                TipoEscala = alocacao.TipoEscala,
                                PermiteDobrarEscala = alocacao.PermiteDobrarEscala,
                                QuantidadeFuncionarios = Math.Max(1, cliente.QuantidadeIdealPorTurno)
                            });
                        }
                    }
                }
                else
                {
                    for (int i = 1; i <= input.NumeroDePostos; i++)
                    {
                        string turnoLabel = i == 1 ? "Diurno" : (i == 2 ? "Noturno" : $"Turno {i}");
                        var postoInput = new CreatePostoInput(
                            cliente.Id,
                            $"Posto Base - {turnoLabel}",
                            "00000000",
                            "Endereço Base (A Atualizar)",
                            "S/N",
                            null,
                            cidade,
                            estado
                        );
                        var postoCriado = await _postoService.CreateAsync(postoInput);
                        postosCriados.Add(postoCriado);

                        var alocacao = BuildAlocacaoFallback(i);
                        await _alocacaoService.CreateAsync(new CreateAlocacaoInput
                        {
                            PostoId = postoCriado.Id,
                            ContratoId = contrato.Id,
                            HorarioInicio = alocacao.HorarioInicio,
                            HorarioFim = alocacao.HorarioFim,
                            TipoEscala = alocacao.TipoEscala,
                            PermiteDobrarEscala = alocacao.PermiteDobrarEscala,
                            QuantidadeFuncionarios = Math.Max(1, cliente.QuantidadeIdealPorTurno)
                        });
                    }
                }
            }

            var funcionariosCriados = new List<FuncionarioDtoOutput>();
            if (input.Funcionarios is { Count: > 0 })
            {
                foreach (var funcionario in input.Funcionarios)
                {
                    var funcInput = funcionario with { ClienteId = cliente.Id, ContratoId = contrato.Id };
                    var func = await _funcionarioService.CreateAsync(funcInput, ct);
                    funcionariosCriados.Add(func);
                }
            }

            await unitOfWork.CommitTransactionAsync();

            return new ClienteCompletoDtoOutput(
                cliente,
                contrato,
                postosCriados,
                funcionariosCriados
            );
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackTransactionAsync();
            throw new InvalidOperationException($"Erro ao criar cliente completo: {ex.Message}", ex);
        }
    }

    public Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateClienteCompletoDtoInput input, CancellationToken ct = default)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        if (input.Contrato.DataInicio < hoje)
            return Task.FromResult<(bool, string?)>((false, "Data de início do contrato não pode ser no passado."));

        if (input.Contrato.DataFim <= input.Contrato.DataInicio)
            return Task.FromResult<(bool, string?)>((false, "Data de fim do contrato deve ser posterior à data de início."));

        if (input.NumeroDePostos < 1)
            return Task.FromResult<(bool, string?)>((false, "O número de alocações (postos/turnos) deve ser maior que zero."));

        if (input.PostoConfigs is { Count: > 0 })
        {
            foreach (var config in input.PostoConfigs)
            {
                if (config.QuantidadeAlocacoes <= 0)
                    return Task.FromResult<(bool, string?)>((false, "QuantidadeAlocacoes deve ser maior que zero em todos os postoConfigs."));

                if (config.QuantidadeFuncionariosPorAlocacao <= 0)
                    return Task.FromResult<(bool, string?)>((false, "QuantidadeFuncionariosPorAlocacao deve ser maior que zero em todos os postoConfigs."));

                if (config.AlocacoesNoturnas < 0)
                    return Task.FromResult<(bool, string?)>((false, "AlocacoesNoturnas não pode ser negativo em postoConfigs."));

                if (config.Horarios is { Count: > 0 })
                {
                    if (config.Horarios.Count != config.QuantidadeAlocacoes)
                        return Task.FromResult<(bool, string?)>((false, "Quando informado, Horarios deve ter a mesma quantidade de itens de QuantidadeAlocacoes."));

                    foreach (var horario in config.Horarios)
                    {
                        var duracao = horario.HorarioFim > horario.HorarioInicio
                            ? horario.HorarioFim - horario.HorarioInicio
                            : TimeSpan.FromHours(24) - (horario.HorarioInicio - horario.HorarioFim);

                        if (duracao < TimeSpan.FromHours(4) || duracao > TimeSpan.FromHours(12))
                            return Task.FromResult<(bool, string?)>((false, "Cada horário deve ter entre 4 e 12 horas de duração."));
                    }
                }
            }
        }

        return Task.FromResult<(bool, string?)>((true, null));
    }

    private static IReadOnlyList<AlocacaoPadrao> BuildAlocacoesPadrao(CreatePostoConfigInput config, int postoIndex)
    {
        var quantidade = Math.Max(config.QuantidadeAlocacoes, 1);

        if (config.Horarios is { Count: > 0 })
        {
            return config.Horarios
                .Take(quantidade)
                .Select(h => ResolveAlocacao(config.TipoPosto, h.IsNoturna, 0, postoIndex, h.HorarioInicio, h.HorarioFim))
                .ToList();
        }

        var alocacoes = new List<AlocacaoPadrao>(quantidade);

        for (int i = 0; i < quantidade; i++)
        {
            var isNoturna = i < config.AlocacoesNoturnas;
            alocacoes.Add(ResolveAlocacao(config.TipoPosto, isNoturna, i, postoIndex));
        }

        return alocacoes;
    }

    private static AlocacaoPadrao BuildAlocacaoFallback(int postoIndex)
    {
        var isNoturna = postoIndex % 2 == 0;
        return ResolveAlocacao("ESCALA_12X36", isNoturna, 0, postoIndex);
    }

    private static AlocacaoPadrao ResolveAlocacao(
        string? tipoPosto,
        bool isNoturna,
        int indiceAlocacao,
        int postoIndex,
        TimeSpan? horarioInicioCustom = null,
        TimeSpan? horarioFimCustom = null)
    {
        if (horarioInicioCustom.HasValue && horarioFimCustom.HasValue)
        {
            return new AlocacaoPadrao(
                horarioInicioCustom.Value,
                horarioFimCustom.Value,
                ResolveTipoEscala(tipoPosto),
                string.Equals((tipoPosto ?? string.Empty).Trim(), "ESCALA_12X36_DUPLA", StringComparison.OrdinalIgnoreCase) ||
                string.Equals((tipoPosto ?? string.Empty).Trim(), "ESCALA_24H_UNICO", StringComparison.OrdinalIgnoreCase)
            );
        }

        var tipo = (tipoPosto ?? string.Empty).Trim().ToUpperInvariant();
        return tipo switch
        {
            "ESCALA_12X36" => isNoturna
                ? new AlocacaoPadrao(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, false)
                : new AlocacaoPadrao(new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, false),

            "ESCALA_12X36_DUPLA" => isNoturna
                ? new AlocacaoPadrao(new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, true)
                : new AlocacaoPadrao(new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, true),

            "ESCALA_8H_3TURNOS" => isNoturna
                ? new AlocacaoPadrao(new TimeSpan(22, 0, 0), new TimeSpan(6, 0, 0), TipoEscala.OITO_HORAS_SEIS_POR_DOIS, false)
                : indiceAlocacao % 2 == 0
                    ? new AlocacaoPadrao(new TimeSpan(6, 0, 0), new TimeSpan(14, 0, 0), TipoEscala.OITO_HORAS_SEIS_POR_DOIS, false)
                    : new AlocacaoPadrao(new TimeSpan(14, 0, 0), new TimeSpan(22, 0, 0), TipoEscala.OITO_HORAS_SEIS_POR_DOIS, false),

            "ESCALA_5X2_DIURNO" or "ESCALA_5X2" =>
                new AlocacaoPadrao(new TimeSpan(6, 0, 0), new TimeSpan(14, 0, 0), TipoEscala.SEMANAL_COMERCIAL, false),

            "ESCALA_24H_UNICO" => new AlocacaoPadrao(new TimeSpan(0, 0, 0), new TimeSpan(12, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, true),

            _ => (isNoturna || postoIndex % 2 == 0)
                ? new AlocacaoPadrao(new TimeSpan(22, 0, 0), new TimeSpan(6, 0, 0), TipoEscala.OITO_HORAS_SEIS_POR_DOIS, false)
                : new AlocacaoPadrao(new TimeSpan(8, 0, 0), new TimeSpan(16, 0, 0), TipoEscala.OITO_HORAS_SEIS_POR_DOIS, false)
        };
    }

    private static TipoEscala ResolveTipoEscala(string? tipoPosto)
    {
        var tipo = (tipoPosto ?? string.Empty).Trim().ToUpperInvariant();
        return tipo switch
        {
            "ESCALA_5X2_DIURNO" or "ESCALA_5X2" => TipoEscala.SEMANAL_COMERCIAL,
            "ESCALA_8H_3TURNOS" => TipoEscala.OITO_HORAS_SEIS_POR_DOIS,
            _ => TipoEscala.DOZE_POR_TRINTA_SEIS
        };
    }

    private sealed record AlocacaoPadrao(
        TimeSpan HorarioInicio,
        TimeSpan HorarioFim,
        TipoEscala TipoEscala,
        bool PermiteDobrarEscala);
}
