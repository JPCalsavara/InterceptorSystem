using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Condominio : Entity, IAggregateRoot
{
    public string Nome { get; private set; }
    public string Cnpj { get; private set; }
    public string Endereco { get; private set; }
    public bool Ativo { get; private set; }

    // Construtor vazio para o EF Core
    protected Condominio() { }

    // Construtor Rico
    public Condominio(Guid empresaId, string nome, string cnpj, string endereco)
    {
        CheckRule(empresaId == Guid.Empty, "O Condomínio deve pertencer a uma empresa.");
        CheckRule(string.IsNullOrWhiteSpace(nome), "O nome do condomínio é obrigatório.");
        CheckRule(string.IsNullOrWhiteSpace(cnpj), "O CNPJ é obrigatório.");

        EmpresaId = empresaId;
        Nome = nome;
        Cnpj = cnpj;
        Endereco = endereco;
        Ativo = true;
    }

    public void AtualizarDados(string novoNome, string novoEndereco)
    {
        CheckRule(string.IsNullOrWhiteSpace(novoNome), "Nome é obrigatório.");
        Nome = novoNome;
        Endereco = novoEndereco;
    }
    
    public void Desativar()
    {
        Ativo = false;
    }
}

