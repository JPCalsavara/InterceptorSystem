using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Enums;

namespace InterceptorSystem.Domain.BoundedContexts.Whatsapp.Aggregates;

/// <summary>
/// Persiste o estado da conversa do bot WhatsApp para um número de telefone.
/// Não herda de Entity para não ser filtrada pelo global query filter de tenant.
/// ContaId corresponde ao EmpresaId do tenant identificado pelo telefone.
/// </summary>
public class SessaoWhatsapp
{
    public Guid Id { get; private set; }

    /// <summary>Número de telefone no formato E.164 (ex: +5511999999999).</summary>
    public string Telefone { get; private set; } = null!;

    /// <summary>Id da Conta associada ao telefone (= EmpresaId do tenant).</summary>
    public Guid ContaId { get; private set; }

    public EstadoConversa Estado { get; private set; }

    // Seleções acumuladas durante o fluxo
    public Guid? ClienteIdSelecionado { get; private set; }
    public Guid? PostoIdSelecionado { get; private set; }
    public DateOnly? DataSelecionada { get; private set; }
    public Guid? DiariaIdParaSubstituir { get; private set; }
    public Guid? FuncionarioSubstitutoId { get; private set; }

    /// <summary>
    /// JSON com as opções numeradas exibidas ao usuário na última mensagem.
    /// Formato: [{"numero":1,"id":"...","descricao":"..."}]
    /// Permite mapear a resposta numérica do usuário de volta ao Guid correto.
    /// </summary>
    public string? OpcoesCacheJson { get; private set; }

    public DateTime CriadoEm { get; private set; }
    public DateTime UltimaAtividade { get; private set; }

    // Construtor vazio para o EF Core
    protected SessaoWhatsapp() { }

    public SessaoWhatsapp(string telefone, Guid contaId)
    {
        Id = Guid.NewGuid();
        Telefone = telefone;
        ContaId = contaId;
        Estado = EstadoConversa.AguardandoAcao;
        CriadoEm = DateTime.UtcNow;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void TransicionarPara(EstadoConversa novoEstado, string? opcoesCacheJson = null)
    {
        Estado = novoEstado;
        OpcoesCacheJson = opcoesCacheJson;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void SelecionarCliente(Guid id)
    {
        ClienteIdSelecionado = id;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void SelecionarPosto(Guid id)
    {
        PostoIdSelecionado = id;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void SelecionarData(DateOnly data)
    {
        DataSelecionada = data;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void SelecionarDiariaParaSubstituir(Guid id)
    {
        DiariaIdParaSubstituir = id;
        UltimaAtividade = DateTime.UtcNow;
    }

    public void SelecionarSubstituto(Guid id)
    {
        FuncionarioSubstitutoId = id;
        UltimaAtividade = DateTime.UtcNow;
    }

    public bool EstaExpirada(int timeoutMinutos = 15) =>
        DateTime.UtcNow > UltimaAtividade.AddMinutes(timeoutMinutos);
}
