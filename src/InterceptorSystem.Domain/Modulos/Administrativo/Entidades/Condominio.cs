using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Condominio : Entity, IAggregateRoot
{
    public string Nome { get; private set; }
    public string Cnpj { get; private set; } // Poderia ser um Value Object depois
    public string Endereco { get; private set; }
    public bool Ativo { get; private set; }

    // O Condomínio "Protege" seus postos. A lista é somente leitura para fora.
    private readonly List<PostoDeTrabalho> _postos = new();
    public IReadOnlyCollection<PostoDeTrabalho> Postos => _postos.AsReadOnly();

    // Construtor vazio para o EF Core (obrigatório)
    protected Condominio() { }

    // Construtor Rico: Garante que o objeto nasça válido
    public Condominio(Guid empresaId, string nome, string cnpj, string endereco)
    {
        // Validações básicas (Guard Clauses)
        CheckRule(empresaId == Guid.Empty, "O Condomínio deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "O nome do condomínio é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cnpj), "O CNPJ é obrigatório.");

        EmpresaId = empresaId; // Define o dono do dado
        Nome = nome;
        Cnpj = cnpj;
        Endereco = endereco;
        Ativo = true;
    }

    // Comportamento de Negócio: Adicionar Posto
    public void AdicionarPosto(string descricao, TimeSpan inicio, TimeSpan fim)
    {
        // Regra: Não duplicar posto com mesmo nome
        if (_postos.Any(x => x.Descricao == descricao))
            throw new InvalidOperationException($"O posto '{descricao}' já existe neste condomínio.");

        var novoPosto = new PostoDeTrabalho(Id, EmpresaId, descricao, inicio, fim);
        _postos.Add(novoPosto);
    }
    
    // Adicione este método na classe Condominio
    public void AtualizarDados(string novoNome, string novoEndereco)
    {
        CheckRule(string.IsNullOrWhiteSpace(novoNome), "Nome é obrigatório.");
        // Aqui você poderia validar regras, ex: "Não pode mudar nome se tiver contrato ativo"
    
        Nome = novoNome;
        Endereco = novoEndereco;
    }
    
    public void Desativar()
    {
        Ativo = false;
        // Aqui poderia disparar um evento: AddDomainEvent(new CondominioDesativadoEvent(Id));
    }
}