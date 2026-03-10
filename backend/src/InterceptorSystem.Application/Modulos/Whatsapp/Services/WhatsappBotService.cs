using System.Text;
using System.Text.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Application.Modulos.Whatsapp.Interfaces;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Auth.Interfaces;
using InterceptorSystem.Domain.Modulos.Whatsapp.Entidades;
using InterceptorSystem.Domain.Modulos.Whatsapp.Enums;
using InterceptorSystem.Domain.Modulos.Whatsapp.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterceptorSystem.Application.Modulos.Whatsapp.Services;

public class WhatsappBotService : IWhatsappBotService
{
    private readonly ISessaoWhatsappRepository _sessoes;
    private readonly IContaRepository _contas;
    private readonly ICurrentTenantService _tenantService;
    private readonly IClienteRepository _clientes;
    private readonly IPostoRepository _postos;
    private readonly IDiariaAppService _diarias;
    private readonly SubstitutoRankerService _ranker;
    private readonly IWhatsappMessageSender _sender;
    private readonly int _sessaoTimeoutMinutos;

    public WhatsappBotService(
        ISessaoWhatsappRepository sessoes,
        IContaRepository contas,
        ICurrentTenantService tenantService,
        IClienteRepository clientes,
        IPostoRepository postos,
        IDiariaAppService diarias,
        SubstitutoRankerService ranker,
        IWhatsappMessageSender sender,
        IConfiguration configuration)
    {
        _sessoes = sessoes;
        _contas = contas;
        _tenantService = tenantService;
        _clientes = clientes;
        _postos = postos;
        _diarias = diarias;
        _ranker = ranker;
        _sender = sender;
        _sessaoTimeoutMinutos = int.Parse(
            configuration["WhatsappBot:SessaoTimeoutMinutos"] ?? "15");
    }

    public async Task ProcessarMensagemAsync(string telefone, string texto,
        CancellationToken ct = default)
    {
        texto = texto.Trim();

        // --- Verificar se o telefone está vinculado a uma Conta verificada ---
        var conta = await _contas.GetByTelefoneVerificadoAsync(telefone);
        if (conta is null)
        {
            await _sender.EnviarTextoAsync(telefone,
                "Número não autorizado.\n\nAcesse o painel web, vá em *Conta > WhatsApp* e cadastre este número para ter acesso.", ct);
            return;
        }

        // Define o tenant para todas as app services que dependem de ICurrentTenantService
        _tenantService.SetEmpresaId(conta.Id);

        // --- Recuperar ou criar sessão ---
        var sessao = await _sessoes.GetByTelefoneAsync(telefone);

        if (sessao is null || sessao.EstaExpirada(_sessaoTimeoutMinutos))
        {
            if (sessao is not null) _sessoes.Remove(sessao);
            sessao = new SessaoWhatsapp(telefone, conta.Id);
            _sessoes.Add(sessao);
            await _sessoes.UnitOfWork.CommitAsync();
            await EnviarListaClientesAsync(sessao, ct);
            return;
        }

        // --- Atalho global de cancelamento ---
        if (texto.ToLower() is "0" or "cancelar" or "sair" or "cancel")
        {
            _sessoes.Remove(sessao);
            await _sessoes.UnitOfWork.CommitAsync();
            await _sender.EnviarTextoAsync(telefone, "Operação cancelada. Até logo! 👋", ct);
            return;
        }

        await RotearEstadoAsync(sessao, texto, ct);
    }

    // -----------------------------------------------------------------------
    private async Task RotearEstadoAsync(SessaoWhatsapp sessao, string texto,
        CancellationToken ct)
    {
        switch (sessao.Estado)
        {
            case EstadoConversa.AguardandoCliente:
                await ProcessarEscolhaClienteAsync(sessao, texto, ct);
                break;
            case EstadoConversa.AguardandoPosto:
                await ProcessarEscolhaPostoAsync(sessao, texto, ct);
                break;
            case EstadoConversa.AguardandoData:
                await ProcessarEscolhaDataAsync(sessao, texto, ct);
                break;
            case EstadoConversa.AguardandoFuncionarioSubstituido:
                await ProcessarEscolhaFuncionarioSubstituidoAsync(sessao, texto, ct);
                break;
            case EstadoConversa.AguardandoFuncionarioSubstituto:
                await ProcessarEscolhaFuncionarioSubstitutoAsync(sessao, texto, ct);
                break;
            case EstadoConversa.AguardandoConfirmacao:
                await ProcessarConfirmacaoAsync(sessao, texto, ct);
                break;
            default:
                // Sessão em estado terminal — reiniciar
                _sessoes.Remove(sessao);
                var novaSessao = new SessaoWhatsapp(sessao.Telefone, sessao.ContaId);
                _sessoes.Add(novaSessao);
                await _sessoes.UnitOfWork.CommitAsync();
                await EnviarListaClientesAsync(novaSessao, ct);
                break;
        }
    }

    // -----------------------------------------------------------------------
    private async Task EnviarListaClientesAsync(SessaoWhatsapp sessao,
        CancellationToken ct)
    {
        var lista = (await _clientes.GetAllAsync()).ToList();
        if (!lista.Any())
        {
            await _sender.EnviarTextoAsync(sessao.Telefone,
                "Nenhum cliente cadastrado. Acesse o painel web para criar.", ct);
            return;
        }

        var opcoes = lista.Select((c, i) => new OpcaoBot(i + 1, c.Id, c.Nome)).ToList();
        var cache = JsonSerializer.Serialize(opcoes);
        sessao.TransicionarPara(EstadoConversa.AguardandoCliente, cache);
        await _sessoes.UnitOfWork.CommitAsync();

        var sb = new StringBuilder("Olá! Qual cliente deseja gerenciar?\n\n");
        foreach (var o in opcoes) sb.AppendLine($"{o.Numero}. {o.Descricao}");
        sb.AppendLine("\n0. Cancelar");
        await _sender.EnviarTextoAsync(sessao.Telefone, sb.ToString(), ct);
    }

    private async Task ProcessarEscolhaClienteAsync(SessaoWhatsapp sessao,
        string texto, CancellationToken ct)
    {
        var id = ResolverOpcao(sessao.OpcoesCacheJson, texto);
        if (id is null)
        {
            await _sender.EnviarTextoAsync(sessao.Telefone, "Opção inválida. Digite o número da lista.", ct);
            return;
        }

        sessao.SelecionarCliente(id.Value);

        var todosPosots = await _postos.GetAllAsync();
        var postos = todosPosots.Where(p => p.ClienteId == id.Value).ToList();

        if (!postos.Any())
        {
            await _sender.EnviarTextoAsync(sessao.Telefone,
                "Nenhum posto de trabalho cadastrado para este cliente.", ct);
            return;
        }

        var opcoes = postos.Select((p, i) =>
            new OpcaoBot(i + 1, p.Id,
                $"{p.Nome} - {p.Cidade}")).ToList();

        sessao.TransicionarPara(EstadoConversa.AguardandoPosto,
            JsonSerializer.Serialize(opcoes));
        await _sessoes.UnitOfWork.CommitAsync();

        var sb = new StringBuilder("Qual posto de trabalho?\n\n");
        foreach (var o in opcoes) sb.AppendLine($"{o.Numero}. {o.Descricao}");
        sb.AppendLine("\n0. Cancelar");
        await _sender.EnviarTextoAsync(sessao.Telefone, sb.ToString(), ct);
    }

    private async Task ProcessarEscolhaPostoAsync(SessaoWhatsapp sessao,
        string texto, CancellationToken ct)
    {
        var id = ResolverOpcao(sessao.OpcoesCacheJson, texto);
        if (id is null)
        {
            await _sender.EnviarTextoAsync(sessao.Telefone, "Opção inválida.", ct);
            return;
        }

        sessao.SelecionarPosto(id.Value);
        sessao.TransicionarPara(EstadoConversa.AguardandoData);
        await _sessoes.UnitOfWork.CommitAsync();

        await _sender.EnviarTextoAsync(sessao.Telefone,
            "Informe a data da substituição no formato *DD/MM/AAAA*\n\nExemplo: 15/07/2025\n\n0. Cancelar", ct);
    }

    private async Task ProcessarEscolhaDataAsync(SessaoWhatsapp sessao,
        string texto, CancellationToken ct)
    {
        if (!DateOnly.TryParseExact(texto, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var data))
        {
            await _sender.EnviarTextoAsync(sessao.Telefone,
                "Formato inválido. Use *DD/MM/AAAA* (ex: 15/07/2025).", ct);
            return;
        }

        sessao.SelecionarData(data);

        var diarias = (await _diarias.GetByPostoEDataAsync(
            sessao.PostoIdSelecionado!.Value, data)).ToList();

        if (!diarias.Any())
        {
            await _sender.EnviarTextoAsync(sessao.Telefone,
                $"Nenhuma diária ativa encontrada em {data:dd/MM/yyyy} para o posto selecionado.\n\nDigite qualquer coisa para reiniciar.", ct);
            sessao.TransicionarPara(EstadoConversa.Cancelada);
            await _sessoes.UnitOfWork.CommitAsync();
            return;
        }

        var opcoes = diarias.Select((a, i) =>
            new OpcaoBot(i + 1, a.Id,
                $"{a.NomeFuncionario} — {FormatarTipo(a.TipoDiaria)}")).ToList();

        sessao.TransicionarPara(EstadoConversa.AguardandoFuncionarioSubstituido,
            JsonSerializer.Serialize(opcoes));
        await _sessoes.UnitOfWork.CommitAsync();

        var sb = new StringBuilder($"Diárias em {data:dd/MM/yyyy}. Quem será *substituído*?\n\n");
        foreach (var o in opcoes) sb.AppendLine($"{o.Numero}. {o.Descricao}");
        sb.AppendLine("\n0. Cancelar");
        await _sender.EnviarTextoAsync(sessao.Telefone, sb.ToString(), ct);
    }

    private async Task ProcessarEscolhaFuncionarioSubstituidoAsync(
        SessaoWhatsapp sessao, string texto, CancellationToken ct)
    {
        var diariaId = ResolverOpcao(sessao.OpcoesCacheJson, texto);
        if (diariaId is null)
        {
            await _sender.EnviarTextoAsync(sessao.Telefone, "Opção inválida.", ct);
            return;
        }

        sessao.SelecionarDiariaParaSubstituir(diariaId.Value);

        var substitutos = (await _ranker.ObterSubstitutosRankeadosAsync(
            sessao.ClienteIdSelecionado!.Value,
            sessao.DataSelecionada!.Value)).ToList();

        if (!substitutos.Any())
        {
            await _sender.EnviarTextoAsync(sessao.Telefone,
                "Nenhum funcionário disponível para esta data.\n\nDigite qualquer coisa para reiniciar.", ct);
            sessao.TransicionarPara(EstadoConversa.Cancelada);
            await _sessoes.UnitOfWork.CommitAsync();
            return;
        }

        var opcoes = substitutos.Select((f, i) =>
            new OpcaoBot(i + 1, f.Id,
                $"{f.Nome} ({f.TipoEscala}) — Disponib.: {f.IndicadorDisponibilidade}")).ToList();

        sessao.TransicionarPara(EstadoConversa.AguardandoFuncionarioSubstituto,
            JsonSerializer.Serialize(opcoes));
        await _sessoes.UnitOfWork.CommitAsync();

        var sb = new StringBuilder("Selecione o *substituto*:\n\n");
        foreach (var o in opcoes) sb.AppendLine($"{o.Numero}. {o.Descricao}");
        sb.AppendLine("\n0. Cancelar");
        await _sender.EnviarTextoAsync(sessao.Telefone, sb.ToString(), ct);
    }

    private async Task ProcessarEscolhaFuncionarioSubstitutoAsync(
        SessaoWhatsapp sessao, string texto, CancellationToken ct)
    {
        var funcionarioId = ResolverOpcao(sessao.OpcoesCacheJson, texto);
        if (funcionarioId is null)
        {
            await _sender.EnviarTextoAsync(sessao.Telefone, "Opção inválida.", ct);
            return;
        }

        sessao.SelecionarSubstituto(funcionarioId.Value);
        sessao.TransicionarPara(EstadoConversa.AguardandoConfirmacao);
        await _sessoes.UnitOfWork.CommitAsync();

        await _sender.EnviarTextoAsync(sessao.Telefone,
            $"Confirmar substituição em *{sessao.DataSelecionada:dd/MM/yyyy}*?\n\n1. ✅ Confirmar\n0. ❌ Cancelar", ct);
    }

    private async Task ProcessarConfirmacaoAsync(SessaoWhatsapp sessao,
        string texto, CancellationToken ct)
    {
        if (texto != "1")
        {
            _sessoes.Remove(sessao);
            await _sessoes.UnitOfWork.CommitAsync();
            await _sender.EnviarTextoAsync(sessao.Telefone, "Operação cancelada.", ct);
            return;
        }

        // 1. Cancelar diária original
        await _diarias.UpdateStatusAsync(
            sessao.DiariaIdParaSubstituir!.Value,
            StatusDiaria.CANCELADA);

        // 2. Obter AlocacaoId da diária original (Posto é localização, Alocação é o slot de turno)
        var diariaOriginal = await _diarias.GetByIdAsync(sessao.DiariaIdParaSubstituir!.Value);

        // 3. Criar nova diária do tipo SUBSTITUICAO na mesma Alocação
        await _diarias.CreateAsync(new CreateDiariaDtoInput(
            sessao.FuncionarioSubstitutoId!.Value,
            diariaOriginal!.AlocacaoId,
            sessao.DataSelecionada!.Value,
            StatusDiaria.CONFIRMADA,
            TipoDiaria.SUBSTITUICAO));

        sessao.TransicionarPara(EstadoConversa.Concluida);
        _sessoes.Remove(sessao);
        await _sessoes.UnitOfWork.CommitAsync();

        await _sender.EnviarTextoAsync(sessao.Telefone,
            $"✅ Substituição realizada com sucesso em *{sessao.DataSelecionada:dd/MM/yyyy}*!\n\nEnvie qualquer mensagem para iniciar uma nova operação.", ct);
    }

    // -----------------------------------------------------------------------

    private static Guid? ResolverOpcao(string? cacheJson, string texto)
    {
        if (string.IsNullOrEmpty(cacheJson) || !int.TryParse(texto, out var num))
            return null;

        var opcoes = JsonSerializer.Deserialize<List<OpcaoBot>>(cacheJson);
        return opcoes?.FirstOrDefault(o => o.Numero == num)?.Id;
    }

    private static string FormatarTipo(TipoDiaria tipo) => tipo switch
    {
        TipoDiaria.REGULAR => "Regular",
        TipoDiaria.DOBRA_PROGRAMADA => "Dobra",
        TipoDiaria.SUBSTITUICAO => "Substituição",
        _ => tipo.ToString()
    };
}

internal record OpcaoBot(int Numero, Guid Id, string Descricao);
